"use client";

import { Card, Row, Col, Typography, Button, List, Divider } from "antd";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { useRouter } from "next/navigation";
import { MdErrorOutline } from "react-icons/md";
import { LiaCoinsSolid } from "react-icons/lia";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { usePackageManagement } from "@/lib/api";
import { ClientPackageProps } from "@/lib/props";
import { TfiPackage } from "react-icons/tfi";
import { checkIfExpired, formatDate } from "@/lib/utils";
import { ImInfinite } from "react-icons/im";

import dayjs from "dayjs";

import { HiOutlineCalendarDateRange } from "react-icons/hi2";

const { Title, Text } = Typography;

export default function CreditsPage() {
  const router = useRouter();
  const [activePackage, setActivePackage] = useState<ClientPackageProps>();
  const [packages, setPackages] = useState<ClientPackageProps[]>([]);
  const user = useAppSelector((state) => state.auth.user);
  const { fetchClientPackages } = usePackageManagement();

  useEffect(() => {
    if (user?.id) {
      handleFetchClientPackages();
    }
  }, [user?.id]);

  const handleFetchClientPackages = async () => {
    let active: any;
    let mapped: any = [];
    if (user) {
      const response = await fetchClientPackages({
        clientID: user?.id as string,
      });

      if (response) {
        mapped = response?.map((data) => ({
          id: data.id,
          createdAt: data.created_at,
          packageId: data.package_id,
          userId: data.user_id,
          expirationDate: data.expiration_date,
          status: data.status,
          purchaseDate: data.purchase_date,
          paymentMethod: data.payment_method,
          packageCredits: data.package_credits,
          validityPeriod: data.validity_period,
          packages: {
            id: data.packages.id,
            price: data.packages.price,
            title: data.packages.title,
            createdAt: data.packages.created_at,
            packageType: data.packages.package_type,
            packageCredits: data.packages.package_credits,
            validityPeriod: data.packages.validity_period,
          },
        }));

        active = mapped.find(
          (data: ClientPackageProps) => data.status === "active"
        );
      }

      setActivePackage(active);
      setPackages(mapped);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <Row gutter={[16, 16]} className="flex flex-wrap">
          {/* Current Package */}
          <Col xs={24} sm={12} lg={8} className="flex">
            <Card className="shadow-sm transition-shadow flex flex-col justify-between w-full h-full min-h-[120px]">
              <Title level={3}>Active Package</Title>

              <Row
                wrap={false}
                justify={"start"}
                className={`${
                  !activePackage && "p-[10px] bg-slate-200"
                } rounded-lg items-center gap-[10px]`}
              >
                {activePackage ? (
                  <Row className="items-center gap-[10px]">
                    <TfiPackage size={25} />
                    <Title level={4} className="!mb-0 !font-normal">
                      {activePackage.packages.title}
                    </Title>
                  </Row>
                ) : (
                  <>
                    <MdErrorOutline size={30} />
                    <Text>
                      Package has expired or hasn&apos;t been purchased
                    </Text>
                  </>
                )}
              </Row>
            </Card>
          </Col>

          {/* Credits */}
          <Col xs={24} sm={12} lg={8} className="flex">
            <Card className="shadow-sm transition-shadow flex flex-col justify-between w-full h-full min-h-[120px]">
              <Title level={3}>Credit Tracker</Title>

              <Row
                wrap={false}
                justify={"start"}
                className={`${
                  !activePackage && "p-[10px] bg-slate-200"
                } rounded-lg items-center gap-[10px]`}
              >
                {activePackage ? (
                  /**
                   * make sure to indicate total sessions
                   * and how many sessions remaining
                   */
                  <Row className="items-center gap-x-[7px]">
                    <LiaCoinsSolid size={25} />
                    {!activePackage.packages.packageCredits && (
                      <Row className="items-center gap-x-[10px]">
                        <ImInfinite size={25} className="!font-normal" />
                        <Title level={4} className="!mb-0 !font-normal">
                          Unlimited
                        </Title>
                      </Row>
                    )}
                    {activePackage.packages.packageCredits && (
                      <Title level={4} className="!mb-0 !font-normal">
                        {`${user?.credits} / ${activePackage.packages.packageCredits}`}
                      </Title>
                    )}
                    <Title level={4} className="!m-0 !font-normal">
                      sessions remaining
                    </Title>
                  </Row>
                ) : (
                  <Row className="w-[90%] justify-center">
                    <Text>No credits available</Text>
                  </Row>
                )}
              </Row>
            </Card>
          </Col>

          {/* Expiration Date */}
          <Col xs={24} sm={12} lg={8} className="flex">
            <Card className="shadow-sm transition-shadow flex flex-col justify-between w-full h-full min-h-[120px]">
              <Title level={3}>Expiration Date</Title>

              <Row
                wrap={false}
                justify={"start"}
                className={`${
                  !activePackage && "p-[10px] bg-slate-200"
                } rounded-lg items-center gap-[10px]`}
              >
                <HiOutlineCalendarDateRange size={30} />
                {activePackage ? (
                  <Title level={4} className="!mb-0 !font-normal">
                    {formatDate(dayjs(activePackage.expirationDate))} (
                    {formatDate(dayjs(activePackage.expirationDate), "dddd")})
                  </Title>
                ) : (
                  <Row className="w-[90%] justify-center">
                    <Text>No package</Text>
                  </Row>
                )}
              </Row>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm" title={"Package Purchase History"}>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 3,
              xl: 4,
              xxl: 5,
            }}
            dataSource={packages}
            renderItem={(item) => (
              <List.Item>
                <Card
                  className="w-full shadow-sm transition-shadow border-none relative"
                  style={{
                    minWidth: 200,
                    cursor: checkIfExpired(dayjs(item.expirationDate))
                      ? "not-allowed"
                      : "pointer",
                  }}
                  title={item.packages.title}
                  styles={{
                    header: {
                      ...(checkIfExpired(dayjs(item.expirationDate))
                        ? {}
                        : {
                            transition: "box-shadow 0.3s ease",
                            borderInline: "3px solid #22c55e",
                            borderTop: "3px solid #22c55e",
                          }),
                      color: checkIfExpired(dayjs(item.expirationDate))
                        ? "#888"
                        : "white",
                      fontSize: 20,
                      paddingInline: 15,
                      backgroundColor: checkIfExpired(
                        dayjs(item.expirationDate)
                      )
                        ? "rgba(0,0,0,0.3)"
                        : "#36013F",
                    },
                    body: {
                      ...(checkIfExpired(dayjs(item.expirationDate))
                        ? { border: "1px solid gray" }
                        : {
                            transition: "box-shadow 0.3s ease",
                            borderInline: "3px solid #22c55e",
                            borderBottom: "3px solid #22c55e",
                          }),
                      backgroundColor: checkIfExpired(
                        dayjs(item.expirationDate)
                      )
                        ? "rgba(0,0,0,0.1)"
                        : "white",
                      color: checkIfExpired(dayjs(item.expirationDate))
                        ? "#888"
                        : "inherit",
                      opacity: checkIfExpired(dayjs(item.expirationDate))
                        ? 0.6
                        : 1,
                      paddingInline: 15,
                    },
                  }}
                >
                  <Row className="flex flex-col">
                    <Text style={{ fontSize: 16 }}>
                      <span style={{ fontWeight: 600 }}>
                        {item?.packageCredits ?? "Unlimited"}
                      </span>{" "}
                      Sessions
                    </Text>
                    <Text style={{ fontSize: 16 }}>
                      Valid for{" "}
                      <span style={{ fontWeight: 600 }}>
                        {item.validityPeriod} days
                      </span>
                    </Text>
                    <Divider className="m-0 my-[5px] p-0" />
                    <Text style={{ fontSize: 16 }}>Purchased on </Text>
                    <Text style={{ fontSize: 16, fontWeight: 600 }}>
                      {formatDate(dayjs(item.purchaseDate))}
                    </Text>
                    <Divider className="m-0 my-[5px] p-0" />
                    <Row className="flex flex-col min-h-[24]">
                      <Text style={{ fontSize: 16 }}>
                        {checkIfExpired(dayjs(item.expirationDate))
                          ? "Expired"
                          : "Expires"}{" "}
                        on{" "}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#f87171",
                        }}
                      >
                        {formatDate(dayjs(item.expirationDate))}
                      </Text>
                    </Row>
                  </Row>
                </Card>
              </List.Item>
            )}
          />

          {packages.length === 0 && (
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
