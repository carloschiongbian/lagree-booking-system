import { Dayjs } from "dayjs";

export const packagePendingPurchase = ({
  packageTitle,
}: {
  packageTitle?: string;
}) => {
  return {
    subject: "Your 8ClubLagree Payment is Pending",
    body: `
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

    <div style="width: 100%; margin-bottom: 30px;">
      <img 
        src="https://lagree-booking-system.vercel.app/images/main-logo.png"
        margin-bottom:20px;"
        alt="main-logo" 
        width="120"
        style="display:block; margin: auto;" />
    </div>

    <!-- Header -->
    <h2 style="
      margin:0 0 20px 0;
      font-size:22px;
      font-weight:600;
      color:#36013F;
      text-align:center;
    ">
      Your purchase is pending
    </h2>

    <!-- Package -->
    <h2 style="
      margin:0 0 20px 0;
      font-size:30px;
      font-weight:600;
      color:#36013F;
      text-align:center;
    ">
      ${packageTitle}
    </h2>

    <!-- Body Paragraph (your exact content) -->
    <p style="
      font-size:16px;
      line-height:1.6;
      color:#333;
      margin:0 0 10px 0;
      text-align: center;
      margin-bottom: 10px;
    ">
      Your purchase of ${packageTitle} is now pending.
    </p> 
    <p style="
      font-size:16px;
      line-height:1.6;
      color:#333;
      margin:0 0 10px 0;
      text-align: justify;
    ">
      Your purchase of ${packageTitle} is now pending.<br/>
      We ask for your patience as we review your proof of payment as soon as we can.
      Once confirmed, you will receive another email that successfully confirms your transaction.
    </p> 

    <p style="
      font-size:12px;
      line-height:1.6;
      color:#333;
      margin:0 0 10px 0;
      text-align:center;
    ">
      Should you have any concerns, please reach out to us via our Instagram or email us here.
    </p> 

  </div>
</div>
`,
  };
};

export const packagePurchase = ({
  packageTitle,
}: {
  packageTitle?: string;
}) => {
  return {
    subject: "Your 8 Club Lagree Payment and Package is Confirmed",
    body: `
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

   <div style="width: 100%; margin-bottom: 30px;">
      <img 
        src="https://lagree-booking-system.vercel.app/images/main-logo.png"
        margin-bottom:20px;"
        alt="main-logo" 
        width="120"
        style="display:block; margin: auto;" />
    </div>

    <!-- Header -->
    <h2 style="
      margin:0 0 20px 0;
      font-size:22px;
      font-weight:600;
      color:#36013F;
      text-align:center;
    ">
      Thank you for your purchase!
    </h2>

    <!-- Package -->
    <h2 style="
      margin:0 0 20px 0;
      font-size:30px;
      font-weight:600;
      color:#36013F;
      text-align:center;
    ">
      ${packageTitle}
    </h2>

    <!-- Body Paragraph (your exact content) -->
    <p style="
      font-size:16px;
      line-height:1.6;
      color:#333;
      margin:0 0 10px 0;
      text-align: justify;
    ">
      Your package has been successfully added to your account.<br/>
      You may now book classes using your available credits.
    </p> 

  </div>
</div>
`,
  };
};

export const classBookingConfirmation = ({
  className,
  date,
  time,
  instructor,
}: {
  className?: string;
  date?: Dayjs;
  time?: Dayjs;
  instructor?: string;
} = {}) => {
  return {
    subject: "8 Club Lagree Class Booking Confirmed",

    body: `
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

   <div style="width: 100%; margin-bottom: 30px;">
      <img 
        src="https://lagree-booking-system.vercel.app/images/main-logo.png"
        margin-bottom:20px;"
        alt="main-logo" 
        width="120"
        style="display:block; margin: auto;" />
    </div>

    <!-- Header -->
    <h2 style="
      margin:0 0 20px 0;
      font-size:30px;
      font-weight:600;
      color:#36013F;
      text-align:center;
    ">
      Your class is confirmed!
    </h2>

    <!-- Package -->
    <h2 style="
      margin:0 0 20px 0;
      font-size:18px;
      font-weight:600;
      color:#36013F;
      text-align: justify;
    ">
      You booked a class </br></br><span style="color: red">${date}</span> at <span style="color: red">${time}</span> with <span style="color: red">${instructor}</span>
    </h2>

    <!-- Body Paragraph (your exact content) -->
    <p style="
      font-size:16px;
      line-height:1.6;
      color:#333;
      margin:0 0 10px 0;
      text-align: center;
    ">
      Please arrive 10 to 15 minutes before the time.
    </p> 

  </div>
</div>
    `,
  };
};

export const EMAIL_TEMPLATE: any = {
  package_purchase: packagePurchase,
  package_pending_purchase: packagePendingPurchase,
  class_booking_confirmation: classBookingConfirmation,
};
