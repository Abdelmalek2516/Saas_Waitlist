import { headers } from "next/headers";

/**
 * Extracts the true client IP from the x-forwarded-for header.
 *
 * When deployed behind Vercel, Cloudflare, or any CDN the header is a
 * comma-separated chain:  "203.0.113.195, 70.41.3.18, 127.0.0.1"
 * The leftmost value is always the real client.
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for") ?? "";
  const realIp = forwarded.split(",")[0].trim();
  return realIp || "unknown";
}
