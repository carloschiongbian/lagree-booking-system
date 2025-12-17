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
import dayjs from "dayjs";
import { useAppMessage } from "@/components/ui/message-popup";

const { Title } = Typography;
const CAROUSEL_SLIDES = {
  TERMS: 0,
  PACKAGE_DETAILS: 1,
  CHECKOUT: 2,
};

type PaymentMethod = "card" | "paymaya" | "gcash";

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
    const response = await fetchPackages({ isAdmin: false });

    const mapped = response?.map((data) => {
      return {
        ...data,
        validityPeriod: data.validity_period,
        packageType: data.package_type,
        packageCredits: data.package_credits,
        offeredForClients: data.offered_for_clients,
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
    setAcceptsTerms(false);
    setSelectedRecord(null);
    if (carouselSlide === CAROUSEL_SLIDES.TERMS) {
      setCarouselSlide(CAROUSEL_SLIDES.PACKAGE_DETAILS);
      carouselRef.current.goTo(CAROUSEL_SLIDES.PACKAGE_DETAILS);
      return;
    }
    setIsModalOpen(false);
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
      //temporary behavior
      setIsSubmitting(true);
      await handlePurchasePackage();
      await handleUpdateUserCredits({
        credits: selectedRecord.packageCredits,
      });
      // await handleSendConfirmationEmail();
      //temporary behavior

      // temporarily commented out until payments is integrated
      // setCarouselSlide(2);
      // carouselRef.current.next();
      // temporarily commented out until payments is integrated

      //temporary behavior
      showMessage({
        type: "success",
        content: "Successfully purchased package!",
      });
      setIsModalOpen(false);
      setSelectedRecord(null);
      setIsSubmitting(false);
      //temporary behavior
    } catch (error) {
      showMessage({ type: "error", content: "Failed to purchase package" });
    }
  };

  const handlePurchasePackage = async () => {
    console.log("selectedRecord: ", selectedRecord);
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // const [formData, setFormData] = useState({
  //   customerName: user?.full_name || "",
  //   customerEmail: user?.email || "",
  //   customerPhone: user?.contact_number || "",
  //   cardNumber: "",
  //   expiryMonth: "",
  //   expiryYear: "",
  //   cvc: "",
  // });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user?.full_name || "",
        lastName: user?.full_name || "",
        customerEmail: user?.email || "",
        customerPhone: user?.contact_number || "",
      }));
    }
  }, [user]);

  // const handleExecutePayment = async (e: React.FormEvent) => {
  //   /**
  //    * CURRENT ROUTE EXECUTES TEST PAYMENTS
  //    * NEXT IS EXPLORE REAL PAYMENTS TO PAYMONGO ACCOUNT
  //    */
  //   e.preventDefault();
  //   setLoading(true);
  //   setError(null);

  //   // const TOTAL_AMOUNT = selectedRecord.price * 100;
  //   const TOTAL_AMOUNT = 100;
  //   /**
  //    * CAREFUL HERE
  //    * AMOUNT IS MULTIPLIED BY 100 IN ORDER TO ADD CENTAVOS
  //    */

  //   try {
  //     const orderData: Omit<Order, "id" | "created_at" | "updated_at"> = {
  //       customer_name: user?.full_name as string,
  //       customer_user_id: user?.id as string,
  //       customer_email: user?.email as string,
  //       customer_phone: user?.contact_number || undefined,
  //       amount: TOTAL_AMOUNT,
  //       currency: "PHP",
  //       product_name: selectedRecord.title,
  //       product_description: `Valid for ${selectedRecord.validityPeriod} days`,
  //       status: "processing",
  //     };

  //     const packageData = {
  //       user_id: user?.id as string,
  //       package_id: selectedRecord.id,
  //       status: "active",
  //       validity_period: selectedRecord.validityPeriod,
  //       package_credits: selectedRecord.packageCredits,
  //       purchase_date: dayjs(),
  //       package_name: selectedRecord.title,
  //       payment_method: paymentMethod,
  //       expiration_date: getDateFromToday(selectedRecord.validityPeriod),
  //     };

  //     const paymentData = {
  //       method: paymentMethod,
  //       card:
  //         paymentMethod === "card"
  //           ? {
  //               number: formData.cardNumber.replace(/\s/g, ""),
  //               exp_month: parseInt(formData.expiryMonth),
  //               exp_year: parseInt(formData.expiryYear),
  //               cvc: formData.cvc,
  //             }
  //           : undefined,
  //       billing: {
  //         name: formData.customerName,
  //         email: formData.customerEmail,
  //         phone: formData.customerPhone,
  //       },
  //     };

  //     const response = await axios.post(`/api/package/process-payment`, {
  //       selectedPackage: packageData,
  //       order: orderData,
  //       payment: paymentData,
  //     });

  //     const result = await response.data;

  //     console.log("result: ", result);

  //     if (!response.data) {
  //       throw new Error(result.error || "Payment failed");
  //     }

  //     if (result.status === "awaiting_next_action" && result.redirect_url) {
  //       window.location.href = result.redirect_url;
  //       return;
  //     }

  //     if (result.status === "succeeded") {
  //       await handlePurchasePackage();

  //       await handleUpdateUserCredits({
  //         credits: selectedRecord.packageCredits,
  //       });

  //       await handleSendConfirmationEmail();

  //       setSuccess(true);
  //       setFormData({
  //         customerName: user?.full_name || "",
  //         customerEmail: user?.email || "",
  //         customerPhone: user?.contact_number || "",
  //         cardNumber: "",
  //         expiryMonth: "",
  //         expiryYear: "",
  //         cvc: "",
  //       });
  //       setIsModalOpen(false);
  //       setSelectedRecord(null);
  //       setIsSubmitting(false);
  //       showMessage({
  //         type: "success",
  //         content: "Successfully purchased package!",
  //       });
  //     }
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "An error occurred");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Test Maya Checkout

  const [formData, setFormData] = useState({
    productName: "Premium Subscription",
    productPrice: "1500.00",
    firstName: user?.first_name,
    lastName: user?.last_name,
    customerEmail: user?.email,
    customerPhone: user?.contact_number,
    quantity: 1,
  });

  const calculateTotal = () => {
    const price = parseFloat(selectedRecord.price);
    const quantity = 1;
    return (price * quantity).toFixed(2);
  };

  const handleCheckout = async () => {
    try {
      const totalAmount = calculateTotal();

      const checkoutPayload = {
        totalAmount: {
          value: totalAmount,
          currency: "PHP",
        },
        buyer: {
          firstName: formData?.firstName,
          lastName: formData?.lastName,
          contact: {
            phone: formData.customerPhone,
            email: formData.customerEmail,
          },
        },
        items: [
          {
            name: selectedRecord.title,
            quantity: 1,
            amount: {
              value: selectedRecord.price,
            },
            totalAmount: {
              value: totalAmount,
            },
          },
        ],
        redirectUrl: {
          success: `${window.location.origin}/packages`,
          failure: `${window.location.origin}/checkout/failure`,
          cancel: `${window.location.origin}/packages`,
        },
        requestReferenceNumber: `REF-${Date.now()}`,
      };

      console.log("checkoutPayload: ", checkoutPayload);
      const response = await fetch("/api/maya-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutPayload),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Opens checkoutUrl in a new tab
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.log("error.message: ", error?.message);
    }
  };

  // Test Maya Checkout

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
        width={isMobile ? "100%" : "33%"}
        destroyOnHidden={true}
        styles={{
          body: {
            paddingTop: 24,
            overflow: "auto",
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
                <Checkbox
                  value={acceptsTerms}
                  onChange={handleAcceptTermsChange}
                >
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
              {selectedRecord && (
                <Row wrap={false} className="flex flex-col gap-y-[20px]">
                  <div className="bg-white">
                    <div className="border-2 border-[#36013F] rounded-xl p-3 mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedRecord.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Valid for {selectedRecord.validityPeriod} days
                      </p>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>
                            ₱
                            {formatPrice(selectedRecord.price, { decimals: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Fee</span>
                          <span>₱0.00</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between text-lg font-bold text-gray-900">
                            <span>Total</span>
                            <span>
                              ₱
                              {formatPrice(selectedRecord.price, {
                                decimals: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Secure Payment
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Your payment information is encrypted and secure
                            </p>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </div>

                  <div className="bg-white ">
                    {/* <div className="flex items-center gap-3 mb-6">
                      <Wallet className="w-6 h-6 text-[#36013F]" />
                      <h2 className="text-2xl font-bold text-gray-900">
                        Payment Method
                      </h2>
                    </div> */}

                    {/* {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )} */}

                    <form className="space-y-6">
                      {/* <div className="grid grid-cols-3 gap-3 mb-8">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card")}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === "card"
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <CreditCard
                            className={`w-6 h-6 mx-auto mb-2 ${
                              paymentMethod === "card"
                                ? "text-[#36013F]"
                                : "text-gray-600"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium block ${
                              paymentMethod === "card"
                                ? "text-[#36013F]"
                                : "text-gray-700"
                            }`}
                          >
                            Card
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("paymaya")}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === "paymaya"
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Smartphone
                            className={`w-6 h-6 mx-auto mb-2 ${
                              paymentMethod === "paymaya"
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium block ${
                              paymentMethod === "paymaya"
                                ? "text-blue-600"
                                : "text-gray-700"
                            }`}
                          >
                            PayMaya
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("gcash")}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === "gcash"
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Wallet
                            className={`w-6 h-6 mx-auto mb-2 ${
                              paymentMethod === "gcash"
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium block ${
                              paymentMethod === "gcash"
                                ? "text-blue-600"
                                : "text-gray-700"
                            }`}
                          >
                            GCash
                          </span>
                        </button>
                      </div> */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Juan Dela Cruz"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Juan Dela Cruz"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="customerEmail"
                          value={formData.customerEmail}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="juan@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          name="customerPhone"
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="+63 912 345 6789"
                        />
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700">
                            You will be redirected to a Maya checkout page to
                            complete your payment securely.
                          </p>
                        </div>
                      </div>

                      {/* <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            Pay ₱
                            {formatPrice(selectedRecord.price, { decimals: 2 })}
                          </>
                        )}
                      </button> */}

                      {/* <Button onClick={handleCheckout}>
                        TEST MAYA CHECKOUT
                      </Button> */}

                      <p className="text-xs text-gray-500 text-center">
                        You will not be charged yet.
                      </p>
                    </form>
                  </div>
                </Row>
              )}
            </div>
          </Carousel>
        </div>
      </Drawer>
    </AuthenticatedLayout>
  );
}
