// Shared Zod validation schemas for edge functions
// Using Zod via CDN for Deno compatibility
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Re-export z for use in other files
export { z };

// ============= Common Schemas =============

export const uuidSchema = z.string().uuid();

export const urlSchema = z.string().url().max(2048);

export const emailSchema = z.string().email().max(255);

export const safeStringSchema = z.string().trim().max(1000);

export const nicheSchema = z.enum([
  "mental-health",
  "weight-fitness", 
  "skin-beauty",
  "gut-health",
  "productivity",
  "career",
  "connections",
  "business",
  "finance"
]);

// ============= Edge Function Input Schemas =============

export const searchTikTokSchema = z.object({
  niche: nicheSchema,
  forceRefresh: z.boolean().optional().default(false),
});

export const searchRedditSchema = z.object({
  subredditId: z.enum(["findapath", "finance", "problemgambling"]),
});

export const searchYouTubeSchema = z.object({
  channelId: z.enum(["diary-of-a-ceo", "alex-hormozi"]),
});

export const searchCompetitorsSchema = z.object({
  problemId: uuidSchema.optional(),
  problemTitle: safeStringSchema.min(1, "Problem title is required").max(200),
  niche: safeStringSchema.max(100).optional(),
  opportunityScore: z.number().min(0).max(100).optional(),
});

export const validateSubmissionSchema = z.object({
  submissionId: uuidSchema.optional(),
  productUrl: urlSchema,
  productName: safeStringSchema.min(1).max(100),
  githubRepo: urlSchema.optional().nullable(),
  stripePublicKey: z.string().max(200).optional().nullable(),
  challengeId: uuidSchema.optional().nullable(),
  problemId: uuidSchema.optional().nullable(),
});

export const verifyBuilderSchema = z.object({
  githubUsername: safeStringSchema.min(1).max(100),
  paymentProvider: z.enum(["stripe", "polar"]).optional(),
  stripePublicKey: z.string().max(200).optional().nullable(),
  polarPublicKey: z.string().max(200).optional().nullable(),
  supabaseProjectKey: z.string().max(200).optional().nullable(),
});

export const generatePromptsSchema = z.object({
  problem: z.object({
    title: safeStringSchema.min(1).max(200),
    subtitle: safeStringSchema.max(500).optional(),
    category: safeStringSchema.max(100),
    niche: safeStringSchema.max(100),
    painPoints: z.array(safeStringSchema).max(10).optional(),
    marketSize: safeStringSchema.max(100).optional(),
    opportunityScore: z.number().min(0).max(100),
    sentiment: safeStringSchema.max(50),
    sources: z.array(z.any()).optional(),
    hiddenInsight: z.any().optional(),
  }),
  competitors: z.array(z.any()).max(20).optional(),
  solutions: z.array(z.any()).max(20).optional(),
  config: z.object({
    framework: z.string().max(50).optional(),
    complexity: z.number().min(1).max(5).optional(),
    features: z.record(z.boolean()).optional(),
    techStack: z.array(z.string().max(50)).max(20).optional(),
    designStyle: z.string().max(50).optional(),
  }).optional(),
});

export const refreshProblemSchema = z.object({
  problemId: uuidSchema.optional(),
  updateAll: z.boolean().optional(),
});

export const fetchTikTokDataSchema = z.object({
  endpoint: z.enum(["input", "dataset", "queue", "log", "run"]).optional().default("dataset"),
});

export const createCheckoutSchema = z.object({
  challengeId: uuidSchema,
  joinType: z.enum(["solo", "team"]).optional().default("solo"),
  successUrl: urlSchema.optional(),
  cancelUrl: urlSchema.optional(),
});

export const createSubscriptionCheckoutSchema = z.object({
  priceId: z.string().max(100).optional(),
  billingType: z.enum(["lifetime", "monthly"]).optional(),
});

// ============= Validation Helper =============

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: z.ZodError["issues"];
}

/**
 * Validate input against a Zod schema with structured error handling
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): ValidationResult<T> {
  try {
    const data = schema.parse(input);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      return {
        success: false,
        error: messages.join("; "),
        details: error.issues,
      };
    }
    return {
      success: false,
      error: "Invalid input format",
    };
  }
}

/**
 * Create a validation error response with proper CORS headers
 */
export function validationErrorResponse(
  result: ValidationResult<unknown>,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Validation failed",
      message: result.error,
      details: result.details,
    }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
