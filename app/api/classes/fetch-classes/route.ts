import { NextRequest, NextResponse } from "next/server";
import supabaseServer from "../../supabase";
import dayjs from "dayjs";

export async function GET(req: NextRequest) {
  try {
    const data = Object.fromEntries(new URL(req.url).searchParams.entries());
    const {
      isAdmin,
      isInstructor,
      userId,
      startDate,
      endDate,
      selectedDate,
      instructorId,
    } = data;

    const formattedSelectedDate = dayjs(selectedDate);

    const nowISO = dayjs().toISOString();
    const today = dayjs().startOf("day");
    let query = supabaseServer.from("classes").select(`
      *,
      instructors (
        id,
        user_id,
        full_name,
        avatar_path,
        user_profiles (
          id,
          avatar_path,
          deactivated,
          full_name,
          first_name
        )
      ),
      class_bookings (
        id,
        attendance_status,
        booker_id,
        class_id,
        walk_in_first_name,
        walk_in_last_name,
        user_profiles (
          id,
          full_name
        )
      )
    `);

    if (userId) {
      query = query.eq("class_bookings.booker_id", userId);
    }

    if (isInstructor && instructorId) {
      query = query.eq("instructor_id", instructorId);
    }

    if (startDate && endDate) {
      query = query
        .gte("class_date", dayjs(startDate).format("YYYY-MM-DD"))
        .lte("class_date", dayjs(endDate).format("YYYY-MM-DD"));
    }

    if (formattedSelectedDate) {
      const startOfSelectedUTC = formattedSelectedDate
        .startOf("day")
        // .subtract(8, "hour")
        .toISOString();
      const endOfSelectedUTC = formattedSelectedDate
        .endOf("day")
        // .subtract(8, "hour")
        .toISOString();

      query = query
        .gte("class_date", startOfSelectedUTC)
        .lte("class_date", endOfSelectedUTC);

      // If selected day is today, and the caller is NOT admin and NOT instructor,
      // only show classes that haven't started yet.
      if (
        !isAdmin &&
        !isInstructor &&
        formattedSelectedDate.isSame(today, "day")
      ) {
        query = query.gte("start_time", nowISO);
      }
    }

    query = query.order("start_time", { ascending: true });

    const { data: classData, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: classData });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
