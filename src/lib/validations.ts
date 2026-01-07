import { z } from "zod";

// Squad/Team creation validation
export const createSquadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Squad name must be at least 2 characters")
    .max(30, "Squad name must be less than 30 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Squad name can only contain letters, numbers, spaces, and hyphens"),
  tagline: z
    .string()
    .trim()
    .max(60, "Tagline must be less than 60 characters")
    .optional(),
});

export type CreateSquadInput = z.infer<typeof createSquadSchema>;

// Waitlist/Email validation
export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

// Profile validation
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  bio: z
    .string()
    .trim()
    .max(280, "Bio must be less than 280 characters")
    .optional(),
  location: z
    .string()
    .trim()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  website: z
    .string()
    .trim()
    .max(100, "Website must be less than 100 characters")
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}/.test(val),
      "Please enter a valid website (e.g., example.com)"
    ),
  github: z
    .string()
    .trim()
    .max(39, "GitHub username must be less than 39 characters")
    .regex(/^[a-zA-Z0-9-]*$/, "Invalid GitHub username")
    .optional(),
  twitter: z
    .string()
    .trim()
    .max(15, "Twitter username must be less than 15 characters")
    .regex(/^[a-zA-Z0-9_]*$/, "Invalid Twitter username")
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// Solution idea validation
export const solutionIdeaSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(80, "Title must be less than 80 characters"),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be less than 500 characters"),
  approach: z
    .string()
    .trim()
    .max(1000, "Approach must be less than 1000 characters")
    .optional(),
});

export type SolutionIdeaInput = z.infer<typeof solutionIdeaSchema>;

// Chat message validation
export const chatMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be less than 2000 characters"),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
