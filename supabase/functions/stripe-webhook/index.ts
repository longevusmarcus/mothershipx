import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    logStep("Received event", { type: event.type });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle subscription events
    if (event.type === "customer.subscription.created" || 
        event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      logStep("Processing subscription", { subscriptionId: subscription.id, status: subscription.status });

      // Get customer email to find user
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        logStep("Customer deleted, skipping");
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const email = customer.email;
      if (!email) {
        logStep("No email on customer, skipping");
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Find user by email
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === email);
      
      if (!user) {
        logStep("User not found for email", { email });
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const userId = user.id;
      const priceId = subscription.items.data[0]?.price?.id;

      // Upsert subscription record
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          status: subscription.status,
          price_id: priceId,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (subError) {
        logStep("Error upserting subscription", { error: subError.message });
      }

      // Add subscriber role if active
      if (subscription.status === "active" || subscription.status === "trialing") {
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", userId)
          .eq("role", "subscriber")
          .maybeSingle();

        if (!existingRole) {
          await supabase.from("user_roles").insert({ user_id: userId, role: "subscriber" });
          logStep("Added subscriber role", { userId });
        }
      }

      logStep("Subscription processed", { userId, status: subscription.status });
    }

    // Handle subscription deletion
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      logStep("Processing subscription deletion", { subscriptionId: subscription.id });

      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const email = customer.email;
      if (!email) {
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === email);

      if (user) {
        // Update subscription status
        await supabase
          .from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("user_id", user.id);

        // Remove subscriber role
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user.id)
          .eq("role", "subscriber");

        logStep("Subscription deleted, role removed", { userId: user.id });
      }
    }

    // Handle challenge checkout (existing logic)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Only process challenge payments (not subscription checkouts)
      const challengeId = session.metadata?.challenge_id;
      if (challengeId) {
        const userId = session.metadata?.user_id;
        const joinType = session.metadata?.join_type || "solo";

        logStep("Processing challenge payment", { userId, challengeId });

        const { error: paymentError } = await supabase
          .from("challenge_payments")
          .update({
            status: "completed",
            stripe_payment_intent_id: session.payment_intent as string,
            completed_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", session.id);

        if (paymentError) {
          logStep("Error updating payment", { error: paymentError.message });
        }

        const { data: existingJoin } = await supabase
          .from("challenge_joins")
          .select("id")
          .eq("user_id", userId)
          .eq("challenge_id", challengeId)
          .maybeSingle();

        if (existingJoin) {
          await supabase
            .from("challenge_joins")
            .update({ payment_status: "completed" })
            .eq("id", existingJoin.id);
        } else {
          await supabase
            .from("challenge_joins")
            .insert({
              user_id: userId,
              challenge_id: challengeId,
              join_type: joinType,
              payment_status: "completed",
            });
        }

        logStep("Challenge payment processed", { userId, challengeId });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
