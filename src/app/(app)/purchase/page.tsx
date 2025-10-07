"use client";

import { useEffect, useState } from "react";
import { Card, Radio, Space, Button, Typography, Result, Form, Input, Alert, message } from "antd";

const { Title, Text } = Typography;

type PaymentMethod = "gcash" | "bank" | "card";
type Pkg = { id: string; name: string; credits: number; price_cents: number; duration_days: number | null };

export default function PurchasePage() {
  const [pkg, setPkg] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("gcash");
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [packages, setPackages] = useState<Pkg[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/packages");
      if (res.ok) {
        const json = await res.json();
        setPackages(json.packages || []);
        if (json.packages?.[0]?.id) setPkg(json.packages[0].id);
      }
    })();
  }, []);

  async function onPay() {
    setPending(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: pkg, method }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Payment failed");
      }
      const json = await res.json();
      setConfirmed(json.purchase?.status === "confirmed");
      if (json.purchase?.status !== "confirmed") {
        message.info("Payment pending. Admin will confirm shortly.");
      }
    } catch (e: any) {
      message.error(e.message);
    }
    setPending(false);
  }

  if (confirmed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Result
          status="success"
          title="Payment confirmed"
          subTitle="Your package has been added to your balance."
          extra={<Button type="primary" href="/schedule">Go to schedule</Button>}
        />
      </div>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} style={{ margin: 0 }}>Buy Packages</Title>

      <Card title="Choose a package">
        <Radio.Group value={pkg} onChange={(e) => setPkg(e.target.value)}>
          <Space direction="vertical">
            {packages.map((p) => (
              <Radio key={p.id} value={p.id}>
                {p.name} — {p.credits} credits{p.duration_days ? ` • ${p.duration_days} days` : ""}
              </Radio>
            ))}
            {packages.length === 0 && <Typography.Text type="secondary">No packages available yet.</Typography.Text>}
          </Space>
        </Radio.Group>
      </Card>

      <Card title="Payment method">
        <Radio.Group value={method} onChange={(e) => setMethod(e.target.value)}>
          <Space direction="vertical">
            <Radio value="gcash">GCash</Radio>
            <Radio value="bank">Bank transfer</Radio>
            <Radio value="card">Card via PayMongo</Radio>
          </Space>
        </Radio.Group>
        {method !== "card" && (
          <Alert
            style={{ marginTop: 16 }}
            message="Manual payment"
            description="We will confirm your payment and update your credits."
            type="info"
            showIcon
          />
        )}
        {method === "card" && (
          <Form layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item label="Card number">
              <Input placeholder="4242 4242 4242 4242" />
            </Form.Item>
            <Form.Item label="Expiry">
              <Input placeholder="MM/YY" />
            </Form.Item>
            <Form.Item label="CVC">
              <Input placeholder="123" />
            </Form.Item>
          </Form>
        )}
        <Button type="primary" onClick={onPay} loading={pending} style={{ marginTop: 16 }}>
          Pay now
        </Button>
      </Card>
    </Space>
  );
}
