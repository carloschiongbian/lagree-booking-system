"use client";

import React, { useState } from "react";
import { Card, Tabs, Form, Input, Button, Typography, message } from "antd";
import { supabaseBrowser } from "@/lib/supabase/browser";

const { Title, Text } = Typography;

type AuthMode = "login" | "signup" | "reset";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const supabase = supabaseBrowser();

  async function onLogin(values: any) {
    setLoading(true);
    const { email, password } = values;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return message.error(error.message);
    message.success("Logged in");
    window.location.href = "/schedule";
  }

  async function onSignup(values: any) {
    setLoading(true);
    const { email, password, name, phone } = values;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setLoading(false);
    if (error) return message.error(error.message);
    message.success("Check your email to confirm");
  }

  async function onReset(values: any) {
    setLoading(true);
    const { email } = values;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    setLoading(false);
    if (error) return message.error(error.message);
    message.success("Password reset link sent");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <Title level={3} style={{ marginBottom: 8 }}>
          Welcome to Lagree
        </Title>
        <Text type="secondary">Sign in or create your account</Text>
        <Tabs
          activeKey={mode}
          onChange={(k) => setMode(k as AuthMode)}
          items={[
            {
              key: "login",
              label: "Log in",
              children: (
                <Form layout="vertical" onFinish={onLogin} disabled={loading}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                    <Input placeholder="you@example.com" />
                  </Form.Item>
                  <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password placeholder="••••••••" />
                  </Form.Item>
                  <Button type="link" onClick={() => setMode("reset")}>Forgot password?</Button>
                  <Form.Item>
                    <Button block type="primary" htmlType="submit" loading={loading}>Log in</Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "signup",
              label: "Sign up",
              children: (
                <Form layout="vertical" onFinish={onSignup} disabled={loading}>
                  <Form.Item name="name" label="Full name" rules={[{ required: true }]}>
                    <Input placeholder="Juan Dela Cruz" />
                  </Form.Item>
                  <Form.Item name="phone" label="Phone number" rules={[{ required: true }]}>
                    <Input placeholder="09xx xxx xxxx" />
                  </Form.Item>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                    <Input placeholder="you@example.com" />
                  </Form.Item>
                  <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password placeholder="••••••••" />
                  </Form.Item>
                  <Form.Item>
                    <Button block type="primary" htmlType="submit" loading={loading}>Create account</Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "reset",
              label: "Reset",
              children: (
                <Form layout="vertical" onFinish={onReset} disabled={loading}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                    <Input placeholder="you@example.com" />
                  </Form.Item>
                  <Form.Item>
                    <Button block type="primary" htmlType="submit" loading={loading}>Send reset link</Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
