import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = supabaseServer();
  // Find classes starting ~24 hours from now and send reminders
  const from = new Date(Date.now() + 23 * 60 * 60 * 1000);
  const to = new Date(Date.now() + 25 * 60 * 60 * 1000);

  const { data: schedules, error: err1 } = await supabase
    .from("class_schedules")
    .select("id, title, start_time")
    .gte("start_time", from.toISOString())
    .lte("start_time", to.toISOString());
  if (err1) return NextResponse.json({ error: err1.message }, { status: 500 });

  for (const s of schedules || []) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("schedule_id", s.id)
      .eq("status", "booked");

    for (const b of bookings || []) {
      const { data: profile } = await supabase.auth.admin.getUserById(b.user_id);
      const email = profile?.user?.email;
      if (email) {
        await sendEmail(
          email,
          "Class reminder",
          `<p>Reminder: ${s.title} at ${new Date(s.start_time).toLocaleString()}</p>`
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
