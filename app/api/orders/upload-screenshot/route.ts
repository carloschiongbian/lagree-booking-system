import { NextResponse } from "next/server";
import supabaseServer from "../../supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    const { data, error: uploadError } = await supabaseServer.storage
      .from("payment-proof")
      .upload(fileName, file as File, {
        upsert: true, // overwrite if exists
        contentType: file.type,
      });

    console.log("uploadError: ", uploadError);
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.log("err: ", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
