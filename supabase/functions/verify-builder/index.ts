import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyBuilderSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface VerificationResult {
  github: {
    valid: boolean;
    username: string;
    hasStarredRepos: boolean;
    totalStars: number;
    topRepos: { name: string; stars: number }[];
    message: string;
  };
  payment: {
    valid: boolean;
    provider: "stripe" | "polar" | null;
    keyFormat: boolean;
    hasRevenue?: boolean;
    message: string;
  };
  supabase: {
    valid: boolean;
    keyFormat: boolean;
    message: string;
  };
  overall: {
    verified: boolean;
    score: number;
    message: string;
  };
  // Keep stripe for backwards compatibility
  stripe: {
    valid: boolean;
    keyFormat: boolean;
    hasRevenue?: boolean;
    message: string;
  };
}

// Extract GitHub username from URL or raw username
function extractGitHubUsername(input: string): string {
  const trimmed = input.trim();
  // Match github.com URLs: https://github.com/username, github.com/username, etc.
  const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\/?/i);
  if (urlMatch) {
    return urlMatch[1];
  }
  return trimmed;
}

async function verifyGitHub(rawInput: string): Promise<VerificationResult["github"]> {
  const username = extractGitHubUsername(rawInput);
  
  try {
    // Fetch user repos
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars`, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "MothershipX-Verification",
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        username,
        hasStarredRepos: false,
        totalStars: 0,
        topRepos: [],
        message: "GitHub profile not found",
      };
    }

    const repos = await response.json();
    const starredRepos = repos.filter((repo: any) => repo.stargazers_count >= 1);
    const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
    const topRepos = starredRepos
      .slice(0, 3)
      .map((repo: any) => ({ name: repo.name, stars: repo.stargazers_count }));

    return {
      valid: true,
      username,
      hasStarredRepos: starredRepos.length > 0,
      totalStars,
      topRepos,
      message: starredRepos.length > 0 
        ? `Found ${starredRepos.length} repos with stars (${totalStars} total stars)`
        : "No repos with stars found",
    };
  } catch (error) {
    return {
      valid: false,
      username,
      hasStarredRepos: false,
      totalStars: 0,
      topRepos: [],
      message: "Failed to verify GitHub profile",
    };
  }
}

function verifyStripeKey(key: string | undefined | null): VerificationResult["stripe"] {
  if (!key || key.trim() === "") {
    return {
      valid: false,
      keyFormat: false,
      message: "Stripe key not provided",
    };
  }

  // Stripe publishable keys start with pk_live_ or pk_test_
  const isValidFormat = /^pk_(live|test)_[a-zA-Z0-9]+$/.test(key);
  const isLiveKey = key.startsWith("pk_live_");

  return {
    valid: isValidFormat,
    keyFormat: isValidFormat,
    hasRevenue: isLiveKey,
    message: isValidFormat 
      ? (isLiveKey 
          ? "Valid live Stripe key detected - production ready!" 
          : "Valid test Stripe key (live key preferred for higher verification score)")
      : "Invalid Stripe publishable key format",
  };
}

function verifyPolarKey(key: string | undefined | null): VerificationResult["payment"] {
  if (!key || key.trim() === "") {
    return {
      valid: false,
      provider: null,
      keyFormat: false,
      message: "Polar key not provided",
    };
  }

  // Polar public keys - validate format (they should be non-empty strings)
  // Polar uses various key formats, we just check it's a reasonable length
  const isValidFormat = key.trim().length >= 10 && key.trim().length <= 200;

  return {
    valid: isValidFormat,
    provider: "polar",
    keyFormat: isValidFormat,
    hasRevenue: true, // Assume Polar users have revenue setup
    message: isValidFormat 
      ? "Valid Polar API key detected"
      : "Invalid Polar API key format",
  };
}

function verifyPaymentProvider(
  provider: "stripe" | "polar" | undefined,
  stripeKey: string | undefined | null,
  polarKey: string | undefined | null
): VerificationResult["payment"] {
  if (provider === "polar" && polarKey) {
    return verifyPolarKey(polarKey);
  }
  
  // Default to Stripe
  const stripeResult = verifyStripeKey(stripeKey);
  return {
    valid: stripeResult.valid,
    provider: stripeResult.valid ? "stripe" : null,
    keyFormat: stripeResult.keyFormat,
    hasRevenue: stripeResult.hasRevenue,
    message: stripeResult.message,
  };
}

function verifySupabaseKey(key: string | undefined | null): VerificationResult["supabase"] {
  // Supabase key is optional
  if (!key || key.trim() === "") {
    return {
      valid: false,
      keyFormat: false,
      message: "Supabase public key not provided (optional)",
    };
  }
  
  // Supabase keys can be:
  // 1. JWT format (anon key): eyJ...
  // 2. Publishable key format: sb_publishable_...
  const isJWT = /^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(key);
  const isPublishableKey = /^sb_publishable_[a-zA-Z0-9_-]+$/.test(key);
  const isValidFormat = isJWT || isPublishableKey;
  
  return {
    valid: isValidFormat,
    keyFormat: isValidFormat,
    message: isValidFormat 
      ? "Valid Supabase public key detected"
      : "Invalid Supabase public key format",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
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
    const validation = validateInput(verifyBuilderSchema, rawBody);
    if (!validation.success) {
      return validationErrorResponse(validation, corsHeaders);
    }
    
    const { 
      githubUsername, 
      stripePublicKey, 
      polarPublicKey,
      paymentProvider,
      supabaseProjectKey 
    } = validation.data!;

    // Verify all credentials
    const githubResult = await verifyGitHub(githubUsername);
    const paymentResult = verifyPaymentProvider(paymentProvider, stripePublicKey, polarPublicKey);
    const supabaseResult = verifySupabaseKey(supabaseProjectKey);
    
    // For backwards compatibility, also generate stripe result
    const stripeResult = verifyStripeKey(stripePublicKey);

    // Calculate overall score (Supabase is optional, so adjust max score)
    let score = 0;
    if (githubResult.valid && githubResult.hasStarredRepos) score += 50;
    else if (githubResult.valid) score += 25;
    
    // Give bonus points for payment provider verification
    if (paymentResult.valid) {
      score += paymentResult.hasRevenue ? 50 : 35;
    }
    
    // Supabase is optional bonus points
    if (supabaseResult.valid) score += 15;

    const verified = score >= 70; // Require at least 70% to be verified

    const result: VerificationResult = {
      github: githubResult,
      payment: paymentResult,
      stripe: stripeResult, // Keep for backwards compatibility
      supabase: supabaseResult,
      overall: {
        verified,
        score: Math.min(score, 100), // Cap at 100
        message: verified 
          ? "You're a verified builder! Welcome to the Arena."
          : "Verification incomplete. Please provide valid credentials.",
      },
    };

    // Store verification in database
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Store the payment key (either Stripe or Polar) in stripe_public_key for now
    // In future, we could add a separate column for polar keys
    const paymentKey = paymentProvider === "polar" ? polarPublicKey : stripePublicKey;
    
    const { error: upsertError } = await supabaseAdmin
      .from("builder_verifications")
      .upsert({
        user_id: user.id,
        github_username: githubUsername,
        stripe_public_key: paymentKey,
        supabase_project_key: supabaseProjectKey,
        verification_status: verified ? "verified" : "failed",
        verification_result: result,
        verified_at: verified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (upsertError) {
      console.error("Error storing verification:", upsertError);
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
