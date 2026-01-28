import axiosApi from "@/lib/axiosConfig";
import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "../../supabase";
import dayjs from "dayjs";

const MAYA_SANDBOX_URL = process.env.MAYA_SANDBOX_URL!!;
const MAYA_PRODUCTION_URL = process.env.MAYA_PRODUCTION_URL!!;

//taken from maya business API generator
const MAYA_PUBLIC_KEY = process.env.MAYA_PUBLIC_KEY!!;
const MAYA_SECRET_KEY = process.env.MAYA_SECRET_KEY!!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); // ✅ Works here

    const { order, checkoutPayload } = body;
    const { requestReferenceNumber } = checkoutPayload;

    // const response = await fetch(MAYA_SANDBOX_URL, {
    const response = await fetch(MAYA_PRODUCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Basic ${Buffer.from(MAYA_PUBLIC_KEY + ":").toString(
        Authorization: `Basic ${Buffer.from(MAYA_SECRET_KEY + ":").toString(
          "base64",
        )}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to create checkout session",
        },
        { status: response.status },
      );
    }

    // console.log("data: ", data);

    // const { data: orderInsert, error } = await supabaseServer
    //   .from("orders")
    //   .insert({
    //     user_id: order.userID,
    //     package_id: order.packageID,
    //     package_credits: order.packageCredits,
    //     package_title: order.packageTitle,
    //     package_price: order.packagePrice,
    //     package_validity_period: order.packageValidityPeriod,
    //     status: "PENDING",
    //     payment_method: "maya",
    //     uploaded_at: dayjs().toISOString(),
    //     checkout_id: requestReferenceNumber,
    //   })
    //   .select();

    // if (error) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: error,
    //     },
    //     { status: 500 },
    //   );
    // }

    return NextResponse.json({
      success: true,
      // order: orderInsert,
      checkoutUrl: data.redirectUrl,
      checkoutId: data.checkoutId,
    });
  } catch (error) {
    console.log("error: ", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
