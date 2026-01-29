import { NextResponse } from "next/server";
import supabaseServer from "../../../supabase"; // must use service_role key

export async function GET() {
  try {
    const { data: payments, error: paymentsError } = await supabaseServer
      .from("orders")
      .select(
        `
          *,
          user_profiles (
            id,
            full_name,
            email,
            user_credits (
              credits
            ),
            client_packages (
              id,
              status
            )
          )
        `,
      )
      .eq("user_profiles.client_packages.status", "active")
      .order("created_at", { ascending: false });

    if (paymentsError) {
      return NextResponse.json(
        { error: paymentsError.message },
        { status: 400 },
      );
    }

    const parsed = await Promise.all(
      payments.map(async (item) => {
        let url: string | null = "";
        if (item.payment_proof_path) {
          const { data, error: urlError } = await supabaseServer.storage
            .from("payment-proof")
            .createSignedUrl(item.payment_proof_path, 3600);

          if (data?.signedUrl) {
            url = data?.signedUrl;
          }
        }

        return {
          ...item,
          avatar_url: url,
          currentActivePackage: item?.user_profiles?.client_packages[0],
          userCredits: item?.user_profiles?.user_credits?.[0]?.credits ?? null,
        };
      }),
    );

    // console.log("parsed: ", parsed);

    return NextResponse.json({ payments: parsed });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
