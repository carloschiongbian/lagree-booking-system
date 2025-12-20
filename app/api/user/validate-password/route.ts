import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "../../supabase";

export async function GET(req: NextRequest) {
  try {
    const data = Object.fromEntries(new URL(req.url).searchParams.entries());
    const email = data.email;
    const password = data.password;

    const { data: authed, error } =
      await supabaseServer.auth.signInWithPassword({
        email,
        password,
      });

    if (error) return null;

    return NextResponse.json({ data: authed });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
