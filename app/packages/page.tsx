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
  Spin,
  Input,
  Form,
} from "antd";
import { v4 as uuidv4 } from "uuid";
import { CalendarOutlined } from "@ant-design/icons";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { formatPHPhoneToE164, formatPrice } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Package,
  User,
} from "lucide-react";
import { useManageCredits, usePackageManagement } from "@/lib/api";
import { useAppSelector } from "@/lib/hooks";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/features/authSlice";
import UserTermsAndConditions from "@/components/layout/UserTermsAndConditions";
import { Address, PackageProps, PurchaseFormData } from "@/lib/props";
import dayjs from "dayjs";
import { useAppMessage } from "@/components/ui/message-popup";
import axiosApi from "@/lib/axiosConfig";

const { Title, Text } = Typography;
const CAROUSEL_SLIDES = {
  TERMS: 0,
  PACKAGE_DETAILS: 1,
  CHECKOUT: 2,
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phPhoneRegex = /^(\+63|0)9\d{9}$/;

type PaymentMethod = "card" | "paymaya" | "gcash";

export default function PackagesPage() {
  const dispatch = useDispatch();
  const [processingMaya, setProcessingMaya] = useState(false);
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

    const mapped = response?.map((data: any) => {
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
    // setSelectedRecord(null);
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
    //trigger
    try {
      //temporary behavior
      // setIsSubmitting(true);
      // await handlePurchasePackage();
      // await handleUpdateUserCredits({
      //   credits: selectedRecord.packageCredits,
      // });
      // await handleSendConfirmationEmail();
      //temporary behavior

      // temporarily commented out until payments is integrated
      setCarouselSlide(2);
      carouselRef.current.next();
      // temporarily commented out until payments is integrated

      //temporary behavior
      // showMessage({
      //   type: "success",
      //   content: "Successfully purchased package!",
      // });
      // setIsModalOpen(false);
      // setSelectedRecord(null);
      // setIsSubmitting(false);
      //temporary behavior
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
  const [checkoutForm] = Form.useForm();
  const [formData, setFormData] = useState<PurchaseFormData>({
    productName: "Premium Subscription",
    productPrice: "1500.00",
    firstName: user?.first_name,
    lastName: user?.last_name,
    customerEmail: user?.email,
    customerPhone: user?.contact_number,
    quantity: 1,
    billingAddress: {
      line1: "",
      city: "",
      state: "",
      zipCode: "",
      countryCode: "PH",
    },
    shippingAddress: {
      line1: "",
      city: "",
      state: "",
      zipCode: "",
      countryCode: "",
      firstName: "",
      middleName: "",
      lastName: "",
      customerPhone: "",
      customerEmail: "",
    },
  });

  useEffect(() => {
    if (user) {
      const values = {
        ...formData,
        firstName: user?.first_name || "",
        lastName: user?.last_name || "",
        customerEmail: user?.email || "",
        customerPhone: user?.contact_number || "",
        billingAddress: {
          ...formData.billingAddress,
          line1: user?.location || "",
        },
      };

      checkoutForm.setFieldsValue(values);
      setFormData(values);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Test Maya Checkout
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const handleSameAsBillingToggle = (checked: boolean) => {
    setSameAsBilling(checked);

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.billingAddress,
          firstName: prev.firstName,
          middleName: prev.middleName,
          lastName: prev.lastName,
          customerPhone: prev.customerPhone,
          customerEmail: prev.customerEmail,
        },
      }));
    }
  };

  const handleBillingAddressChange = (field: keyof Address, value: string) => {
    const newBillingAddress = { ...formData.billingAddress, [field]: value };
    setFormData((prev) => ({
      ...prev,
      billingAddress: newBillingAddress,
      shippingAddress: sameAsBilling
        ? {
            ...newBillingAddress,
            firstName: prev.firstName,
            middleName: prev.middleName,
            lastName: prev.lastName,
            phone: prev.customerPhone,
            email: prev.customerEmail,
          }
        : prev.shippingAddress,
    }));
  };

  const calculateTotal = () => {
    const price = parseFloat(selectedRecord.price);
    const quantity = 1;
    return (price * quantity).toFixed(2);
  };

  const handleCheckout = async () => {
    try {
      setProcessingMaya(true);
      const totalAmount = calculateTotal();
      const uuid = uuidv4();

      const checkoutPayload = {
        buyer: {
          firstName: formData?.firstName,
          lastName: formData?.lastName,
          contact: {
            phone: formatPHPhoneToE164(formData?.customerPhone as string) || "",
            email: formData.customerEmail,
          },
          billingAddress: formData.billingAddress,
        },
        totalAmount: {
          value: parseFloat(totalAmount),
          currency: "PHP",
        },
        items: [
          {
            name: selectedRecord.title,
            quantity: 1,
            amount: {
              value: parseFloat(selectedRecord.price),
            },
            totalAmount: {
              value: parseFloat(totalAmount),
            },
          },
        ],
        redirectUrl: {
          success: `${window.location.origin}/packages`,
          failure: `${window.location.origin}/packages`,
          cancel: `${window.location.origin}/packages`,
        },
        allowedPaymentMethods: ["CARD", "EWALLET", "QR_PH"],
        requestReferenceNumber: `${uuid}`,

        // change to actual URL once website is for go live
        notificationUrl: `${process.env.SYSTEM_ORIGIN_TEMP!!}/api/maya/webhook`,
      };

      console.log("checkoutPayload: ", checkoutPayload);
      const response = await axiosApi.post("/maya/checkout", checkoutPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      if (data.success && data.checkoutUrl) {
        // Opens checkoutUrl in a new tab
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("error.message: ", error);
    }
  };

  const updateField = (
    section: string,
    field: string,
    value: string | number | undefined
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]:
        typeof prev[section] === "object"
          ? { ...prev[section], [field]: value }
          : value,
    }));
  };

  const renderCheckoutLoader = useCallback(() => {
    return (
      <Row
        justify="center"
        align="middle"
        className="fixed inset-0 z-[9999] bg-black/60 p-4"
      >
        <Row
          justify="center"
          align="middle"
          className="gap-y-[20px] bg-white rounded-lg w-full max-w-md items-center justify-center px-4 py-[40px]"
        >
          <Row justify="center" align="middle">
            <Text className="text-[red] font-semibold text-base text-center m-0 p-0">
              Please do not exit or refresh the website
            </Text>
            <Text className="text-[#36013F] font-light text-base text-center">
              You will be redirected to a checkout with Maya shortly
            </Text>
          </Row>
          <Spin />
        </Row>
      </Row>
    );
  }, []);

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
                        // disabled={disablePurchase}
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
        // destroyOnHidden={true}
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
                    <div className="border-2 border-[#36013F] rounded-xl p-3">
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
                    <Divider className="p-0 my-[5px]" />

                    <Form
                      form={checkoutForm}
                      layout="vertical"
                      onFinish={handleCheckout}
                      className="flex flex-col gap-y-[10px] mt-[20px]"
                    >
                      {/* Personal Information */}
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-5 h-5 text-slate-700" />
                        <h2 className="text-lg font-medium text-slate-900">
                          Personal Information
                        </h2>
                      </div>

                      <Row wrap={false} className="gap-3">
                        <Form.Item
                          className="mb-0"
                          label="First Name"
                          name="firstName"
                          rules={[
                            {
                              required: true,
                              message: "First Name is required",
                            },
                          ]}
                        >
                          <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Juan"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </Form.Item>

                        <Form.Item
                          className="mb-0"
                          label="Last Name"
                          name="lastName"
                          rules={[
                            {
                              required: true,
                              message: "Last Name is required",
                            },
                          ]}
                        >
                          <Input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Dela Cruz"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </Form.Item>
                      </Row>

                      <Row wrap={false} className="gap-3">
                        <Form.Item
                          className="mb-0"
                          label="Email Address"
                          name="customerEmail"
                          rules={[
                            { required: true, message: "Email is required" },
                            {
                              pattern: emailRegex,
                              message: "Enter a valid email address",
                            },
                          ]}
                        >
                          <Input
                            name="customerEmail"
                            value={formData.customerEmail}
                            onChange={handleInputChange}
                            placeholder="juan@example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </Form.Item>

                        <Form.Item
                          className="mb-0"
                          label="Phone Number"
                          name="customerPhone"
                          rules={[
                            {
                              required: true,
                              message: "Phone number is required",
                            },
                            {
                              pattern: phPhoneRegex,
                              message: "Enter a valid Philippine phone number",
                            },
                          ]}
                        >
                          <Input
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleInputChange}
                            placeholder="09123456789"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </Form.Item>
                      </Row>

                      <Divider className="my-4" />

                      {/* Billing Address */}
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-slate-700" />
                        <h2 className="text-lg font-medium text-slate-900">
                          Billing Address
                        </h2>
                      </div>

                      <Form.Item
                        className="mb-0"
                        label="Street Address"
                        name={["billingAddress", "line1"]}
                        rules={[
                          {
                            required: true,
                            message: "Street Address is required",
                          },
                        ]}
                      >
                        <Input
                          onChange={(e) =>
                            handleBillingAddressChange("line1", e.target.value)
                          }
                          placeholder="Street Address"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </Form.Item>

                      <Row wrap={false} className="gap-3">
                        <Form.Item
                          className="mb-0"
                          label="City"
                          name={["billingAddress", "city"]}
                          rules={[
                            { required: true, message: "City is required" },
                          ]}
                        >
                          <Input
                            onChange={(e) =>
                              handleBillingAddressChange("city", e.target.value)
                            }
                            placeholder="City"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </Form.Item>

                        <Form.Item
                          className="mb-0"
                          label="State/Province"
                          name={["billingAddress", "state"]}
                          rules={[
                            {
                              required: true,
                              message: "State/Province is required",
                            },
                          ]}
                        >
                          <Input
                            onChange={(e) =>
                              handleBillingAddressChange(
                                "state",
                                e.target.value
                              )
                            }
                            placeholder="State/Province"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </Form.Item>

                        <Form.Item
                          className="mb-0"
                          label="Zip Code"
                          name={["billingAddress", "zipCode"]}
                          rules={[
                            { required: true, message: "Zip Code is required" },
                          ]}
                        >
                          <Input
                            onChange={(e) =>
                              handleBillingAddressChange(
                                "zipCode",
                                e.target.value
                              )
                            }
                            placeholder="Zip Code"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </Form.Item>
                      </Row>

                      <Divider className="my-4" />

                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                          You will be redirected to a Maya checkout page to
                          complete your payment securely.
                        </p>
                      </div>

                      {/* implement logic to handle failed and cancelled scenarios */}
                      <Row justify={"center"} className="flex-col">
                        <Button
                          loading={processingMaya}
                          disabled={processingMaya}
                          htmlType="submit"
                          className="font-medium rounded-[10px] bg-[#36013F] hover:!bg-[#36013F] text-white hover:!text-white p-[20px]"
                        >
                          Proceed to Checkout
                        </Button>
                        <Text className="text-xs text-gray-500 text-center">
                          You will not be charged yet.
                        </Text>
                      </Row>
                    </Form>
                  </div>
                </Row>
              )}
            </div>
          </Carousel>
        </div>
      </Drawer>

      {processingMaya && renderCheckoutLoader()}
    </AuthenticatedLayout>
  );
}
