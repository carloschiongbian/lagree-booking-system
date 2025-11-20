import "dotenv/config";
import cron from "node-cron";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// --- Move your main logic here ---
async function checkUpcomingClasses() {
  console.log("Running test: checking upcoming classes...");

  const now = dayjs();
  const in24h = now.add(24, "hour");

  // SQL filter only by class_date so it stays lightweight
  const { data: bookings, error } = await supabase
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
    `
    )
    .gte("class_date", now.startOf("day").toISOString())
    .lte("class_date", in24h.endOf("day").toISOString())
    .eq("sent_email_reminder", false);

  if (error) console.error("Supabase error:", error);

  if (!bookings?.length) {
    console.log(
      "No upcoming classes in the next 24 hours that need reminders."
    );
    return;
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

  if (bookings?.length) {
    for (const booking of bookings) {
      const classInfo: any = booking.classes;
      const user: any = booking.user_profiles;

      await transporter.sendMail({
        from: '"My App" <no-reply@myapp.com>',
        to: user.email,
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
          booking.class_date
        ).format("MMMM DD YYYY")}`}</span></br>
        It starts at <span style="color: red">${dayjs(
          classInfo.start_time
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

      await supabase
        .from("class_bookings")
        .update({ sent_email_reminder: true })
        .eq("id", booking.id);

      console.log(
        `Reminder sent to ${user.email} for class on ${dayjs(
          booking.class_date
        ).format("MMMM DD YYYY")}`
      );
    }
  } else {
    console.log("No classes in the next 24 hours.");
  }
}

async function checkExpiringPackages() {
  console.log("Checking package expiration warnings...");

  const now = dayjs();
  const tenDays = now.add(10, "day");

  const { data: packages, error }: any = await supabase
    .from("client_packages")
    .select(
      `
      id,
      expiration_date,
      status,
      sent_initial_expiration_email,
      user_profiles:user_id (
        id,
        first_name,
        full_name,
        email,
        user_credits (
          id,
          credits
        )
      )
    `
    )
    .eq("status", "active")
    .eq("sent_initial_expiration_email", false)
    .gte("expiration_date", now.startOf("day").toISOString())
    .lte("expiration_date", tenDays.endOf("day").toISOString());

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error });
  }

  if (!packages?.length) {
    console.log("No packages expiring within 10 days.");
    return NextResponse.json({ message: "No packages to notify." });
  }

  console.log("Packages:", packages);
  console.log("Packages length:", packages.length);

  // Email settings
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT) || 587,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  for (const pkg of packages) {
    const user: any = pkg.user_profiles;
    const currentCredits = user?.user_credits?.[0]?.credits;
    const expiry = dayjs(pkg.expiration_date).format("MMMM DD, YYYY");

    await transporter.sendMail({
      from: '"My App" <no-reply@myapp.com>',
      to: user.email,
      subject: "Your package is expiring soon",
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
        margin:0 0 10px 0;
        font-size:18px;
        font-weight:600;
        color:#36013F;
        text-align:center;
      ">
        Just a quick reminder that your current package will expire on <span style="color: red">${expiry}</span>        
      </h2>

      ${
        currentCredits &&
        `<h2 style="
          margin:0 0 20px 0;
          font-size:18px;
          font-weight:600;
          color:#36013F;
          text-align:center;
        ">
          You have <span style="color: red">${currentCredits}</span> credits remaining from your package!
        </h2>`
      }

      <!-- Body Paragraph (your exact content) -->
      <table
        width="100%"
        border="0"
        cellspacing="0"
        cellpadding="0"
      >
        <tr style="text-align: center">
          <td>
            <a
              href="https://lagree-booking-system.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style="text-decoration: none;"
            >
              <button
                style="
                  background-color: #36013F;
                  color: white;
                  border: 1px solid #36013F;
                  padding: 10px 15px;
                  border-radius: 15px;
                  cursor: pointer;
                "
              >
                Schedule a Class
              </button>
            </a>
          </td>
        </tr>
      </table>
    </div>
  </div>
    `,
    });

    // Mark package as notified
    await supabase
      .from("client_packages")
      .update({ sent_initial_expiration_email: true })
      .eq("id", pkg.id);

    console.log(`Expiration warning sent to ${user.email}`);
  }

  return NextResponse.json({ success: true, count: packages.length });
}

// --- CRON: runs every hour at minute 0 ---
cron.schedule("0 * * * *", checkExpiringPackages);

// --- CRON: runs every minute for testing ---
// cron.schedule("* * * * *", checkUpcomingClasses);

// --- TEST MODE: run immediately when script starts ---
checkExpiringPackages();
