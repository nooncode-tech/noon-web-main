import { z } from "zod";

export const maxwellSessionCookieName = "noon_maxwell_session";

export const maxwellSessionSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(10, "Describe the build in a bit more detail.")
    .max(4000, "Keep the prompt under 4000 characters."),
  source: z
    .string()
    .trim()
    .max(120, "Keep the source under 120 characters.")
    .optional()
    .default(""),
});

export type MaxwellSessionInput = z.infer<typeof maxwellSessionSchema>;
