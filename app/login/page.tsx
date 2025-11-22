"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useAppMessage } from "@/components/ui/message-popup";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { showMessage, contextHolder } = useAppMessage();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .maybeSingle();

      showMessage({ type: "success", content: "Login successful!" });

      if (profile?.user_type === "admin") {
        router.push("/admin/dashboard");
      } else if (profile?.user_type === "general") {
        router.push("/dashboard");
      } else if (profile?.user_type === "instructor") {
        router.push("/instructor/assigned-schedules");
      }
    } catch (error: any) {
      showMessage({ type: "error", content: "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      {contextHolder}
      <Card
        className="w-full max-w-md shadow-xl border-0"
        style={{ borderRadius: 12 }}
      >
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            Supra8 Lagree
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
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

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-11 !bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
            >
              Log In
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text type="secondary">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="!text-[#36013F] hover:text-[#36013F]"
              >
                Sign up
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
