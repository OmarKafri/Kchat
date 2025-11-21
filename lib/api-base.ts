export function getApiBaseUrl(): string {
  // Production URL
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  // Server-side fallback for local development
  if (typeof window === "undefined") return "http://localhost:3000";

  // Client-side fallback for local development
  return "";
}
