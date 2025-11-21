
export function getApiBaseUrl(): string {
 
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }


  return "";
}
