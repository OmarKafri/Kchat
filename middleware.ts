import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: Request) {
  const session = await auth();
  const { pathname } = new URL(req.url);

  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
