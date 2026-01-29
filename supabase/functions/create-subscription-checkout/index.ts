import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { withRateLimit, RateLimitPresets } from "../_shared/rateLimit.ts";
import { createSubscriptionCheckoutSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
};

// Pricing - use env vars for local testing, fallback to production
const LIFETIME_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID") || "price_1Su9HS2LCwPxHz0nJtdFrBXd";
const MONTHLY_PRICE_ID = Deno.env.get("STRIPE_MONTHLY_PRICE_ID") || null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit: 10 requests per minute (sensitive payment operation)
  const rateLimited = await withRateLimit(req, "create-subscription-checkout", RateLimitPresets.sensitive);
  if (rateLimited) return rateLimited;

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const rawBody = await req.json().catch(() => ({}));
    
    // Validate input with Zod
    const validation = validateInput(createSubscriptionCheckoutSchema, rawBody);
    if (!validation.success) {
      return validationErrorResponse(validation, corsHeaders);
    }
    
    const { priceId, billingType } = validation.data as { priceId?: string; billingType?: string };

    // Determine price: explicit priceId > billingType selection > default lifetime
    let finalPriceId: string;
    if (priceId) {
      finalPriceId = priceId;
    } else if (billingType === "monthly" && MONTHLY_PRICE_ID) {
      finalPriceId = MONTHLY_PRICE_ID;
    } else {
      finalPriceId = LIFETIME_PRICE_ID;
    }
    logStep("Using price", { finalPriceId, billingType });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Check if customer exists, create if not
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create a new customer for portal access later
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = newCustomer.id;
      logStep("Created new customer", { customerId });
    }

    // Check if already subscribed
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      logStep("User already has active subscription");
      return new Response(JSON.stringify({
        error: "You already have an active subscription",
        alreadySubscribed: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const origin = req.headers.get("origin") || "https://mothershipx.lovable.app";

    // Retrieve price to determine if it's recurring or one-time
    const price = await stripe.prices.retrieve(finalPriceId);
    const isRecurring = price.type === "recurring";
    const checkoutMode = isRecurring ? "subscription" : "payment";
    logStep("Price type detected", { priceId: finalPriceId, type: price.type, mode: checkoutMode });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: checkoutMode,
      success_url: `${origin}/subscription/success`,
      cancel_url: `${origin}/profile`,
      metadata: {
        user_id: user.id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
