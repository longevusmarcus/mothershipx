import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

interface RateLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining?: number;
  retry_after?: number;
}

interface RateLimitOptions {
  maxRequests?: number;
  windowMinutes?: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Check rate limit for a request using database-backed sliding window.
 * Uses the service role client to bypass RLS.
 * 
 * @param identifier - Unique identifier (user ID, IP address, or API key)
 * @param endpoint - The endpoint being rate limited
 * @param options - Rate limit configuration
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const { maxRequests = 60, windowMinutes = 1 } = options;

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
    p_identifier: identifier,
    p_endpoint: endpoint,
    p_max_requests: maxRequests,
    p_window_minutes: windowMinutes,
  });

  if (error) {
    console.error("[RATE_LIMIT] Error checking rate limit:", error);
    // Fail open - allow request if rate limit check fails
    return { allowed: true, current: 0, limit: maxRequests, remaining: maxRequests };
  }

  return data as RateLimitResult;
}

/**
 * Get identifier from request (user ID if authenticated, IP otherwise)
 */
export function getIdentifier(req: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  
  // Try to get IP from headers (common proxy headers)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("x-real-ip") 
    || req.headers.get("cf-connecting-ip")
    || "anonymous";
  
  return `ip:${ip}`;
}

/**
 * Create a rate limit error response with proper headers
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retry_after: result.retry_after || 60,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(result.retry_after || 60),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

/**
 * Middleware wrapper for rate limiting.
 * Returns null if allowed, or a 429 Response if rate limited.
 * 
 * Usage in edge function:
 * ```typescript
 * import { withRateLimit } from "../_shared/rateLimit.ts";
 * 
 * serve(async (req) => {
 *   const rateLimitResponse = await withRateLimit(req, "my-function", { maxRequests: 30 });
 *   if (rateLimitResponse) return rateLimitResponse;
 *   
 *   // ... rest of function logic
 * });
 * ```
 */
export async function withRateLimit(
  req: Request,
  endpoint: string,
  options: RateLimitOptions & { userId?: string | null } = {}
): Promise<Response | null> {
  const { userId, ...rateLimitOptions } = options;
  const identifier = getIdentifier(req, userId);
  
  const result = await checkRateLimit(identifier, endpoint, rateLimitOptions);
  
  if (!result.allowed) {
    console.log(`[RATE_LIMIT] Blocked: ${identifier} on ${endpoint} (${result.current}/${result.limit})`);
    return rateLimitResponse(result);
  }
  
  return null;
}

/**
 * Rate limit presets for common use cases
 */
export const RateLimitPresets = {
  // Standard API endpoint - 60 requests per minute
  standard: { maxRequests: 60, windowMinutes: 1 },
  
  // Sensitive operations (auth, payments, emails) - 10 requests per 30 seconds
  sensitive: { maxRequests: 10, windowMinutes: 0.5 },
  
  // Search/AI operations - 20 requests per minute
  search: { maxRequests: 20, windowMinutes: 1 },
  
  // Public endpoints - 30 requests per minute
  public: { maxRequests: 30, windowMinutes: 1 },
  
  // Strict - 5 requests per minute (brute force protection)
  strict: { maxRequests: 5, windowMinutes: 1 },
} as const;
