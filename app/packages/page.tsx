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
  Drawer,
  Checkbox,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DatePickerCarousel from "@/components/ui/datepicker-carousel";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const { Title } = Typography;

export default function PackagesPage() {
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // rAF throttle
    let rafId: number | null = null;
    const onResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        handleResize();
      });
    };

    handleResize();
    window.addEventListener("resize", onResize);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleAcceptTermsChange = (e: any) => {
    setAcceptsTerms(e.target.checked);
  };
  const handleOpenModal = (item: any) => {
    setSelectedRecord(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };
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

        <Row
          gutter={[20, 20]} // spacing between cards (horizontal, vertical)
          justify="start"
          // className="px-4"
        >
          {data.map((item, index) => (
            <Col
              key={index}
              xs={24} // full width on mobile
              sm={12} // 2 columns on small screens
              md={8} // 3 columns on tablets
              lg={6} // 4 columns on desktops
              xl={5} // 4–5 columns on wide desktops
            >
              <Card
                title={`${item.validity} days`}
                styles={{
                  header: {
                    backgroundColor: "#36013F",
                    color: "white",
                    textAlign: "center",
                    fontSize: "36px",
                    height: "120px",
                  },
                  body: {
                    paddingTop: "15px",
                  },
                }}
                className="border-[#fbe2ff] rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Col className="flex flex-col gap-y-[10px]">
                  <Col>
                    <p>
                      <span className="font-light">{item.title}</span>
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

                  <Button
                    onClick={() => handleOpenModal(item)}
                    className="!bg-[#36013F] h-[40px] hover:!bg-[#36013F] !border-[#36013F] !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
                  >
                    Purchase
                  </Button>
                </Col>
              </Card>
            </Col>
          ))}
        </Row>

        {data.length === 0 && (
          <Card className="shadow-sm">
            {/* <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    className="!bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
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
          /> */}

            <div className="text-center py-12 text-slate-500">
              <CalendarOutlined className="text-4xl mb-4" />
              <p>No bookings yet. Start by creating your first booking.</p>
            </div>
          </Card>
        )}
      </div>

      <Drawer
        placement="right"
        onClose={handleCloseModal}
        open={isModalOpen}
        width={isMobile ? "100%" : "30%"}
        styles={{
          body: { paddingTop: 24 },
        }}
      >
        <Col className="flex flex-col items-center">
          <Avatar
            className="!text-[50px] bg-[#36013F] border w-full"
            size={200}
          >
            30
          </Avatar>
          <Divider />
          <Col className="items-start w-full">
            <Row wrap={false} className="mb-[20px] items-start w-full">
              <Title level={5}>
                Package:{" "}
                <span className="font-normal">{selectedRecord?.title}</span>
              </Title>
            </Row>
            <Row wrap={false} className="mb-[20px] items-start w-full">
              <Title level={5}>
                Price:{" "}
                <span className="font-normal">
                  PHP {formatPrice(selectedRecord?.price)}
                </span>
              </Title>
            </Row>
            <Row wrap={false} className="mb-[20px] items-start w-full">
              <Title level={5}>
                Validity Period:{" "}
                <span className="font-normal">
                  {selectedRecord?.validity} days
                </span>
              </Title>
            </Row>
          </Col>
          <Row justify={"start"} className="w-full mb-[10px]">
            <Checkbox onChange={handleAcceptTermsChange}>
              I have read the
            </Checkbox>
            <a className="text-blue-400">Terms and Conditions</a>
          </Row>
          <Button
            disabled={!acceptsTerms}
            className={`bg-[#36013F] ${
              acceptsTerms ? "hover:!bg-[#36013F]" : ""
            } !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03] w-full h-[50px]`}
          >
            Continue
          </Button>
          <span className="font-normal text-slate-500">
            You won&apos;t be charged yet.
          </span>
        </Col>
      </Drawer>
    </AuthenticatedLayout>
  );
}
