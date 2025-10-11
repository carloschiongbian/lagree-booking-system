"use client";

import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Avatar,
  List,
  Button,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DatePickerCarousel from "@/components/ui/datepicker-carousel";
import { formatPrice } from "@/lib/utils";

const { Title } = Typography;

export default function PackagesPage() {
  const data = [
    {
      title: "Private Class",
      validity: 30,
      price: 15000,
    },
    {
      title: "Private Class",
      validity: 30,
      price: 15000,
    },
    {
      title: "Private Class",
      validity: 30,
      price: 15000,
    },
    {
      title: "Private Class",
      validity: 30,
      price: 15000,
    },
  ];
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <Title level={2} className="!mb-2">
            Available Packages
          </Title>
        </div>

        {/* <Row gutter={[16, 16]}>
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
        </Row> */}

        <Card className="shadow-sm">
          <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    className="!bg-[#733AC6] hover:!bg-[#5B2CA8] !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03]"
                  >
                    Buy
                  </Button>,
                ]}
              >
                <Row className="wrap-none items-center gap-4">
                  <Avatar
                    className="border-gray-500 border"
                    size={60}
                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
                  />
                  <Col>
                    <p>
                      <span className="font-semibold">{`${item.title}`}</span>
                    </p>
                    <p>
                      <span className="font-light">
                        PHP {formatPrice(item.price)}
                      </span>
                    </p>
                    <p>
                      <span className="font-light">
                        Valid for {item.validity} days
                      </span>
                    </p>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
          {data.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <CalendarOutlined className="text-4xl mb-4" />
              <p>No bookings yet. Start by creating your first booking.</p>
            </div>
          )}
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
