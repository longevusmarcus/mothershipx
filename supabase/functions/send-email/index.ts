import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const SITE_URL = Deno.env.get("SITE_URL") || "https://mothershipx.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "MothershipX <notifications@mothershipx.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProblemData {
  title: string;
  description: string;
  opportunityScore: number;
  category: string;
  problemId?: string;
}

interface SendEmailRequest {
  emailType: "new_problem";
  data: ProblemData;
}

function renderNewProblemEmail(problem: ProblemData, userName?: string): string {
  const greeting = userName ? `Hi ${userName}` : "Hi there";
  const problemUrl = problem.problemId
    ? `${SITE_URL}/problems/${problem.problemId}`
    : `${SITE_URL}/problems`;

  const scoreColor = problem.opportunityScore >= 80
    ? "#22c55e"
    : problem.opportunityScore >= 60
      ? "#eab308"
      : "#f97316";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Opportunity Discovered</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #333;">
    <div style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
      NEW OPPORTUNITY
    </div>

    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; line-height: 1.3;">
      ${problem.title}
    </h1>

    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      ${greeting}, we discovered a new market opportunity that might interest you:
    </p>

    <div style="background-color: #262626; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <span style="color: #a0a0a0; font-size: 14px;">Opportunity Score</span>
        <span style="margin-left: auto; color: ${scoreColor}; font-size: 24px; font-weight: 700;">
          ${problem.opportunityScore}/100
        </span>
      </div>
      <div style="display: flex; align-items: center;">
        <span style="color: #a0a0a0; font-size: 14px;">Category</span>
        <span style="margin-left: auto; color: #ffffff; font-size: 14px; background-color: #333; padding: 4px 12px; border-radius: 4px;">
          ${problem.category}
        </span>
      </div>
    </div>

    <p style="color: #d0d0d0; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      ${problem.description}
    </p>

    <a href="${problemUrl}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      View Problem Details
    </a>

    <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;">

    <p style="color: #666666; font-size: 12px; margin: 0;">
      You're receiving this because you opted in to problem notifications.
      <a href="${SITE_URL}/profile" style="color: #8b5cf6;">Manage preferences</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SendEmailRequest = await req.json();
    const { emailType, data } = body;

    console.log("[SEND-EMAIL] Received request:", { emailType, title: data?.title });

    if (emailType !== "new_problem") {
      return new Response(
        JSON.stringify({ error: "Invalid email type. Only 'new_problem' is supported." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data?.title) {
      return new Response(
        JSON.stringify({ error: "Missing required field: data.title" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get users who opted in to problem notifications
    const { data: subscribers, error: queryError } = await supabase
      .from("user_settings")
      .select("user_id, profiles!inner(email, name)")
      .eq("new_problems", true);

    if (queryError) {
      console.error("[SEND-EMAIL] Error fetching subscribers:", queryError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscribers?.length) {
      console.log("[SEND-EMAIL] No subscribers opted in for problem notifications");
      return new Response(
        JSON.stringify({ sent: 0, failed: 0, message: "No subscribers" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[SEND-EMAIL] Found subscribers:", subscribers.length);

    // Batch send emails (max 100 per batch)
    const BATCH_SIZE = 100;
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      const emailBatch = batch
        .filter((user: any) => user.profiles?.email)
        .map((user: any) => ({
          from: FROM_EMAIL,
          to: [user.profiles.email],
          subject: `New opportunity: ${data.title}`,
          html: renderNewProblemEmail(data, user.profiles.name),
          tags: [{ name: "email_type", value: "new_problem" }],
        }));

      if (emailBatch.length === 0) {
        continue;
      }

      try {
        const { data: batchResult, error: batchError } = await resend.batch.send(emailBatch);

        if (batchError) {
          console.error("[SEND-EMAIL] Batch error:", batchError);
          failed += emailBatch.length;
          errors.push(batchError.message);
        } else {
          sent += emailBatch.length;
          console.log("[SEND-EMAIL] Batch sent:", {
            count: emailBatch.length,
            ids: batchResult?.data?.map((r: any) => r.id),
          });
        }
      } catch (batchErr) {
        const errMsg = batchErr instanceof Error ? batchErr.message : "Unknown batch error";
        console.error("[SEND-EMAIL] Batch exception:", errMsg);
        failed += emailBatch.length;
        errors.push(errMsg);
      }
    }

    // Log to email_logs table
    const logEntry = {
      email_type: "new_problem",
      recipient_email: `batch:${sent}/${sent + failed}`,
      subject: `New opportunity: ${data.title}`,
      status: failed === 0 ? "sent" : sent > 0 ? "sent" : "failed",
      metadata: {
        sent,
        failed,
        problemTitle: data.title,
        problemId: data.problemId,
        errors: errors.length > 0 ? errors : undefined,
      },
      sent_at: sent > 0 ? new Date().toISOString() : null,
    };

    const { error: logError } = await supabase.from("email_logs").insert(logEntry);

    if (logError) {
      console.error("[SEND-EMAIL] Failed to log email:", logError);
    }

    console.log("[SEND-EMAIL] Complete:", { sent, failed });

    return new Response(
      JSON.stringify({ sent, failed, errors: errors.length > 0 ? errors : undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[SEND-EMAIL] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
