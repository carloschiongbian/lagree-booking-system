import { NextResponse } from "next/server";
import supabaseServer from "../../supabase"; // must use service_role key
import dayjs from "dayjs";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    // const { error: authDeleteError } =
    //   await supabaseServer.auth.admin.deleteUser(id);

    // console.log("authDeleteError: ", authDeleteError);

    const { data, error: profileSoftDeleteError }: any = await supabaseServer
      .from("user_profiles")
      .update({ deleted_at: dayjs().toISOString() })
      .eq("id", id)
      .select();

    // console.log("profileDeleteError: ", profileSoftDeleteError);

    // if (data?.user_type === "instructor") {
    //   const { error: deleteInstructorError } = await supabaseServer
    //     .from("instructors")
    //     .delete()
    //     .eq("user_id", id)
    //     .select();

    //   if (deleteInstructorError) {
    //     return NextResponse.json(
    //       { error: deleteInstructorError.message },
    //       { status: 400 },
    //     );
    //   }
    // }

    // if (authDeleteError) {
    //   return NextResponse.json(
    //     { error: authDeleteError.message },
    //     { status: 400 },
    //   );
    // }

    if (profileSoftDeleteError) {
      return NextResponse.json(
        { error: profileSoftDeleteError.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ data: data });
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
