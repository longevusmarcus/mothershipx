import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  stripe: {
    valid: boolean;
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

function verifyStripeKey(key: string): VerificationResult["stripe"] {
  // Stripe publishable keys start with pk_live_ or pk_test_
  const isValidFormat = /^pk_(live|test)_[a-zA-Z0-9]+$/.test(key);
  const isLiveKey = key.startsWith("pk_live_");

  // Note: To verify actual payment volume, we would need Stripe Connect OAuth
  // to access the user's Stripe account. Publishable keys alone cannot be used
  // to query payment history. For now, we validate the key format and prefer live keys.
  // Future enhancement: Implement Stripe Connect OAuth flow for revenue verification.

  return {
    valid: isValidFormat,
    keyFormat: isValidFormat,
    hasRevenue: isLiveKey, // Assume live keys indicate production usage
    message: isValidFormat 
      ? (isLiveKey 
          ? "Valid live Stripe key detected - production ready!" 
          : "Valid test Stripe key (live key preferred for higher verification score)")
      : "Invalid Stripe publishable key format",
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

    const { githubUsername, stripePublicKey, supabaseProjectKey } = await req.json();

    // Verify all credentials
    const githubResult = await verifyGitHub(githubUsername);
    const stripeResult = verifyStripeKey(stripePublicKey);
    const supabaseResult = verifySupabaseKey(supabaseProjectKey);

    // Calculate overall score (Supabase is optional, so adjust max score)
    let score = 0;
    if (githubResult.valid && githubResult.hasStarredRepos) score += 50;
    else if (githubResult.valid) score += 25;
    
    // Give bonus points for live Stripe keys (indicates production usage)
    if (stripeResult.valid) {
      score += stripeResult.hasRevenue ? 50 : 35;
    }
    
    // Supabase is optional bonus points
    if (supabaseResult.valid) score += 15;

    const verified = score >= 70; // Require at least 70% to be verified

    const result: VerificationResult = {
      github: githubResult,
      stripe: stripeResult,
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
    
    const { error: upsertError } = await supabaseAdmin
      .from("builder_verifications")
      .upsert({
        user_id: user.id,
        github_username: githubUsername,
        stripe_public_key: stripePublicKey,
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
