"use client";

import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Drawer,
  Checkbox,
  Divider,
  Carousel,
  Tooltip,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { formatPrice } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useManageCredits, usePackageManagement } from "@/lib/api";
import { useAppSelector } from "@/lib/hooks";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/features/authSlice";
import UserTermsAndConditions from "@/components/layout/UserTermsAndConditions";
import { PackageProps } from "@/lib/props";

const { Title } = Typography;
const CAROUSEL_SLIDES = {
  TERMS: 0,
  PACKAGE_DETAILS: 1,
  CHECKOUT: 2,
};

export default function PackagesPage() {
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const carouselRef = useRef<any>(null);
  const [packages, setPackages] = useState<PackageProps[]>();
  const [carouselSlide, setCarouselSlide] = useState(1);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const { updateUserCredits } = useManageCredits();
  const { fetchPackages, purchasePackage } = usePackageManagement();
  const [delayedOverflow, setDelayedOverflow] = useState("hidden");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedOverflow(
        carouselSlide !== CAROUSEL_SLIDES.TERMS ? "hidden" : "auto"
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [carouselSlide]);

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

  useEffect(() => {
    handleFetchPackages();
  }, []);

  const handleFetchPackages = async () => {
    const response = await fetchPackages();

    const mapped = response?.map((data) => {
      return {
        ...data,
        validityPeriod: data.validity_period,
        packageType: data.package_type,
        packageCredits: data.package_credits,
      };
    });

    setPackages(mapped);
  };

  const handleUpdateUserCredits = async ({ credits }: { credits: number }) => {
    try {
      const response = await updateUserCredits({
        userID: user?.id as string,
        values: { credits },
      });

      dispatch(setUser({ ...user, credits }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleAcceptTermsChange = (e: any) => {
    setAcceptsTerms(e.target.checked);
  };

  const handleOpenModal = (item: any) => {
    setSelectedRecord(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (carouselSlide === CAROUSEL_SLIDES.TERMS) {
      setCarouselSlide(CAROUSEL_SLIDES.PACKAGE_DETAILS);
      carouselRef.current.goTo(CAROUSEL_SLIDES.PACKAGE_DETAILS);
      return;
    }
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleNext = async () => {
    const purchasedPackage = await handlePurchasePackage();

    console.log("purchasedPackage: ", purchasedPackage);
    const response = await handleUpdateUserCredits({
      credits: selectedRecord.packageCredits,
    });
    console.log("response: ", response);

    // temporarily commented out until payments is integrated
    // setCarouselSlide(2);
    // carouselRef.current.next();

    //temporary behavior
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handlePurchasePackage = async () => {
    const response = await purchasePackage({
      userID: user?.id as string,
      packageID: selectedRecord.id,
      paymentMethod: "debit",
      validityPeriod: selectedRecord.validityPeriod,
      packageCredits: selectedRecord.packageCredits,
    });

    return response;
  };

  const handlePrev = () => {
    setCarouselSlide(CAROUSEL_SLIDES.PACKAGE_DETAILS);
    carouselRef.current.prev();
  };

  const handleShowTermsAndConditions = () => {
    setCarouselSlide(CAROUSEL_SLIDES.TERMS);
    carouselRef.current.goTo(CAROUSEL_SLIDES.TERMS);
  };

  useEffect(() => {
    console.log("user :", user);
  }, []);
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <Title level={2} className="!mb-2">
            Available Packages
          </Title>
        </div>

        <Row gutter={[20, 20]} justify="start">
          {packages &&
            packages.map((item, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6} xl={5}>
                <Card
                  title={`${item.validityPeriod} days`}
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
                  className="border-[#fbe2ff] rounded-[24px] shadow-sm transition-all duration-300"
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
                          Valid for {item.validityPeriod} days
                        </span>
                      </p>
                    </Col>

                    <Tooltip
                      title="You still have an active package"
                      popupVisible={!user?.currentPackage}
                    >
                      <Button
                        disabled={user?.currentPackage}
                        onClick={() => handleOpenModal(item)}
                        className={`${
                          !user?.currentPackage
                            ? "!bg-[#36013F] !border-[#36013F]"
                            : "!bg-[#c8c7c7]"
                        } ${
                          !user?.currentPackage &&
                          "hover:!bg-[#36013F]  hover:scale-[1.03]"
                        }  h-[40px] !text-white font-medium rounded-lg shadow-sm transition-all duration-200`}
                      >
                        Purchase
                      </Button>
                    </Tooltip>
                  </Col>
                </Card>
              </Col>
            ))}
        </Row>

        {packages && packages.length === 0 && (
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
        keyboard={false}
        title={carouselSlide === CAROUSEL_SLIDES.TERMS && "Back to Agreement"}
        closeIcon={carouselSlide === CAROUSEL_SLIDES.TERMS && <ChevronRight />}
        closable={carouselSlide === CAROUSEL_SLIDES.CHECKOUT ? false : true}
        maskClosable={false}
        placement="right"
        onClose={handleCloseModal}
        open={isModalOpen}
        width={isMobile ? "100%" : "30%"}
        styles={{
          body: {
            paddingTop: 24,
            overflow: delayedOverflow,
          },
        }}
      >
        <div className="flex-1 overflow-hidden">
          <Carousel
            ref={carouselRef}
            autoplay={false}
            infinite={false}
            dots={false}
            initialSlide={1}
            className="h-full"
          >
            <div className="h-full overflow-y-auto">
              <UserTermsAndConditions />
            </div>

            <div className="flex flex-col items-center h-full overflow-y-hidden">
              <Row className="w-full justify-center">
                <Avatar
                  className="!text-[50px] bg-[#36013F] border w-full"
                  size={200}
                >
                  {selectedRecord?.validityPeriod}
                </Avatar>
              </Row>
              <Divider />
              <div className="items-start w-full">
                <Row wrap={false} className="mb-[10px] items-start w-full">
                  <Title level={5}>
                    Package:{" "}
                    <span className="font-normal">{selectedRecord?.title}</span>
                  </Title>
                </Row>
                <Row wrap={false} className="mb-[15px] items-center w-full">
                  <Title level={5} className="!mb-0">
                    Number of Sessions:{" "}
                    <span className="font-normal">
                      {selectedRecord?.packageCredits ?? "Unlimited"}
                    </span>
                  </Title>
                </Row>

                <Row wrap={false} className="mb-[10px] items-start w-full">
                  <Title level={5}>
                    Validity Period:{" "}
                    <span className="font-normal">
                      {selectedRecord?.validityPeriod} days
                    </span>
                  </Title>
                </Row>
                <Row wrap={false} className="mb-[10px] items-start w-full">
                  <Title level={5}>
                    Price:{" "}
                    <span className="font-normal">
                      PHP {formatPrice(selectedRecord?.price)}
                    </span>
                  </Title>
                </Row>
              </div>
              <Row justify={"start"} className="w-full mb-[10px]">
                <Checkbox onChange={handleAcceptTermsChange}>
                  I have read the{" "}
                  <span
                    onClick={handleShowTermsAndConditions}
                    className="text-blue-400"
                  >
                    Terms and Conditions
                  </span>
                </Checkbox>
              </Row>
              <Button
                onClick={handleNext}
                disabled={!acceptsTerms}
                className={`bg-[#36013F] ${
                  acceptsTerms ? "hover:!bg-[#36013F]" : ""
                } !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 w-full h-[50px]`}
              >
                Continue
              </Button>
              <span className="font-normal text-slate-500">
                You won&apos;t be charged yet.
              </span>
            </div>

            <div className="flex flex-col items-center h-full overflow-y-auto">
              <Row className="w-full items-center mb-6 gap-[10px]">
                <ChevronLeft
                  size={20}
                  onClick={handlePrev}
                  className="cursor-pointer"
                />
                <Title level={3} className="!m-0">
                  Payment Details
                </Title>
              </Row>
            </div>
          </Carousel>
        </div>
      </Drawer>
    </AuthenticatedLayout>
  );
}
