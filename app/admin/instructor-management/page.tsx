"use client";

import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import { Card, Row, Col, Typography } from "antd";

const { Title } = Typography;

export default function InstructorManagementPage() {
  const instructors = [
    {
      name: "Alice Smith",
      role: "Lead Instructor",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      name: "Bob Johnson",
      role: "Instructor",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      name: "Carol Lee",
      role: "Instructor",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
      name: "David Kim",
      role: "Instructor",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    },
  ];

  return (
    <AdminAuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <Title level={2} className="!mb-2">
            Instructor Management
          </Title>
        </div>

        <Row gutter={[16, 16]}>
          {instructors.map((inst, idx) => (
            <Col key={idx} xs={24} sm={12} md={8} lg={6} xl={6} xxl={6}>
              <Card
                hoverable
                cover={
                  <img
                    alt={inst.name}
                    src={inst.avatar}
                    style={{ objectFit: "cover", height: 200, width: "100%" }}
                  />
                }
              >
                <Card.Meta title={inst.name} description={inst.role} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </AdminAuthenticatedLayout>
  );
}
