import "dotenv/config";
import dayjs from "dayjs";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import supabaseServer from "../supabase";

// --- Move your main logic here ---
async function checkUpcomingClasses() {
  console.log("Running test: checking upcoming classes...");

  const now = dayjs();
  const in24h = now.add(24, "hour");

  // SQL filter only by class_date so it stays lightweight
  const { data: bookings, error } = await supabaseServer
    .from("class_bookings")
    .select(
      `
      id,
      class_date,
      user_profiles (
        id,
        first_name,
        full_name,
        email
      ),
      classes (
        id,
        start_time,
        instructor_name
      )
    `,
    )
    .gte("class_date", now.startOf("day").toISOString())
    .lte("class_date", in24h.endOf("day").toISOString())
    .eq("sent_email_reminder", false);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ success: false, error });
  }

  if (!bookings?.length) {
    console.log(
      "No upcoming classes in the next 24 hours that need reminders.",
    );
    return NextResponse.json({
      success: true,
      message: "No reminders needed",
    });
  }

  console.log("classes within the next 24 hours:", bookings);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT) || 587,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  for (const booking of bookings) {
    const classInfo: any = booking.classes;
    const user: any = booking.user_profiles;

    await transporter.sendMail({
      from: '"8ClubLagree" <8clublagree@gmail.com>',
      to: user?.email,
      subject: `Reminder: Your class is tomorrow!`,
      html: `
     <div style="width:100%; background:#f4f4f4; padding:40px 0;">
    <div style="
      max-width:480px;
      margin:0 auto;
      background:#ffffff;
      padding:32px;
      border-radius:10px;
      border:1px solid #e6e6e6;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
      color:#333333;
    ">

      <!-- Header -->
      <h2 style="
        margin:0 0 20px 0;
        font-size:28px;
        font-weight:600;
        color:#36013F;
        text-align:center;
      ">
        Hey ${user.first_name}!
      </h2>

      <!-- Package -->
      <h2 style="
        margin:0 0 20px 0;
        font-size:18px;
        font-weight:600;
        color:#36013F;
        text-align:center;
      ">
        Your upcoming class is on <span style="color: red">${`${dayjs(
          booking.class_date,
        ).format("MMMM DD YYYY")}`}</span></br>
        It starts at <span style="color: red">${dayjs(
          classInfo.start_time,
        ).format("hh:mm A")}</span> with <span style="color: red">${
          classInfo.instructor_name
        }</span>.
      </h2>

      <!-- Body Paragraph (your exact content) -->
      <p style="
        font-size:18px;
        line-height:1.6;
        color:#333;
        margin:0 0 10px 0;
        text-align:center;
      ">
        Please arrive 10 to 15 minutes early.</br>We're looking forward to your visit!
      </p>

    </div>
  </div>
    `,
    });

    await supabaseServer
      .from("class_bookings")
      .update({ sent_email_reminder: true })
      .eq("id", booking.id);

    console.log(
      `Reminder sent to ${user.email} for class on ${dayjs(
        booking.class_date,
      ).format("MMMM DD YYYY")}`,
    );
  }

  return NextResponse.json({ success: true, sent: bookings.length });
}

// --- CRON: runs every hour at minute 0 ---
// cron.schedule("0 * * * *", checkUpcomingClasses);

// --- CRON: runs every minute for testing ---
// cron.schedule("* * * * *", checkUpcomingClasses);

// --- TEST MODE: run immediately when script starts ---
// checkUpcomingClasses();

export async function GET() {
  // Optional: verify secret to secure endpoint

  try {
    await checkUpcomingClasses();
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Cron failed:", err);
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 },
    );
  }
}
