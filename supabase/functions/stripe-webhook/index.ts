import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    
    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log("Received Stripe event:", event.type);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Checkout session completed:", session.id);
      console.log("Metadata:", session.metadata);

      const userId = session.metadata?.user_id;
      const challengeId = session.metadata?.challenge_id;
      const joinType = session.metadata?.join_type || "solo";

      if (!userId || !challengeId) {
        console.error("Missing user_id or challenge_id in metadata");
        return new Response("Missing metadata", { status: 400 });
      }

      // Update payment record
      const { error: paymentError } = await supabase
        .from("challenge_payments")
        .update({
          status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", session.id);

      if (paymentError) {
        console.error("Error updating payment:", paymentError);
      }

      // Check if user already joined this challenge
      const { data: existingJoin } = await supabase
        .from("challenge_joins")
        .select("id")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      if (existingJoin) {
        // Update existing join to mark as paid
        const { error: updateError } = await supabase
          .from("challenge_joins")
          .update({ payment_status: "completed" })
          .eq("id", existingJoin.id);

        if (updateError) {
          console.error("Error updating challenge join:", updateError);
        }
      } else {
        // Create new challenge join
        const { error: joinError } = await supabase
          .from("challenge_joins")
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            join_type: joinType,
            payment_status: "completed",
          });

        if (joinError) {
          console.error("Error creating challenge join:", joinError);
        }
      }

      console.log("Successfully processed payment for user:", userId, "challenge:", challengeId);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook error:", err);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
