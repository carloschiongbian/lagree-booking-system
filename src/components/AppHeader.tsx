"use client";

import Link from "next/link";
import { Flex, Menu, Typography, Dropdown, Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { supabaseBrowser } from "@/lib/supabase/browser";
import useSWR from "swr";

const { Title, Text } = Typography;

export default function AppHeader() {
  const supabase = supabaseBrowser();
  const { data: user } = useSWR("user", async () => (await supabase.auth.getUser()).data.user);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  return (
    <Flex align="center" justify="space-between" style={{ width: "100%" }}>
      <Link href="/schedule" style={{ color: "white", textDecoration: "none" }}>
        <Title level={4} style={{ color: "white", margin: 0 }}>Lagree</Title>
      </Link>
      <Flex gap={16} align="center">
        <Menu
          theme="dark"
          mode="horizontal"
          selectable={false}
          items={[
            { key: "schedule", label: <Link href="/schedule">Schedule</Link> },
            { key: "purchase", label: <Link href="/purchase">Buy Packages</Link> },
            { key: "profile", label: <Link href="/profile">Profile</Link> },
          ]}
        />
        <Dropdown
          menu={{
            items: [
              { key: "email", label: <Text type="secondary">{user?.email}</Text>, disabled: true },
              { type: "divider" },
              { key: "logout", label: <Button type="link" danger onClick={logout}>Log out</Button> },
            ],
          }}
        >
          <Avatar style={{ cursor: "pointer" }} icon={<UserOutlined />} />
        </Dropdown>
      </Flex>
    </Flex>
  );
}
