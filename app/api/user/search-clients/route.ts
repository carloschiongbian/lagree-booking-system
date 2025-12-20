import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "../../supabase";

export async function GET(req: NextRequest) {
  try {
    const data = Object.fromEntries(new URL(req.url).searchParams.entries());
    const name = data.name;

    let query = supabaseServer
      .from("user_profiles")
      .select(
        `*,
        user_credits (
        id,
        credits
        ),
        class_bookings (      
                attendance_status,
                booker_id,
                class_date,
                class_id,
                id,
            classes (
                id,
                start_time,
                end_time,
                class_name,
                instructor_id,
                instructor_name,
                instructors (
                id,
                full_name,
                avatar_path
                )
            )
        ),
        client_packages (
            *,
            id,
            package_id,
            status,
            package_name,
            purchase_date, 
            package_credits,
            validity_period,
            expiration_date
        )
        `
      )
      .eq("user_type", "general")
      .order("created_at", {
        ascending: false,
        foreignTable: "class_bookings",
      });

    if (!!name?.length) {
      query = query.ilike("full_name", `%${name}%`);
    }

    const { data: clients, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: clients });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
