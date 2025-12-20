import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "../../supabase";

export async function GET(req: NextRequest) {
  try {
    const data = Object.fromEntries(new URL(req.url).searchParams.entries());
    const name = data.name;

    let query = supabaseServer.from("instructors").select(`
      *,
      user_profiles (*)
      `);

    if (!!name?.length) {
      query = query.ilike("full_name", `%${name}%`);
    }

    const { data: instructors, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: instructors });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
