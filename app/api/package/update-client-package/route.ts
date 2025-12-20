import { NextResponse } from "next/server";
import supabaseServer from "../../supabase";

export async function PUT(req: Request) {
  try {
    const { clientPackageID, values } = await req.json();

    const { data, error } = await supabaseServer
      .from("client_packages")
      .update({
        ...(values?.status && { status: values.status }),
        ...(values?.expirationDate && {
          expiration_date: values.expirationDate,
        }),
        ...(values?.packageCredits && {
          package_credits: values.packageCredits,
        }),
        ...(values?.validityPeriod && {
          validity_period: values.validityPeriod,
        }),
      })
      .eq("id", clientPackageID)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
