import { NextResponse } from "next/server";
import supabaseServer from "../../supabase"; // must use service_role key
import axios from "axios";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface OrderData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  amount: number;
  currency: string;
  product_name: string;
  product_description?: string;
  status: string;
}

interface PaymentData {
  method: "card" | "paymaya" | "gcash";
  card?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface PaymentMethodPayload {
  data: {
    attributes: {
      type: string;
      details?: {
        card_number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
      };
      billing: {
        name: string;
        email: string;
        phone?: string;
      };
    };
  };
}

export async function POST(req: Request) {
  try {
    const {
      selectedPackage,
      order,
      payment,
    }: { selectedPackage: any; order: OrderData; payment: PaymentData } =
      await req.json();

    const paymongoSecretKey = process.env.PAYMONGO_SECRET_TEST;

    if (!paymongoSecretKey) {
      throw new Error("PAYMONGO_SECRET_KEY is not configured");
    }

    const authHeader = `Basic ${btoa(paymongoSecretKey)}`;

    /**
     * REPLACE WITH DATA COMING FROM API REQUEST BODY
     */

    //place package for this
    const SAMPLE_ORDER = {
      userID: "c51ee2fe-e8cc-4aeb-84c3-2a47d54c8a2f",
      packageID: "a9d2544e-1f1c-4c76-8463-c0b6c44f1afc",
      paymentMethod: "card",
      packageName: "10 Sessions Package",
      validityPeriod: "30",
      packageCredits: "10",
    };

    const { error: packageError } = await supabaseServer
      .from("client_packages")
      .insert(selectedPackage)
      .select()
      .single();

    if (packageError) {
      return NextResponse.json(
        {
          error: `Unexpected error saving client package: ${JSON.stringify(
            packageError
          )}`,
        },
        { status: 500 }
      );
    }

    const { data: orderRecord, error: orderError } = await supabaseServer
      .from("orders")
      .insert(order)
      .select()
      .single();

    const allowedMethods =
      payment.method === "card" ? ["card"] : [payment.method];

    const paymentIntentResponse = await fetch(
      "https://api.paymongo.com/v1/payment_intents",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: order.amount,
              currency: order.currency,
              description: `${order.product_name} - Order ${orderRecord.id}`,
              statement_descriptor: order.product_name.substring(0, 22),
              payment_method_allowed: allowedMethods,
            },
          },
        }),
      }
    );

    if (!paymentIntentResponse.ok) {
      const errorData = await paymentIntentResponse.json();

      await supabaseServer
        .from("orders")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderRecord.id);

      throw new Error(`Paymongo API error: ${JSON.stringify(errorData)}`);
    }

    const paymentIntentData = await paymentIntentResponse.json();
    const paymentIntentId = paymentIntentData.data.id;
    const clientKey = paymentIntentData.data.attributes.client_key;

    let paymentMethodType = "card";
    let paymentMethodPayload: PaymentMethodPayload;

    if (payment.method === "card") {
      paymentMethodPayload = {
        data: {
          attributes: {
            type: "card",
            details: {
              card_number: payment.card!.number,
              exp_month: payment.card!.exp_month,
              exp_year: payment.card!.exp_year,
              cvc: payment.card!.cvc,
            },
            billing: {
              name: payment.billing.name,
              email: payment.billing.email,
              phone: payment.billing.phone,
            },
          },
        },
      };
    } else if (payment.method === "paymaya") {
      paymentMethodType = "paymaya";
      paymentMethodPayload = {
        data: {
          attributes: {
            type: "paymaya",
            billing: {
              name: payment.billing.name,
              email: payment.billing.email,
              phone: payment.billing.phone,
            },
          },
        },
      };
    } else if (payment.method === "gcash") {
      paymentMethodType = "gcash";
      paymentMethodPayload = {
        data: {
          attributes: {
            type: "gcash",
            billing: {
              name: payment.billing.name,
              email: payment.billing.email,
              phone: payment.billing.phone,
            },
          },
        },
      };
    } else {
      await supabaseServer
        .from("orders")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderRecord.id);
      throw new Error(`Unsupported payment method: ${payment.method}`);
    }

    const paymentMethodResponse = await fetch(
      "https://api.paymongo.com/v1/payment_methods",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(paymentMethodPayload),
      }
    );

    if (!paymentMethodResponse.ok) {
      const errorData = await paymentMethodResponse.json();

      await supabaseServer
        .from("orders")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderRecord.id);

      throw new Error(
        `Failed to create payment method: ${JSON.stringify(errorData)}`
      );
    }

    const paymentMethodData = await paymentMethodResponse.json();
    const paymentMethodId = paymentMethodData.data.id;

    const attachResponse = await fetch(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId,
              client_key: clientKey,
              return_url: `${
                req.headers.get("origin") || "http://localhost:5173"
              }/payment-success`,
            },
          },
        }),
      }
    );

    if (!attachResponse.ok) {
      const errorData = await attachResponse.json();

      await supabaseServer
        .from("orders")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderRecord.id);

      throw new Error(
        `Failed to attach payment method: ${JSON.stringify(errorData)}`
      );
    }

    const attachData = await attachResponse.json();
    const paymentStatus = attachData.data.attributes.status;

    await supabaseServer
      .from("orders")
      .update({
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId,
        status: paymentStatus === "succeeded" ? "succeeded" : "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderRecord.id);

    const response: {
      success: boolean;
      orderId: string;
      status: string;
      redirect_url?: string;
    } = {
      success: true,
      orderId: orderRecord.id,
      status: paymentStatus,
    };

    if (
      paymentStatus === "awaiting_next_action" &&
      attachData.data.attributes.next_action
    ) {
      response.redirect_url =
        attachData.data.attributes.next_action.redirect.url;
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Payment processing error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
