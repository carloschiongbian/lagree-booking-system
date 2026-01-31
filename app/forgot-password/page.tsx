// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import UnauthenticatedLayout from "@/components/layout/UnauthenticatedLayout";
import { supabase } from "@/lib/supabase";
import { Button, Form, Input, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useManagePassword } from "@/lib/api";

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [form] = Form.useForm();
  const { sendResetLink, loading } = useManagePassword();

  const handleSubmit = async (values: { email: string }) => {
    const response = await sendResetLink({ email: values.email });
  };

  return (
    <UnauthenticatedLayout>
      <div className="py-[150px] flex items-center justify-center px-4">
        <div className="w-full max-w-md sm:max-w-lg bg-white p-6 sm:p-8">
          <div className="text-center space-y-2">
            <Title level={3} className="!mb-0">
              Forgot password?
            </Title>
            <Text className="text-slate-500">
              All good. Enter your email and we&apos;ll send you a reset link.
            </Text>
          </div>

          <div className="mt-8">
            <Form
              form={form}
              name="reset-password"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-slate-400" />}
                  placeholder="Email"
                />
              </Form.Item>

              <Button
                block
                loading={loading}
                disabled={loading}
                htmlType="submit"
                className={`${loading ? "!bg-slate-200 hover:!bg-slate-200" : "!bg-[#800020] hover:!bg-[#800020]"} !border-none !text-white font-medium rounded-lg shadow-sm transition-transform duration-200 hover:scale-[1.02]`}
              >
                Send Email
              </Button>

              {sent && (
                <Text className="block text-center text-green-600 mt-4">
                  Password reset email sent ✔
                </Text>
              )}
            </Form>
          </div>
        </div>
      </div>
    </UnauthenticatedLayout>
  );
}
