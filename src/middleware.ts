import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Placeholder for auth-gated routes in the future
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
