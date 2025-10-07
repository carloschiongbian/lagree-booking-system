"use client";

import useSWR from "swr";
import { Card, Descriptions, List, Typography, Button, Space, Popconfirm, message } from "antd";
import { supabaseBrowser } from "@/lib/supabase/browser";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const supabase = supabaseBrowser();
  const { data: profile } = useSWR("profile", async () => (await supabase.auth.getUser()).data.user);
  const { data: balance } = useSWR("balance", async () => {
    const { data } = await supabase.from("user_packages").select("credits_remaining").eq("status", "confirmed");
    return (data || []).reduce((sum, r) => sum + (r.credits_remaining || 0), 0);
  });
  const { data: bookings } = useSWR("bookings", async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id,status,created_at, schedule_id, class_schedules:start_time")
      .order("created_at", { ascending: false });
    return (data || []).map((r: any) => ({ id: r.id, title: "Lagree Class", date: new Date(r.class_schedules?.start_time || r.created_at).toLocaleString(), status: r.status }));
  });
  const { data: purchases } = useSWR("purchases", async () => {
    const { data } = await supabase
      .from("user_packages")
      .select("id,status,purchased_at,packages(name)")
      .order("purchased_at", { ascending: false });
    return (data || []).map((r: any) => ({ id: r.id, title: r.packages?.name || "Package", date: new Date(r.purchased_at).toLocaleDateString(), status: r.status }));
  });

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} style={{ margin: 0 }}>My Profile</Title>

      <Card>
        <Descriptions column={1} title="Basic Info">
          <Descriptions.Item label="Name">{profile?.user_metadata?.name || "—"}</Descriptions.Item>
          <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{profile?.user_metadata?.phone || "—"}</Descriptions.Item>
          <Descriptions.Item label="Credits">{balance ?? 0}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Upcoming / Past Bookings">
        <List
          dataSource={bookings || []}
          renderItem={(b) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="cancel"
                  title="Cancel booking?"
                  description="Cancellations not allowed within 24 hours of class."
                  onConfirm={async () => {
                    try {
                      const res = await fetch("/api/rpc/cancel", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ booking_id: b.id }),
                      });
                      if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(body.error || "Cancel failed");
                      }
                      message.success("Cancelled");
                    } catch (e: any) {
                      message.error(e.message);
                    }
                  }}
                >
                  <Button danger>Cancel</Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta title={b.title} description={`${b.date} • ${b.status}`} />
            </List.Item>
          )}
        />
      </Card>

      <Card title="Purchase History">
        <List
          dataSource={purchases || []}
          renderItem={(p) => (
            <List.Item>
              <List.Item.Meta title={p.title} description={`${p.date} • ${p.status}`} />
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}
