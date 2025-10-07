import { Button, Typography, Card, Space } from "antd";
import Link from "next/link";

const { Title, Text } = Typography;

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <Space direction="vertical" size={16} style={{ width: "100%", textAlign: "center" }}>
          <Title level={2} style={{ margin: 0 }}>Lagree Class Booking</Title>
          <Text type="secondary">Reserve your spot, manage credits, and stay on track.</Text>
          <Space>
            <Link href="/auth"><Button type="primary">Sign in / Sign up</Button></Link>
            <Link href="/schedule"><Button>View schedule</Button></Link>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
