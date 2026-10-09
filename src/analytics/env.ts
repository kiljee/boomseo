import * as z from "zod";

export const plausibleEnvSchema = z.object({
  PLAUSIBLE_API_KEY: z.string(),
  PLAUSIBLE_SITE_ID: z.string(),
  PLAUSIBLE_BASE_URL: z.string(),
});

export const googleAnalyticsEnvSchema = z.object({
  GOOGLE_ANALYTICS_CLIENT_EMAIL: z.string(),
  GOOGLE_ANALYTICS_PRIVATE_KEY: z.string(),
  GOOGLE_ANALYTICS_PROPERTY_ID: z.string(),
});
