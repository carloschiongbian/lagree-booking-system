import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "../../supabase";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const data = Object.fromEntries(url.searchParams.entries());
    const email = data.email;
    const password = data.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const { data: authed, error } =
      await supabaseServer.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ data: authed });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
