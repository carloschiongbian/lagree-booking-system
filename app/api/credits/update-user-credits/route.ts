import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import supabaseServer from "../../supabase";

export async function PUT(req: Request) {
  try {
    const { userID, values } = await req.json();

    const { data, error } = await supabaseServer
      .from("user_credits")
      .update(values)
      .eq("user_id", userID)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
