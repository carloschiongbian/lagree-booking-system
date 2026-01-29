import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import { EMAIL_TEMPLATE } from "@/lib/email-templates";
import { MailtrapTransport } from "mailtrap";

type EmailTypes =
  | "package_purchase"
  | "package_pending_purchase"
  | "class_booking_confirmation";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    let subject: any;
    let template: any;
    const request = await req.json();
    const {
      to,
      emailType,
      title: packageTitle,
      instructor,
      date,
      time,
      className,
    } = request;

    if (!emailType) {
      return NextResponse.json(
        { message: "No email type provided" },
        { status: 500 },
      );
    }

    if (emailType === "package_purchase") {
      template = EMAIL_TEMPLATE[emailType];
      const { subject: templateSubject, body: templateBody } = template({
        packageTitle,
      });

      subject = templateSubject;
      body = templateBody;
    }

    if (emailType === "package_pending_purchase") {
      template = EMAIL_TEMPLATE[emailType];
      const { subject: templateSubject, body: templateBody } = template({
        packageTitle,
      });

      subject = templateSubject;
      body = templateBody;
    }

    if (emailType === "class_booking_confirmation") {
      template = EMAIL_TEMPLATE[emailType];
      const { subject: templateSubject, body: templateBody } = template({
        instructor,
        date,
        time,
        className,
      });

      subject = templateSubject;
      body = templateBody;
    }

    /**
     * SANDBOX SNIPPET START
     */

    // const transport = nodemailer.createTransport({
    //   host: process.env.MAILTRAP_HOST,
    //   port: Number(process.env.MAILTRAP_PORT) || 587,
    //   auth: {
    //     user: process.env.MAILTRAP_USERNAME,
    //     pass: process.env.MAILTRAP_PASSWORD,
    //   },
    // });

    // const info = await transport.sendMail({
    //   from: '"8ClubLagree" <8clublagree@gmail.com>',
    //   to,
    //   subject,
    //   html: body,
    // });

    /**
     * SANDBOX SNIPPET END
     */
    // ==========================================

    /**
     * REAL EMAILS SNIPPET START
     * THIS UTILIZES THE API TOKEN FROM MAILTRAP
     */

    const recipients = [to];

    // Mailtrap SMTP transporter
    const transport = nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN!,
      }),
    );

    const sender = {
      address: "test@8clublagree.com",
      name: "8 Club Lagree",
    };
    const info = await transport.sendMail({
      from: sender,
      to: recipients,
      subject,
      html: body,
    });

    /**
     * REAL EMAILS SNIPPET END
     */

    return NextResponse.json({ message: "Email sent", info });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error sending email", error },
      { status: 500 },
    );
  }
}
