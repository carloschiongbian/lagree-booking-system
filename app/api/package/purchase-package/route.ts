import { NextResponse } from "next/server";
import supabaseServer from "../../supabase";
import { getDateFromToday } from "@/lib/utils";
import dayjs from "dayjs";

export async function POST(req: Request) {
  try {
    const {
      userID,
      packageID,
      paymentMethod,
      validityPeriod,
      packageCredits,
      packageName,
    } = await req.json();

    const today = dayjs();

    const { data, error } = await supabaseServer
      .from("client_packages")
      .insert({
        user_id: userID,
        package_id: packageID,
        status: "active",
        validity_period: validityPeriod,
        package_credits: packageCredits,
        purchase_date: today,
        package_name: packageName,
        payment_method: paymentMethod,
        expiration_date: getDateFromToday(validityPeriod),
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
