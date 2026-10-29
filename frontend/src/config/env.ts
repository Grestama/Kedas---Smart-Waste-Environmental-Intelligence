import { z } from "zod";

const envSchema = z.object({
  apiBaseUrl: z.string().url("NEXT_PUBLIC_API_BASE_URL harus berupa URL yang valid"),
  appEnv: z.enum(["development", "staging", "production"]).default("development"),
  timezone: z.string().default("Asia/Makassar"),
});

function validateEnv() {
  const parsed = envSchema.safeParse({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1",
    appEnv: (process.env.NEXT_PUBLIC_APP_ENV || "development") as "development" | "staging" | "production",
    timezone: process.env.NEXT_PUBLIC_TIMEZONE || "Asia/Makassar",
  });

  if (!parsed.success) {
    // Log user-friendly message without exposing secrets
    console.error(
      "Konfigurasi lingkungan (environment variables) frontend tidak valid:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Konfigurasi lingkungan tidak valid. Periksa berkas .env Anda.");
  }

  return parsed.data;
}

export const env = validateEnv();
