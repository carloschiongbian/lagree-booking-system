import { NextResponse } from "next/server";
import supabaseServer from "../../supabase"; // must use service_role key

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    const { data, error }: any = await supabaseServer
      .from("packages")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
