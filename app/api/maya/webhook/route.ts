import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "../../supabase";
import dayjs from "dayjs";
import { getDateFromToday } from "@/lib/utils";

const WEBHOOK_STATUS = {
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_EXPIRED: "PAYMENT_EXPIRED",
  PAYMENT_CANCELLED: "PAYMENT_CANCELLED",
};

const handleAssignCredits = async ({ checkoutId }: { checkoutId: string }) => {
  try {
    // we fetch the order data to create a reference for the new records in client packages and user credits
    const { data: orderData } = await supabaseServer
      .from("orders")
      .select("*")
      .eq("checkout_id", checkoutId)
      .single();

    const orderObject = {
      userID: orderData.user_id,
      packageID: orderData.package_id,
      paymentMethod: orderData.payment_method,
      validityPeriod: orderData.package_validity_period,
      packageCredits: orderData.package_credits,
      packageName: orderData.package_title,
    };

    // FETCH FIRST
    const { data: userCredits } = await supabaseServer
      .from("user_credits")
      .select("*")
      .eq("user_id", orderObject.userID)
      .single();

    if (
      userCredits &&
      (userCredits.credits === 0 || userCredits.credits === null)
    ) {
      //NOW UPDATE
      await supabaseServer
        .from("client_packages")
        .update({ status: "expired", expirationDate: dayjs().toISOString() })
        .eq("user_id", orderObject.userID)
        .eq("status", "active");
    }

    await supabaseServer
      .from("client_packages")
      .insert({
        user_id: orderObject.userID,
        package_id: orderObject.packageID,
        status: "active",
        validity_period: orderObject.validityPeriod,
        package_credits: orderObject.packageCredits,
        purchase_date: dayjs().toISOString(),
        package_name: orderObject.packageName,
        payment_method: "maya",
        expiration_date: getDateFromToday(orderObject.validityPeriod),
      })
      .select();
  } catch (error) {
    console.log("error assigning credits: ", error);
  }
};

export async function POST(req: NextRequest) {
  try {
    let orderStatus: string = "";
    let nextResponse: any;
    const payload = await req.json();
    const { requestReferenceNumber, status, checkoutId, totalAmount } = payload;

    let savePurchase = await supabaseServer
      .from("package_purchase_history")
      .insert({
        status,
        referenceID: requestReferenceNumber,
        checkoutID: checkoutId,
      });

    switch (status) {
      case WEBHOOK_STATUS.PAYMENT_SUCCESS:
        nextResponse = {
          received: true,
          message: "Payment successful",
          data: payload,
          savePurchase,
        };

        orderStatus = "SUCCESSFUL";
        break;
      case WEBHOOK_STATUS.PAYMENT_FAILED:
        nextResponse = { received: false, message: "Payment has failed" };
        orderStatus = "FAILED";
        break;
      case WEBHOOK_STATUS.PAYMENT_EXPIRED:
        nextResponse = { received: false, message: "Payment has expired" };
        orderStatus = "EXPIRED";
        break;
      case WEBHOOK_STATUS.PAYMENT_CANCELLED:
        nextResponse = {
          received: false,
          message: "Payment has been cancelled",
        };
        orderStatus = "CANCELLED";
        break;
    }

    if (status === "PAYMENT_SUCCESS") {
      await Promise.all([
        handleAssignCredits({ checkoutId: requestReferenceNumber }).catch(
          (err) => console.error("Assign credits failed:", err),
        ),
        supabaseServer
          .from("orders")
          .update({
            status: status === "PAYMENT_SUCCESS" && "SUCCESSFUL",
            approved_at:
              status === "PAYMENT_SUCCESS" ? dayjs().toISOString() : null,
          })
          .eq("checkout_id", requestReferenceNumber),
      ]);
    }

    return NextResponse.json(nextResponse);
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
