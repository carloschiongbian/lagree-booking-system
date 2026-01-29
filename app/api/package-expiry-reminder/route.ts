import "dotenv/config";
import cron from "node-cron";
import dayjs from "dayjs";

import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import supabaseServer from "../supabase";

// --- Move your main logic here ---
async function checkExpiringPackages() {
  console.log("Checking package expiration warnings...");

  const now = dayjs();
  const tenDays = now.add(10, "day");

  const { data: packages, error }: any = await supabaseServer
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
    `,
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
      from: '"8ClubLagree" <8clublagree@gmail.com>',
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
          You have <span style="color: red">${currentCredits}</span> left from your package!
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
    await supabaseServer
      .from("client_packages")
      .update({ sent_initial_expiration_email: true })
      .eq("id", pkg.id);

    console.log(`Expiration warning sent to ${user.email}`);
  }

  return NextResponse.json({ success: true, count: packages.length });
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
    await checkExpiringPackages();
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Cron failed:", err);
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 },
    );
  }
}
