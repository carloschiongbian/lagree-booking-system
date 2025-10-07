"use client";

import { Result, Button } from "antd";

export default function ConfirmNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Result
        status="info"
        title="Check your email"
        subTitle="We sent you a confirmation link to verify your account."
        extra={<Button type="primary" href="/auth">Back to auth</Button>}
      />
    </div>
  );
}
