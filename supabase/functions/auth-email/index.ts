import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET")?.replace("v1,whsec_", "") || "";

const SITE_URL = Deno.env.get("SITE_URL") || "https://superlovable.dev";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://bbkhiwrgqilaokowhtxg.supabase.co";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "MothershipX <noreply@superlovable.dev>";

interface AuthEmailPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    token_new?: string;
    token_hash_new?: string;
    email_action_type: "signup" | "recovery" | "email_change" | "magic_link" | "invite";
    redirect_to: string;
    site_url: string;
  };
}

function renderVerificationEmail(email: string, token: string, redirectTo: string): string {
  // Use Supabase's built-in verify endpoint - it handles token verification and redirects to the app
  // Add ?verified=true so the frontend can show a welcome toast
  const finalRedirect = redirectTo || SITE_URL;
  const redirectWithParam = finalRedirect.includes('?')
    ? `${finalRedirect}&verified=true`
    : `${finalRedirect}?verified=true`;
  const verifyUrl = `${SUPABASE_URL}/auth/v1/verify?token=${token}&type=signup&redirect_to=${encodeURIComponent(redirectWithParam)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #333;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 24px 0;">Welcome to MothershipX</h1>
    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Thanks for signing up! Please verify your email address to get started discovering market opportunities.
    </p>
    <a href="${verifyUrl}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Verify Email
    </a>
    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0;">
      If you didn't create an account, you can safely ignore this email.
    </p>
    <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;">
    <p style="color: #666666; font-size: 12px; margin: 0;">
      MothershipX - Market Intelligence for SaaS Builders
    </p>
  </div>
</body>
</html>
  `.trim();
}

function renderPasswordResetEmail(email: string, token: string, redirectTo: string): string {
  // Use Supabase's built-in verify endpoint - it verifies the token and redirects to the reset password page
  const resetUrl = `${SUPABASE_URL}/auth/v1/verify?token=${token}&type=recovery&redirect_to=${encodeURIComponent(redirectTo || `${SITE_URL}/auth?mode=reset`)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #333;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 24px 0;">Reset Your Password</h1>
    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      We received a request to reset your password. Click the button below to choose a new one.
    </p>
    <a href="${resetUrl}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Reset Password
    </a>
    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
    <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;">
    <p style="color: #666666; font-size: 12px; margin: 0;">
      MothershipX - Market Intelligence for SaaS Builders
    </p>
  </div>
</body>
</html>
  `.trim();
}

function renderMagicLinkEmail(email: string, token: string, redirectTo: string): string {
  // Use Supabase's built-in verify endpoint - it verifies the token and redirects to the app
  const loginUrl = `${SUPABASE_URL}/auth/v1/verify?token=${token}&type=magiclink&redirect_to=${encodeURIComponent(redirectTo || SITE_URL)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to MothershipX</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #333;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 24px 0;">Sign In to MothershipX</h1>
    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Click the button below to securely sign in to your account. This link expires in 1 hour.
    </p>
    <a href="${loginUrl}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Sign In
    </a>
    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0;">
      If you didn't request this email, you can safely ignore it.
    </p>
    <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;">
    <p style="color: #666666; font-size: 12px; margin: 0;">
      MothershipX - Market Intelligence for SaaS Builders
    </p>
  </div>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Get payload and headers
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    // Debug: Log received headers
    console.log("[AUTH-EMAIL] Received headers:", JSON.stringify(headers, null, 2));
    console.log("[AUTH-EMAIL] Hook secret configured:", hookSecret ? "yes" : "no");

    // Verify webhook signature
    const wh = new Webhook(hookSecret);

    let user: AuthEmailPayload["user"];
    let email_data: AuthEmailPayload["email_data"];

    try {
      const verified = wh.verify(payload, headers) as AuthEmailPayload;
      user = verified.user;
      email_data = verified.email_data;
    } catch (verifyError) {
      console.error("[AUTH-EMAIL] Webhook verification failed:", verifyError);
      console.error("[AUTH-EMAIL] Headers received:", Object.keys(headers));
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[AUTH-EMAIL] Received request:", {
      email: user.email,
      type: email_data.email_action_type,
    });

    let subject: string;
    let html: string;

    switch (email_data.email_action_type) {
      case "signup":
        subject = "Verify your email - MothershipX";
        html = renderVerificationEmail(user.email, email_data.token, email_data.redirect_to);
        break;

      case "recovery":
        subject = "Reset your password - MothershipX";
        html = renderPasswordResetEmail(user.email, email_data.token, email_data.redirect_to);
        break;

      case "magic_link":
        subject = "Sign in to MothershipX";
        html = renderMagicLinkEmail(user.email, email_data.token, email_data.redirect_to);
        break;

      case "invite":
        subject = "You've been invited to MothershipX";
        html = renderVerificationEmail(user.email, email_data.token, email_data.redirect_to);
        break;

      case "email_change":
        subject = "Confirm your new email - MothershipX";
        html = renderVerificationEmail(user.email, email_data.token_new || email_data.token, email_data.redirect_to);
        break;

      default:
        console.error("[AUTH-EMAIL] Unknown email type:", email_data.email_action_type);
        return new Response(
          JSON.stringify({ error: `Unknown email type: ${email_data.email_action_type}` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error("[AUTH-EMAIL] Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[AUTH-EMAIL] Email sent successfully:", {
      messageId: data?.id,
      to: user.email,
      type: email_data.email_action_type,
    });

    // Return empty JSON as required by Supabase Auth Hook
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[AUTH-EMAIL] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
