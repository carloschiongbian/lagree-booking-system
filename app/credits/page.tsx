"use client";

import { Card, Row, Col, Typography, Button, List } from "antd";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { useRouter } from "next/navigation";
import { MdErrorOutline } from "react-icons/md";
import { LiaCoinsSolid } from "react-icons/lia";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { usePackageManagement } from "@/lib/api";
import { ClientPackageProps } from "@/lib/props";
import { TfiPackage } from "react-icons/tfi";
import { formatDate } from "@/lib/utils";
import { ImInfinite } from "react-icons/im";

import dayjs from "dayjs";

import { HiOutlineCalendarDateRange } from "react-icons/hi2";
import PackageHistoryCard from "@/components/ui/package-history-card";

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
        mapped = response?.map((data: any) => ({
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
            id: data.packages?.id ? data.packages.id : null,
            price: data.packages?.price ? data.packages.price : "00000",
            title: data.packages?.title
              ? data.packages?.title
              : data.package_name,
            createdAt: data.packages?.created_at
              ? data.packages.created_at
              : data.created_at,
            packageCredits: data.packages?.package_credits
              ? data.packages.package_credits
              : data.package_credits,
            validityPeriod: data.packages?.validity_period
              ? data.packages.validity_period
              : data.validity_period,
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
              <Row justify={"space-between"}>
                <Title level={3}>Credit Tracker</Title>
                {!!packages.length && user?.credits === 0 && (
                  <Button
                    onClick={() => router.push("/packages")}
                    className={`bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg px-[15px] shadow-sm transition-all duration-200 hover:scale-[1.03]`}
                  >
                    Get Credits
                  </Button>
                )}
              </Row>

              <Row
                wrap={false}
                justify={"start"}
                className={`${
                  !activePackage && "p-[10px] bg-slate-200"
                } rounded-lg items-center gap-[10px]`}
              >
                {activePackage ? (
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
                      <Title
                        level={4}
                        className={`${
                          user?.credits === 0 && "!text-red-400"
                        } !mb-0 !font-normal`}
                      >
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

        <Card className="shadow-sm" title="Package Purchase History">
          <div className="overflow-y-auto pr-2 max-h-[60vh] sm:max-h-[70vh] md:max-h-[50vh]">
            <List
              grid={{
                gutter: 16,
                xs: 1, // Mobile: 1 per row
                sm: 2,
                md: 3,
                lg: 3,
                xl: 4,
                xxl: 5,
              }}
              dataSource={packages}
              renderItem={(item) => (
                <List.Item>
                  <PackageHistoryCard item={item} />
                </List.Item>
              )}
              locale={{
                emptyText: (
                  <div className="text-center py-12 text-slate-500">
                    <Row className="justify-center">
                      <Col className="flex flex-col justify-center items-center gap-y-[10px]">
                        <Text>You haven’t purchased any packages yet</Text>
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
                ),
              }}
            />
          </div>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
