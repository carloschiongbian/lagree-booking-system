"use client";

import { Card, Row, Col, Typography, Button } from "antd";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { useRouter } from "next/navigation";
import { MdErrorOutline } from "react-icons/md";
import { LiaCoinsSolid } from "react-icons/lia";

const { Title, Text } = Typography;

export default function CreditsPage() {
  const router = useRouter();
  const data = [
    // {
    //   time: "07:00AM",
    //   duration: "50 mins",
    //   date: "2024-10-10",
    //   instructor: "Jane Doe",
    //   limit: 10,
    //   available: 3,
    // },
    // {
    //   time: "07:00AM",
    //   duration: "50 mins",
    //   date: "2024-10-10",
    //   instructor: "Jane Doe",
    //   limit: 10,
    //   available: 0,
    // },
    // {
    //   time: "07:00AM",
    //   duration: "50 mins",
    //   date: "2024-10-10",
    //   instructor: "Jane Doe",
    //   limit: 10,
    //   available: 1,
    // },
    // {
    //   time: "07:00AM",
    //   duration: "50 mins",
    //   date: "2024-10-10",
    //   instructor: "Jane Doe",
    //   limit: 10,
    //   available: 7,
    // },
  ];
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* <div>
          <Title level={2} className="!mb-2">
            Your Credits
          </Title>
        </div> */}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow max-h-[150px]">
              <Title level={3}>Current Package</Title>

              <Row
                wrap={false}
                justify={"start"}
                className="p-[10px] bg-slate-200 rounded-lg items-center gap-[10px]"
              >
                <MdErrorOutline size={30} />

                <Text>Package has expired or hasn&apos;t been purchased</Text>
              </Row>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow max-h-[150px]">
              <Title level={3}>Credits</Title>

              <Row
                wrap={false}
                justify={"start"}
                className="p-[10px] bg-slate-200 rounded-lg items-center gap-[10px]"
              >
                <LiaCoinsSolid size={30} />

                <Row className="w-[90%] justify-center">
                  <Text>No credits available</Text>
                </Row>
              </Row>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm" title={"Package Purchase History"}>
          {/* <List
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
          /> */}
          {data.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Row className="justify-center">
                <Col className="flex flex-col justify-center items-center gap-y-[10px]">
                  <Text>You haven&apos;t purchased any packages yet</Text>
                  <Button
                    type="primary"
                    onClick={() => router.push("/packages")}
                    className="w-fit !bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
                  >
                    Purchase a package
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
