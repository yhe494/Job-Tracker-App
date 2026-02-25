import { z } from "zod";
import dotenv from "dotenv";

// Load .env as early as possible
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  CLIENT_ORIGIN: z.string().min(1, "CLIENT_ORIGIN is required"),

  // We validate now even if we connect in Step 3
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Reserve for Step 4 auth; keep required so you don't forget in deploy
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {

  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;