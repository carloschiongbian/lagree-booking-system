import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/api/:path*"],
};

export async function middleware(req: NextRequest) {
  const { headers, nextUrl } = req;
  const { pathname } = nextUrl;
  const origin = req.nextUrl.origin;

  const authHeader = headers.get("authorization");

  const data = Object.fromEntries(new URL(req.url).searchParams.entries());
  if (data.type === "about") {
    return NextResponse.next();
  }
  if (data.type === "reset-link") {
    return NextResponse.next();
  }

  // ✅ Allow Maya webhooks
  if (pathname.startsWith("/api/maya/webhook")) {
    return NextResponse.next();
  }

  // PUSH CHANGES TO REPOSITORY
  // TEST WEBHOOK IN TEMPORARY URL

  // for dev environment
  // if (origin !== process.env.SYSTEM_ORIGIN_TEST!) {
  // for production
  if (origin !== process.env.SYSTEM_ORIGIN!) {
    // temp production fix
    // if (origin !== process.env.SYSTEM_ORIGIN_TEMP!) {
    return NextResponse.json({ error: "Unauthorized Origin" }, { status: 401 });
  }

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized Token" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL!!}/auth/v1/user`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  return NextResponse.next();
}
