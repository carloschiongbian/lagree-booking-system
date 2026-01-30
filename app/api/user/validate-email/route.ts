import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "../../supabase";

export async function GET(req: NextRequest) {
  try {
    const data = Object.fromEntries(new URL(req.url).searchParams.entries());

    const { data: profile, error } = await supabaseServer
      .from("user_profiles")
      .select("*")
      .eq("email", data.email)
      .single();

    if (error) {
      return NextResponse.json({ data: null });
    }

    // trigger deployment
    return NextResponse.json({ data: profile });
  } catch (err: any) {
    console.log("err: ", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
