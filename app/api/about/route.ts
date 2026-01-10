import { NextResponse } from "next/server";
import supabaseServer from "../supabase"; // must use service_role key
import dayjs from "dayjs";

export async function GET() {
  try {
    const startOfSelectedUTC = dayjs()
      .startOf("day")
      .subtract(8, "hour")
      .toISOString();
    const endOfSelectedUTC = dayjs()
      .endOf("day")
      .subtract(8, "hour")
      .toISOString();

    const [classesRes, trainersRes, schedulesRes] = await Promise.all([
      supabaseServer.from("classes").select("*").order("created_at"),
      supabaseServer
        .from("user_profiles")
        .select(`*, instructors(certification)`)
        .eq("user_type", "instructor")
        .order("created_at"),
      supabaseServer
        .from("classes")
        .select(
          `*, instructors(user_id, user_profiles(full_name, avatar_path))`
        )
        .order("created_at", { ascending: false })
        .gte("class_date", startOfSelectedUTC)
        .lte("class_date", endOfSelectedUTC),
    ]);

    if (classesRes.error) {
      return NextResponse.json(
        { error: classesRes.error.message },
        { status: 400 }
      );
    }
    if (trainersRes.error) {
      return NextResponse.json(
        { error: trainersRes.error.message },
        { status: 400 }
      );
    }
    if (schedulesRes.error) {
      return NextResponse.json(
        { error: schedulesRes.error.message },
        { status: 400 }
      );
    }

    const [trainers, schedules] = await Promise.all([
      Promise.all(
        trainersRes.data?.map(async (instructor) => {
          if (!instructor.avatar_path)
            return { ...instructor, avatar_path: null };

          const { data, error: urlError } = await supabaseServer.storage
            .from("user-photos")
            .createSignedUrl(`${instructor.avatar_path}`, 3600);

          if (urlError) {
            console.error("Error generating signed URL:", urlError);
            return { ...instructor, avatar_path: null };
          }

          return { ...instructor, avatar_path: data?.signedUrl ?? null };
        }) || []
      ),

      Promise.all(
        schedulesRes.data?.map(async (schedule) => {
          const avatar = schedule.instructors.user_profiles.avatar_path;
          if (!avatar) return { ...schedule, avatar_path: null };

          const { data, error: urlError } = await supabaseServer.storage
            .from("user-photos")
            .createSignedUrl(`${avatar}`, 3600);

          if (urlError) {
            console.error("Error generating signed URL:", urlError);
            return { ...schedule, avatar_path: null };
          }

          return { ...schedule, avatar_path: data?.signedUrl ?? null };
        }) || []
      ),
    ]);

    return NextResponse.json({
      data: {
        classesRes,
        trainersRes: { data: trainers },
        schedulesRes: { data: schedules },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
