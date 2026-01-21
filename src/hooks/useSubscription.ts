import { useState, useEffect, useCallback } from "react";
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

export const SUBSCRIPTION_PRICE_ID = "price_1SrxbZ2LCwPxHz0nC7VtOgeS";
export const SUBSCRIPTION_PRODUCT_ID = "prod_TpcrDIRieLAbv5";
export const SUBSCRIPTION_PRICE = 29.99;

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    isAdmin: false,
    role: "user",
    isLoading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setStatus({
        subscribed: false,
        isAdmin: false,
        role: "user",
        isLoading: false,
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) {
        console.error("Error checking subscription:", error);
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setStatus({
        subscribed: data.subscribed || false,
        isAdmin: data.isAdmin || false,
        role: data.role || "user",
        subscriptionEnd: data.subscription_end,
        priceId: data.price_id,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to check subscription:", error);
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated, user]);

  // Check on mount and auth changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Periodic refresh every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, checkSubscription]);

  const createCheckout = async (priceId?: string) => {
    if (!isAuthenticated) {
      throw new Error("User must be authenticated");
    }

    const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
      body: { priceId: priceId || SUBSCRIPTION_PRICE_ID },
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    return data.url;
  };

  const openCustomerPortal = async () => {
    if (!isAuthenticated) {
      throw new Error("User must be authenticated");
    }

    const { data, error } = await supabase.functions.invoke("customer-portal");

    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    if (data.url) {
      window.open(data.url, "_blank");
    }
  };

  // Check if user has premium access (admin or subscriber)
  const hasPremiumAccess = status.isAdmin || status.subscribed;

  return {
    ...status,
    hasPremiumAccess,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
}
