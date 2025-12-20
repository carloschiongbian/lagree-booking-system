import { NextResponse } from "next/server";
import supabaseServer from "../../supabase"; // must use service_role key

export async function POST(req: Request) {
  try {
    const { id, values } = await req.json();

    const { data, error } = await supabaseServer
      .from("user_profiles")
      .update(values)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
