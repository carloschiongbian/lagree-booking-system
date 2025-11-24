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
import { ImInfinite } from "react-icons/im";
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
import dayjs from "dayjs";
import { useAppMessage } from "@/components/ui/message-popup";

const { Title } = Typography;
const CAROUSEL_SLIDES = {
  TERMS: 0,
  PACKAGE_DETAILS: 1,
  CHECKOUT: 2,
};

export default function PackagesPage() {
  const dispatch = useDispatch();
  const carouselRef = useRef<any>(null);
  const { updateUserCredits } = useManageCredits();
  const user = useAppSelector((state) => state.auth.user);
  const { fetchPackages, purchasePackage, updateClientPackage } =
    usePackageManagement();
  const { showMessage, contextHolder } = useAppMessage();

  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carouselSlide, setCarouselSlide] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [packages, setPackages] = useState<PackageProps[]>();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
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
      await updateUserCredits({
        userID: user?.id as string,
        values: { credits },
      });

      dispatch(setUser({ ...user, credits, currentPackage: selectedRecord }));
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

  const handleSendConfirmationEmail = async () => {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: user?.email,
        title: selectedRecord.title,
        emailType: "package_purchase",
      }),
    });
    const data = await res.json();
    console.log(data);
  };

  const handleNext = async () => {
    try {
      setIsSubmitting(true);
      await handlePurchasePackage();

      await handleUpdateUserCredits({
        credits: selectedRecord.packageCredits,
      });

      await handleSendConfirmationEmail();

      // temporarily commented out until payments is integrated
      // setCarouselSlide(2);
      // carouselRef.current.next();

      //temporary behavior
      showMessage({
        type: "success",
        content: "Successfully purchased package!",
      });
      setIsModalOpen(false);
      setSelectedRecord(null);
      setIsSubmitting(false);
    } catch (error) {
      showMessage({ type: "error", content: "Failed to purchase package" });
    }
  };

  const handlePurchasePackage = async () => {
    try {
      if (user?.credits === 0) {
        await updateClientPackage({
          clientPackageID: user.currentPackage?.id as string,
          values: { status: "expired", expirationDate: dayjs() },
        });
      }

      const response = await purchasePackage({
        userID: user?.id as string,
        packageID: selectedRecord.id,
        paymentMethod: "debit",
        packageName: selectedRecord.title,
        validityPeriod: selectedRecord.validityPeriod,
        packageCredits: selectedRecord.packageCredits,
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrev = () => {
    setCarouselSlide(CAROUSEL_SLIDES.PACKAGE_DETAILS);
    carouselRef.current.prev();
  };

  const handleShowTermsAndConditions = () => {
    setCarouselSlide(CAROUSEL_SLIDES.TERMS);
    carouselRef.current.goTo(CAROUSEL_SLIDES.TERMS);
  };

  return (
    <AuthenticatedLayout>
      {contextHolder}
      <div className="space-y-6">
        <Row gutter={[20, 20]} className="gap-x-[20px] xl:justify-start">
          {packages &&
            packages.map((item, index) => {
              const disablePurchase =
                (user?.currentPackage !== null ||
                  user?.currentPackage !== undefined) &&
                user?.credits !== 0;

              const showToolTip = user?.currentPackage && user?.credits !== 0;
              return (
                <Card
                  key={index}
                  title={
                    item.packageCredits ? `${item.packageCredits}` : `Unlimited`
                  }
                  styles={{
                    title: {
                      gap: 0,
                      textWrap: "wrap",
                      textAlign: "center",
                      marginInline: "auto",
                    },
                    header: {
                      backgroundColor: "#36013F",
                      color: "white",
                      textAlign: "center",
                      fontSize: "36px",
                      height: "120px",
                    },
                    body: {
                      paddingInline: "10px",
                      paddingTop: "15px",
                    },
                  }}
                  className="w-[270px] border-[#fbe2ff] rounded-[24px] shadow-sm transition-all duration-300 flex-nowrap"
                >
                  <Col className="flex flex-col gap-y-[10px] flex-nowrap">
                    <Col className="flex-nowrap">
                      <p>
                        <span className="font-bold text-[16px]">
                          {item.title}
                        </span>
                      </p>
                      <p>
                        <span className="font-light">
                          {item.packageCredits
                            ? `${item.packageCredits} sessions`
                            : "Unlimited Sessions"}
                        </span>
                      </p>
                      <p>
                        <span className="font-light">
                          Valid for{" "}
                          <span className="font-semibold">
                            {item.validityPeriod}
                          </span>{" "}
                          days
                        </span>
                      </p>
                      <p>
                        <span className="font-normal">
                          PHP {formatPrice(item.price)}
                        </span>
                      </p>
                    </Col>

                    <Tooltip
                      title={showToolTip && "You still have an active package"}
                    >
                      <Button
                        disabled={disablePurchase}
                        onClick={() => handleOpenModal(item)}
                        className={`${
                          !disablePurchase
                            ? "!bg-[#36013F] !border-[#36013F] hover:!bg-[#36013F] hover:scale-[1.03]"
                            : "!bg-slate-200 !border-slate-bg-slate-200 hover:!bg-slate-200"
                        } h-[40px] !text-white font-medium rounded-lg shadow-sm transition-all duration-200`}
                      >
                        Purchase
                      </Button>
                    </Tooltip>
                  </Col>
                </Card>
              );
            })}
        </Row>

        {packages && packages.length === 0 && (
          <Card className="shadow-sm">
            <div className="text-center py-12 text-slate-500">
              <CalendarOutlined className="text-4xl mb-4" />
              <p>No packages are being offered at this time.</p>
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
                  I have read the
                </Checkbox>
                <span
                  onClick={handleShowTermsAndConditions}
                  className="text-blue-400 cursor-pointer"
                >
                  Terms and Conditions
                </span>
              </Row>
              <Button
                onClick={handleNext}
                /**
                 * temporary button disable since payment
                 * is not integrated yet
                 * to prevent multiple clicking
                 */
                loading={isSubmitting}
                disabled={!acceptsTerms || isSubmitting}
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
