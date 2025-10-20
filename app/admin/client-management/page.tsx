"use client";
export const dynamic = "force-dynamic";

import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import { Card, Row, Col, Typography, Button, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { IoIosSearch } from "react-icons/io";

const { Title } = Typography;

export default function ClientManagementPage() {
  const instructors = [
    {
      name: "Alice Smith",
      role: "Lead Instructor",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      name: "Bob Johnson",
      role: "Instructor",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      name: "Carol Lee",
      role: "Instructor",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
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
          <Row className="flex flex-col gap-y-[15px]">
            <Title level={2} className="!mb-0">
              Client Management
            </Title>
            <Input
              className="max-w-[300px]"
              placeholder="Search clients"
              prefix={<IoIosSearch />}
            />

            {/* <Button
              type="primary"
              icon={<PlusOutlined />}
              className="!bg-[#733AC6] hover:!bg-[#5B2CA8] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
            >
              New Instructor
            </Button> */}
          </Row>
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
