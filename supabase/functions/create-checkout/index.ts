import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { withRateLimit, RateLimitPresets } from "../_shared/rateLimit.ts";
import { createCheckoutSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit: 10 requests per minute (sensitive payment operation)
  const rateLimited = await withRateLimit(req, "create-checkout", RateLimitPresets.sensitive);
  if (rateLimited) return rateLimited;

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    
    // Validate input with Zod
    const validation = validateInput(createCheckoutSchema, rawBody);
    if (!validation.success) {
      return validationErrorResponse(validation, corsHeaders);
    }
    
    const { challengeId, joinType, successUrl, cancelUrl } = validation.data!;

    // Get challenge details
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: challenge, error: challengeError } = await supabaseAdmin
      .from("challenges")
      .select("id, title, entry_fee")
      .eq("id", challengeId)
      .single();

    if (challengeError || !challenge) {
      return new Response(
        JSON.stringify({ error: "Challenge not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Arena Entry: ${challenge.title}`,
              description: "Entry fee for Mothership X Arena challenge",
            },
            unit_amount: challenge.entry_fee * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${req.headers.get("origin")}/challenges?payment=success`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/challenges?payment=cancelled`,
      metadata: {
        user_id: user.id,
        challenge_id: challengeId,
        join_type: joinType || "solo",
      },
      customer_email: user.email,
    });

    // Create pending payment record
    const { error: paymentError } = await supabaseAdmin
      .from("challenge_payments")
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        stripe_session_id: session.id,
        amount: challenge.entry_fee * 100,
        status: "pending",
      });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
    }

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout error:", err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
