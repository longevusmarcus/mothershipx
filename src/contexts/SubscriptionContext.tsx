import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export interface SubscriptionStatus {
  subscribed: boolean;
  isAdmin: boolean;
  role: "admin" | "subscriber" | "user";
  subscriptionEnd?: string;
  priceId?: string;
  isLoading: boolean;
}

// Lifetime access pricing (kept for reference, but edge function controls the actual price)
export const SUBSCRIPTION_PRICE_ID = "price_1Su9HS2LCwPxHz0nJtdFrBXd";
export const SUBSCRIPTION_PRODUCT_ID = "prod_TpcrDIRieLAbv5";
export const SUBSCRIPTION_PRICE = 29,00;
export const SUBSCRIPTION_IS_LIFETIME = true;

interface SubscriptionContextType extends SubscriptionStatus {
  hasPremiumAccess: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<string>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Cache to prevent duplicate calls within short time window
let lastCheckTime = 0;
let cachedStatus: SubscriptionStatus | null = null;
const CACHE_DURATION_MS = 5000; // 5 second cache

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    isAdmin: false,
    role: "user",
    isLoading: true,
  });
  const checkInProgressRef = useRef(false);

  const checkSubscription = useCallback(
    async (force = false) => {
      if (!isAuthenticated || !user) {
        setStatus({
          subscribed: false,
          isAdmin: false,
          role: "user",
          isLoading: false,
        });
        cachedStatus = null;
        return;
      }

      // Return cached result if available and not forced
      const now = Date.now();
      if (!force && cachedStatus && now - lastCheckTime < CACHE_DURATION_MS) {
        setStatus(cachedStatus);
        return;
      }

      // Prevent concurrent checks
      if (checkInProgressRef.current) {
        return;
      }

      checkInProgressRef.current = true;

      try {
        const { data, error } = await supabase.functions.invoke("check-subscription");

        if (error) {
          console.error("Error checking subscription:", error);
          // On error, preserve existing subscription status (don't reset to non-subscribed)
          // This prevents showing paywall when the API temporarily fails
          if (cachedStatus) {
            setStatus({ ...cachedStatus, isLoading: false });
          } else {
            setStatus((prev) => ({ ...prev, isLoading: false }));
          }
          // IMPORTANT: Update lastCheckTime on error to prevent retry storms
          lastCheckTime = Date.now();
          checkInProgressRef.current = false;
          return;
        }

        const newStatus: SubscriptionStatus = {
          subscribed: data.subscribed || false,
          isAdmin: data.isAdmin || false,
          role: data.role || "user",
          subscriptionEnd: data.subscription_end,
          priceId: data.price_id,
          isLoading: false,
        };

        setStatus(newStatus);
        cachedStatus = newStatus;
        lastCheckTime = Date.now();
      } catch (error) {
        console.error("Failed to check subscription:", error);
        setStatus((prev) => ({ ...prev, isLoading: false }));
      } finally {
        checkInProgressRef.current = false;
      }
    },
    [isAuthenticated, user],
  );

  // Check on mount and auth changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Periodic refresh every 5 minutes (reduced from 60 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => checkSubscription(true), 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [isAuthenticated, checkSubscription]);

  const createCheckout = useCallback(
    async () => {
      if (!isAuthenticated) {
        throw new Error("User must be authenticated");
      }

      // Price ID is controlled by the edge function via env var
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: {},
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data.url;
    },
    [isAuthenticated],
  );

  const openCustomerPortal = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error("User must be authenticated");
    }

    const { data, error } = await supabase.functions.invoke("customer-portal");

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    if (data.url) {
      window.open(data.url, "_blank");
    }
  }, [isAuthenticated]);

  const hasPremiumAccess = status.isAdmin || status.subscribed;

  return (
    <SubscriptionContext.Provider
      value={{
        ...status,
        hasPremiumAccess,
        checkSubscription: () => checkSubscription(true),
        createCheckout,
        openCustomerPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
