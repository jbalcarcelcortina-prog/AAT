import { z } from "zod";

import {
  JOB_STATUS_VALUES,
  ROLES,
  SERVICE_AREA_VALUES,
  SERVICE_CATEGORY_VALUES,
  URGENCY_VALUES,
} from "@/lib/constants";

/**
 * Request validation for every API route. The same schemas back the client
 * forms, so the browser and the server agree on what "valid" means.
 */

/** Build a schema for one of our string "enums" (see constants.ts). */
function enumOf<T extends string>(values: readonly T[], message: string) {
  return z.custom<T>(
    (value) =>
      typeof value === "string" && (values as readonly string[]).includes(value),
    { message },
  );
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(200, "Password is too long");

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: emailSchema,
  password: passwordSchema,
  role: enumOf(ROLES, "Choose how you'll use Manito"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const createJobSchema = z.object({
  category: enumOf(SERVICE_CATEGORY_VALUES, "Choose a type of work"),
  title: z.string().trim().min(4, "Add a short summary").max(120),
  description: z
    .string()
    .trim()
    .min(15, "Tell us a bit more — at least 15 characters")
    .max(2000),
  area: enumOf(SERVICE_AREA_VALUES, "Choose your neighborhood"),
  urgency: enumOf(URGENCY_VALUES, "Choose an urgency level"),
});
export type CreateJobInput = z.infer<typeof createJobSchema>;

export const providerProfileSchema = z.object({
  categories: z
    .array(enumOf(SERVICE_CATEGORY_VALUES, "Unknown trade"))
    .min(1, "Pick at least one trade"),
  areas: z
    .array(enumOf(SERVICE_AREA_VALUES, "Unknown neighborhood"))
    .min(1, "Pick at least one neighborhood"),
  bio: z.string().trim().max(600).default(""),
  yearsExperience: z.coerce
    .number()
    .int("Use a whole number")
    .min(0)
    .max(60, "That's a long career — cap is 60"),
  hourlyRateMxn: z.coerce
    .number()
    .int()
    .min(0)
    .max(100000)
    .optional()
    .nullable(),
});
export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;

export const requestProviderSchema = z.object({
  providerId: z.string().min(1, "Missing provider"),
  message: z.string().trim().max(500).optional(),
});

export const respondToRequestSchema = z.object({
  decision: z.union([z.literal("ACCEPT"), z.literal("DECLINE")]),
});

export const updateJobStatusSchema = z.object({
  status: enumOf(JOB_STATUS_VALUES, "Unknown status"),
});

/** Collapse a ZodError into `{ field: message }` for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
