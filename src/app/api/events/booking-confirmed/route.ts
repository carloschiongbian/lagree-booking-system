import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { bookingId, title, startIso } = await req.json();
  await sendEmail(
    user.email!,
    "Lagree booking confirmed",
    `<p>Your booking is confirmed for ${title} on ${new Date(startIso).toLocaleString()}.</p>`
  );
  return NextResponse.json({ ok: true });
}
