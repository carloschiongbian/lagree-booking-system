import { NextResponse } from "next/server";
import supabaseServer from "../../supabase";

export async function POST(req: Request) {
  try {
    const { values } = await req.json();

    // const { error: uploadError } = await supabaseServer.storage
    //   .from(process.env.PAYMENT_STORAGE_BUCKET!)
    //   .upload(values.fileName, values.originFileObj as File, {
    //     upsert: true, // overwrite if exists
    //     contentType: "image/png",
    //   });

    // if (uploadError) {
    //   return NextResponse.json({ error: uploadError.message }, { status: 400 });
    // }

    const {
      userID,
      status,
      manualPaymentMethod,
      uploadedAt,
      paymentProofPath,
      packageID,
      packageTitle,
      packagePrice,
      packageCredits,
      packageValidityPeriod,
    } = values;

    const { data, error } = await supabaseServer.from("orders").insert({
      status,
      payment_method: manualPaymentMethod,
      payment_proof_path: paymentProofPath,
      user_id: userID,
      package_id: packageID,
      uploaded_at: uploadedAt,
      package_title: packageTitle,
      package_credits: packageCredits,
      package_price: packagePrice,
      package_validity_period: packageValidityPeriod,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      status: 200,
      data: data,
      message: "Proof uploaded successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
