"use client";

import { Card, Descriptions, List, Typography, Button, Space, Popconfirm, message } from "antd";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchProfileData } from "@/store/profileSlice";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { balance, bookings, purchases } = useAppSelector((s) => s.profile);
  const { user } = useAppSelector((s) => s.session);
  React.useEffect(() => {
    dispatch(fetchProfileData());
  }, [dispatch]);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} style={{ margin: 0 }}>My Profile</Title>

      <Card>
        <Descriptions column={1} title="Basic Info">
          <Descriptions.Item label="Name">{user?.user_metadata?.name || "—"}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user?.user_metadata?.phone || "—"}</Descriptions.Item>
          <Descriptions.Item label="Credits">{balance}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Upcoming / Past Bookings">
        <List
          dataSource={bookings}
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
          dataSource={purchases}
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
