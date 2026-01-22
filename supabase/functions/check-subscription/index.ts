import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; operationName?: string } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 200, operationName = "operation" } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const isRetryable = lastError.message.includes("connection") || 
                          lastError.message.includes("reset") ||
                          lastError.message.includes("timeout") ||
                          lastError.message.includes("SendRequest");
      
      if (!isRetryable || attempt === maxRetries) {
        logStep(`${operationName} failed after ${attempt} attempt(s)`, { error: lastError.message });
        throw lastError;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      logStep(`${operationName} attempt ${attempt} failed, retrying in ${delayMs}ms`, { error: lastError.message });
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    
    // Use retry for auth call to handle transient network errors
    const { data: userData, error: userError } = await withRetry(
      () => supabaseClient.auth.getUser(token),
      { operationName: "auth.getUser", maxRetries: 3, baseDelayMs: 300 }
    );
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "subscriber"])
      .maybeSingle();

    if (roleData) {
      logStep("User has premium role", { role: roleData.role });
      return new Response(JSON.stringify({
        subscribed: true,
        isAdmin: roleData.role === "admin",
        role: roleData.role,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check Stripe subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, user not subscribed");
      return new Response(JSON.stringify({ subscribed: false, isAdmin: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;
    let priceId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      priceId = subscription.items.data[0].price.id;
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });

      // Add subscriber role if not exists
      await supabaseClient
        .from("user_roles")
        .upsert({
          user_id: user.id,
          role: "subscriber",
        }, { onConflict: "user_id,role" });

      // Update subscriptions table
      await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: "active",
          price_id: priceId,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: subscriptionEnd,
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { onConflict: "stripe_subscription_id" });
    } else {
      logStep("No active subscription found");
      
      // Remove subscriber role if exists
      await supabaseClient
        .from("user_roles")
        .delete()
        .eq("user_id", user.id)
        .eq("role", "subscriber");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      isAdmin: false,
      role: hasActiveSub ? "subscriber" : "user",
      subscription_end: subscriptionEnd,
      price_id: priceId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
