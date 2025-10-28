import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: Request) {
  const session = await auth();
  const { pathname } = new URL(req.url);

  // If user is authenticated and tries to visit login/register → redirect to dashboard
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is NOT authenticated and tries to visit dashboard → redirect to login
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Apply globally (optional)
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
