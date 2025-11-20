import { Dayjs } from "dayjs";

export const packagePurchase = ({
  packageTitle,
}: {
  packageTitle?: string;
}) => {
  return {
    subject: "Your Supra8 Lagree Payment and Package is Confirmed",
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
      text-align:center;
    ">
      Your package has been successfully added to your account.<br/>
      You may now book classes using your available credits.
    </p> 

  </div>
</div>
`,
  };
};

// export const successfulPayment = () => {
//   return {
//     subject: "Supra8 Lagree Payment Successful",
//     body: `
//     <div style="width:100%; background:#f4f4f4; padding:40px 0;">
//   <div style="
//     max-width:480px;
//     margin:0 auto;
//     background:#ffffff;
//     padding:32px;
//     border-radius:10px;
//     border:1px solid #e6e6e6;
//     font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
//     color:#333333;
//   ">

//     <!-- Header -->
//     <h2 style="
//       margin:0 0 20px 0;
//       font-size:30px;
//       font-weight:600;
//       color:#36013F;
//       text-align:left;
//     ">
//       Thank you for your payment!
//     </h2>

//     <!-- Package -->
//     <h2 style="
//       margin:0 0 20px 0;
//       font-size:16px;
//       font-weight:600;
//       color:#36013F;
//       text-align:center;
//     ">
//       Your payment has been received and processed.
//     </h2>

//     <!-- Body Paragraph (your exact content) -->
//     <p style="
//       font-size:16px;
//       line-height:1.6;
//       color:#333;
//       margin:0 0 10px 0;
//     ">
//       You can now view your updated credits in your account.
//     </p>

//   </div>
// </div>
//     `,
//   };
// };

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
    subject: "Supra8 Class Booking Confirmed",

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
      text-align:center;
    ">
      You booked a class</br></br><span style="color: red">${date}</span> at <span style="color: red">${time}</span> with <span style="color: red">${instructor}</span>
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
  class_booking_confirmation: classBookingConfirmation,
};
