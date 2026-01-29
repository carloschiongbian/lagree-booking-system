"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Row } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useAppMessage } from "@/components/ui/message-popup";
import UnauthenticatedLayout from "@/components/layout/UnauthenticatedLayout";
import Image from "next/image";

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
      showMessage({ type: "error", content: "Email or password is incorrect" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UnauthenticatedLayout>
      {contextHolder}
      <Row justify={"center"} className="items-center h-full py-[100px]">
        <Card
          className="w-full max-w-md shadow-xl border-0"
          style={{ borderRadius: 12 }}
        >
          <Row className="flex-col text-center mb-8">
            <Row className="justify-center mb-[10px]">
              <Image
                src="/images/main-logo.png"
                alt="Logo"
                width={170}
                height={170}
              />
            </Row>
            {/* <Title level={2} className="!mb-2">
              8 Club Lagree
            </Title> */}
            <Text type="secondary">Sign in to your account</Text>
          </Row>

          {/* <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <div className="text-center mb-8">
            <Title level={2} className="!mb-2">
              Supra8 Lagree
            </Title>
            <Text type="secondary">Sign in to your account</Text>
          </div> */}

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
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
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
                className="h-11 !bg-[#800020] hover:!bg-[#800020] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
              >
                Log In
              </Button>
            </Form.Item>

            <div className="text-center">
              <Text type="secondary">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="!text-[#800020] hover:text-[#800020]"
                >
                  Sign up
                </Link>
              </Text>
            </div>
          </Form>
        </Card>
      </Row>
    </UnauthenticatedLayout>
  );
}
