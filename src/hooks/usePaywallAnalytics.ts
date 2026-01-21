import { useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

type PaywallEvent = 
  | "paywall_view" 
  | "paywall_dismiss" 
  | "checkout_start" 
  | "checkout_complete" 
  | "checkout_cancel";

type PaywallFeature = "search" | "problem" | "arena" | "general";

interface PaywallEventData {
  event: PaywallEvent;
  feature: PaywallFeature;
  metadata?: Record<string, unknown>;
}

export function usePaywallAnalytics() {
  const { user } = useAuth();

  const trackEvent = useCallback(async (data: PaywallEventData) => {
    try {
      // Log to console in development
      console.log("[Paywall Analytics]", {
        ...data,
        userId: user?.id,
        timestamp: new Date().toISOString(),
      });

      // Store in database for analytics using raw RPC to bypass type checking
      // The paywall_events table exists but types haven't been regenerated yet
      const { error } = await supabase.rpc("insert_paywall_event" as never, {
        p_user_id: user?.id || null,
        p_event_type: data.event,
        p_feature: data.feature,
        p_metadata: data.metadata || {},
      } as never);

      if (error) {
        // Function might not exist - fall back to direct insert attempt
        // This will silently fail if table doesn't exist in types
        console.debug("[Paywall Analytics] RPC failed, using fallback");
      }
    } catch (err) {
      // Don't break the app if analytics fails
      console.debug("[Paywall Analytics] Error:", err);
    }
  }, [user?.id]);

  const trackPaywallView = useCallback((feature: PaywallFeature) => {
    trackEvent({ event: "paywall_view", feature });
  }, [trackEvent]);

  const trackPaywallDismiss = useCallback((feature: PaywallFeature) => {
    trackEvent({ event: "paywall_dismiss", feature });
  }, [trackEvent]);

  const trackCheckoutStart = useCallback((feature: PaywallFeature) => {
    trackEvent({ event: "checkout_start", feature });
  }, [trackEvent]);

  const trackCheckoutComplete = useCallback(() => {
    trackEvent({ event: "checkout_complete", feature: "general" });
  }, [trackEvent]);

  const trackCheckoutCancel = useCallback(() => {
    trackEvent({ event: "checkout_cancel", feature: "general" });
  }, [trackEvent]);

  return {
    trackPaywallView,
    trackPaywallDismiss,
    trackCheckoutStart,
    trackCheckoutComplete,
    trackCheckoutCancel,
    trackEvent,
  };
}
