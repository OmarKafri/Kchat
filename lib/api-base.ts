// Helper to get the base URL for API calls
// Works for both server and client

export function getApiBaseUrl(): string {
  // Check for environment variable first (can be set for production)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // On server (during SSR or server actions)
  if (typeof window === "undefined") {
    // Default to localhost for server-side calls
    // In production, you should set NEXT_PUBLIC_API_URL env variable
    return "http://localhost:3000";
  }
  
  // On client - use current origin (works on any device)
  return window.location.origin;
}

