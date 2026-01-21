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

      // Store in database for analytics
      const { error } = await supabase.from("paywall_events").insert({
        user_id: user?.id || null,
        event_type: data.event,
        feature: data.feature,
        metadata: data.metadata || {},
      });

      if (error) {
        // Table might not exist yet - silently fail
        console.debug("[Paywall Analytics] Insert failed:", error.message);
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
