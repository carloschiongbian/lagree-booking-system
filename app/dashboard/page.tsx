"use client";

import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

const { Title } = Typography;

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <Title level={2} className="!mb-2">
            Dashboard
          </Title>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Total Bookings"
                value={12}
                prefix={<CalendarOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Total Credits"
                value={12}
                prefix={<CalendarOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col>
          {/* <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Confirmed"
                value={8}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Pending"
                value={4}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col> */}
        </Row>

        <Card className="shadow-sm" title="Upcoming Sessions">
          <div className="text-center py-12 text-slate-500">
            <CalendarOutlined className="text-4xl mb-4" />
            <p>No sessions yet. Start by creating your first booking.</p>
          </div>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
