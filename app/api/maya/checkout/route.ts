import axiosApi from "@/lib/axiosConfig";
import { NextRequest, NextResponse } from "next/server";

const MAYA_SANDBOX_URL = process.env.MAYA_SANDBOX_URL!!;

//taken from maya business API generator
const MAYA_PUBLIC_KEY = process.env.MAYA_PUBLIC_KEY!!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); // ✅ Works here

    const response = await fetch(MAYA_SANDBOX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(MAYA_PUBLIC_KEY + ":").toString(
          "base64"
        )}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to create checkout session",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
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
      { status: 500 }
    );
  }
}
