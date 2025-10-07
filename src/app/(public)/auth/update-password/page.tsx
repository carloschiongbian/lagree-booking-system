"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function UpdatePassword() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ensure we are in recovery session
  }, []);

  async function onUpdate(values: any) {
    setLoading(true);
    const { password } = values;
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return message.error(error.message);
    message.success("Password updated");
    window.location.href = "/schedule";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md" title="Set a new password">
        <Form layout="vertical" onFinish={onUpdate} disabled={loading}>
          <Form.Item name="password" label="New password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading}>Update password</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
