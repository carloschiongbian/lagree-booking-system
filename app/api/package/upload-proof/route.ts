import { NextResponse } from "next/server";
import supabaseServer from "../../supabase";

export async function POST(req: Request) {
  try {
    const { values } = await req.json();

    const { error: uploadError } = await supabaseServer.storage
      .from(process.env.STORAGE_BUCKET!)
      .upload(values.fileName, values.originFileObj as File, {
        upsert: true, // overwrite if exists
        contentType: (values.file as File).type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    return NextResponse.json({
      status: 200,
      message: "File uploaded successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
