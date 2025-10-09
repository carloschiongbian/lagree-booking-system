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

const { Title } = Typography;

export default function CreditsPage() {
  const data = [
    {
      time: "07:00AM",
      duration: "50 mins",
      date: "2024-10-10",
      instructor: "Jane Doe",
      limit: 10,
      available: 3,
    },
    {
      time: "07:00AM",
      duration: "50 mins",
      date: "2024-10-10",
      instructor: "Jane Doe",
      limit: 10,
      available: 0,
    },
    {
      time: "07:00AM",
      duration: "50 mins",
      date: "2024-10-10",
      instructor: "Jane Doe",
      limit: 10,
      available: 1,
    },
    {
      time: "07:00AM",
      duration: "50 mins",
      date: "2024-10-10",
      instructor: "Jane Doe",
      limit: 10,
      available: 7,
    },
  ];
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <Title level={2} className="!mb-2">
            Your Credits
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
                  <Button disabled={item.available === 0}>Book</Button>,
                ]}
              >
                <Row className="wrap-none items-center gap-4">
                  <Col>
                    <Avatar
                      className="border-gray-500 border"
                      size={60}
                      src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
                    />
                    <p>
                      <span className="font-light">{item.instructor}</span>
                    </p>
                  </Col>
                  <Col>
                    <p>
                      <span className="font-semibold">{`${item.time}`} </span>
                    </p>
                    <p>
                      <span className="font-light">{item.date}</span>
                    </p>
                    <p>
                      <span className="font-light">{item.duration}</span>
                    </p>
                    <p>
                      <span
                        className={`${
                          item.available === 1 || item.available === 0
                            ? `text-red-500`
                            : ``
                        } font-semibold`}
                      >
                        {item.available === 1
                          ? `Last Slot`
                          : item.available > 1
                          ? `${item.available} slots left`
                          : ``}
                        {item.available <= 0 && `Full`}
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
