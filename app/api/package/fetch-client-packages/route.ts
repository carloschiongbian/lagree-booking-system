import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "../../supabase";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function GET(req: NextRequest) {
  try {
    const data = Object.fromEntries(new URL(req.url).searchParams.entries());
    console.log("HERE");
    let query = supabaseServer.from("client_packages").select(`
        *, 
        packages(
            *
        )`);
    const startOfTodayUTC = dayjs().utc().startOf("day").toISOString();
    const endOfTodayUTC = dayjs().utc().endOf("day").toISOString();

    if (data.clientID) {
      query = query.eq("user_id", data.clientID);
    }

    if (data.clientID === undefined && data.findExpiry) {
      /**
       * this gets records that are active and have an expiration_date of the current date
       *
       * query = query.eq("status", "active");
       * query = query.gte("expiration_date", startOfTodayUTC);
       * query = query.lt("expiration_date", endOfTodayUTC);
       */

      /**
       * this gets potentially missed records that were active
       * of today and in the past
       */
      query = query.eq("status", "active");
      query = query.lte("expiration_date", endOfTodayUTC);
    }

    query = query.order("created_at", { ascending: false });

    const { data: packages, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: packages });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Unexpected error: ${err}` },
      { status: 500 }
    );
  }
}
