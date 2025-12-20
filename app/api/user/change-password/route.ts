import { NextResponse } from "next/server";
import supabaseServer from "../../supabase";

export async function POST(req: Request) {
  try {
    const { id, password } = await req.json();

    const { data, error } = await supabaseServer.auth.admin.updateUserById(id, {
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
