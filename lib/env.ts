import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_S3_BUCKET_NAME: z.string().min(1),
  AWS_FROM_EMAIL: z.string().email(),
  GOOGLE_GEMINI_API_KEY: z.string().min(1),
  RENTCAST_API_KEY: z.string().optional(), // Made optional to prevent crash if not yet set
  CENSUS_API_KEY: z.string().optional(),   // Made optional to prevent crash if not yet set
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export const env = envSchema.parse(process.env);
