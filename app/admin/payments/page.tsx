"use client";

import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import { useAppMessage } from "@/components/ui/message-popup";
import {
  useManageCredits,
  useManageOrders,
  usePackageManagement,
} from "@/lib/api";
import axiosApi from "@/lib/axiosConfig";
import { setUser } from "@/lib/features/authSlice";
import { useAppSelector } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";
import {
  Drawer,
  Row,
  Table,
  Tag,
  Typography,
  Descriptions,
  Image,
  Button,
} from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoEye } from "react-icons/io5";
import { useDispatch } from "react-redux";

const { Title } = Typography;

interface OrdersTableType {
  key: string;
  id?: string;
  package_id?: string;
  payment_proof_path?: string;
  avatar_url?: string;
  uploaded_at?: string;
  payment_method?: string;
  status?: "PENDING" | "SUCCESSFUL";
  approved_at?: string;
  package_title?: string;
  package_price?: string;
  package_validity_period?: string;
  created_at?: string;
  reference_id?: string;
  currentActivePackage?: any;
  package_credits?: number;
  user_profiles?: any;
  userCredits?: number;
}

const PaymentsPage = () => {
  const [confirmingPayment, setIsConfirmingPayment] = useState<boolean>(false);
  const { fetchCustomerPayments, loading, updatePaymentStatus } =
    useManageOrders();
  const { showMessage, contextHolder } = useAppMessage();
  const [payments, setPayments] = useState<OrdersTableType[]>([]);
  const [selectedPayment, setSelectedPayment] =
    useState<OrdersTableType | null>(null);
  const [isReviewingPayment, setIsReviewingPayment] = useState<boolean>(false);
  const user = useAppSelector((state) => state.auth.user);
  const [isMobile, setIsMobile] = useState(false);
  const { updateUserCredits, loading: updatingCredits } = useManageCredits();

  const {
    purchasePackage,
    updateClientPackage,
    loading: modifyingPackage,
  } = usePackageManagement();

  useEffect(() => {
    handleFetchOrders();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

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

  const columns = useMemo<ColumnsType<OrdersTableType>>(
    () => [
      {
        title: "Action",
        key: "action",
        width: isMobile ? undefined : "5%",
        fixed: isMobile ? undefined : "right",
        render: (_, record) => (
          <Row wrap={false} className="justify-center cursor-pointer gap-3">
            <IoEye size={20} onClick={() => handleViewPayment(record)} />
          </Row>
        ),
      },
      {
        title: "Method",
        dataIndex: "payment_method",
        key: "payment_method",
        width: "12%",
        ellipsis: true,
        render: (value) => {
          if (!value) return "";
          return (
            <Tag
              color={
                value === "maya"
                  ? "green"
                  : value === "gcash"
                    ? "blue"
                    : value === "bank_transfer"
                      ? "orange"
                      : "cyan"
              }
            >
              {value.toUpperCase()}
            </Tag>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: "12%",
        ellipsis: true,
        render: (value) => {
          if (!value) return "";
          return (
            <Tag color={value === "SUCCESSFUL" ? "green" : "red"}>
              {value.toUpperCase()}
            </Tag>
          );
        },
      },
      {
        title: "Reference ID",
        dataIndex: "reference_id",
        key: "reference_id",
        ellipsis: true,
        width: "12%",
      },
      {
        title: "Customer Name",
        key: "customer_name",
        ellipsis: true,
        width: "12%",
        render: (_, record) => {
          if (!record) return "";
          return record.user_profiles?.full_name || "N/A";
        },
      },
      {
        title: "Email",
        key: "customer_email",
        ellipsis: true,
        width: "12%",
        render: (_, record) => {
          if (!record) return "";
          return record.user_profiles?.email || "N/A";
        },
      },
      {
        title: "Package Title",
        dataIndex: "package_title",
        key: "package_title",
        ellipsis: true,
        width: "12%",
      },
      {
        title: "Amount (PHP)",
        dataIndex: "package_price",
        key: "package_price",
        width: "12%",
        ellipsis: true,
        sorter: (a, b) =>
          (Number(a.package_price) || 0) - (Number(b.package_price) || 0),
        render: (value) => {
          return value !== undefined ? `${formatPrice(value)}` : "";
        },
      },
      {
        title: "Approved Date",
        dataIndex: "approved_at",
        key: "approved_at",
        width: "12%",
        ellipsis: true,
        sorter: (a, b) =>
          dayjs(a.approved_at).toDate().getTime() -
          dayjs(b.approved_at).toDate().getTime(),
        render: (value) =>
          value ? dayjs(value).format("MMM DD YYYY (hh:mm A)") : "",
      },
      {
        title: "Proof Upload Date",
        dataIndex: "uploaded_at",
        key: "uploaded_at",
        width: "12%",
        ellipsis: true,
        sorter: (a, b) =>
          dayjs(a.uploaded_at).toDate().getTime() -
          dayjs(b.uploaded_at).toDate().getTime(),
        render: (value) =>
          value ? dayjs(value).format("MMM DD YYYY (hh:mm A)") : "",
      },
    ],
    [isMobile, payments],
  );

  const handleViewPayment = (record: OrdersTableType) => {
    setSelectedPayment(record);
    setIsReviewingPayment(true);
  };

  const handleFetchOrders = async () => {
    try {
      const response = await fetchCustomerPayments();
      console.log("response: ", response);
      setPayments(response?.data.payments);
    } catch (error) {
      showMessage({ type: "error", content: "Error fetching orders_temp" });
      console.log(error);
    }
  };

  const handleUpdatePaymentStatus = async (status: string) => {
    setIsConfirmingPayment(true);
    try {
      const response = await updatePaymentStatus({
        status,
        id: selectedPayment?.id as string,
        approved_at: dayjs().toISOString(),
      });

      // save credits to manual payment info

      // this saves purchase order info into the client packages table

      await Promise.all([
        handlePurchasePackage(),
        handleUpdateUserCredits({
          userID: selectedPayment!.user_profiles.id,
          credits: selectedPayment!.package_credits as number,
        }),
        handleSendConfirmationEmail(),
      ]);

      setIsReviewingPayment(false);

      if (response?.data) await handleFetchOrders();

      showMessage({
        type: "success",
        content: "You have confirmed this transaction",
      });
      setIsConfirmingPayment(false);
    } catch (error) {
      showMessage({
        type: "error",
        content: "An error has occurred",
      });
      console.error(error);
      setIsConfirmingPayment(false);
    }
    setIsConfirmingPayment(false);
  };

  const handleSendConfirmationEmail = async () => {
    const res = await axiosApi.post("/send-email", {
      to: selectedPayment?.user_profiles.email,
      title: selectedPayment?.package_title,
      emailType: "package_purchase",
    });
    const data = await res.data;
  };

  const handleUpdateUserCredits = async ({
    userID,
    credits,
  }: {
    userID: string;
    credits: number;
  }) => {
    try {
      await updateUserCredits({
        userID: userID as string,
        values: { credits },
      });

      // dispatch(setUser({ ...user, credits, currentPackage: selectedRecord }));
    } catch (error) {
      console.log(error);
    }
  };

  const handlePurchasePackage = async () => {
    if (selectedPayment) {
      try {
        if (selectedPayment?.userCredits === 0) {
          await updateClientPackage({
            clientPackageID: selectedPayment.currentActivePackage?.id as string,
            values: { status: "expired", expirationDate: dayjs() },
          });
        }

        const response = await purchasePackage({
          userID: selectedPayment.user_profiles?.id as string,
          packageID: selectedPayment.package_id as string,
          paymentMethod: selectedPayment.payment_method as string,
          packageName: selectedPayment.package_title as string,
          validityPeriod: Number(selectedPayment.package_validity_period),
          packageCredits: selectedPayment.package_credits as number,
        });

        return response;
      } catch (error) {
        console.log(error);
      }
    }
  };

  const RenderTable = useCallback(() => {
    return (
      <Table<OrdersTableType>
        loading={
          loading || updatingCredits || modifyingPackage || confirmingPayment
        }
        scroll={{ x: true }}
        columns={columns}
        dataSource={payments}
        size={isMobile ? "small" : "middle"}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          responsive: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    );
  }, [
    payments,
    columns,
    isMobile,
    loading,
    updatingCredits,
    modifyingPackage,
    confirmingPayment,
  ]);

  const handleClose = () => {
    setIsReviewingPayment(false);
    setSelectedPayment(null);
  };

  return (
    <AdminAuthenticatedLayout>
      {contextHolder}
      <Title level={3}>Payments Page</Title>

      <RenderTable />

      <Drawer
        keyboard={false}
        maskClosable={false}
        placement="right"
        title="Review Client Transaction"
        closable={
          !loading &&
          !updatingCredits &&
          !modifyingPackage &&
          !confirmingPayment
        }
        onClose={handleClose}
        open={isReviewingPayment}
        width={isMobile ? "100%" : "30%"}
        destroyOnClose={true}
        styles={{
          body: {
            paddingTop: 24,
            overflow: "auto",
          },
        }}
      >
        {selectedPayment && (
          <div className="space-y-6">
            {!selectedPayment?.avatar_url && (
              <Row
                wrap={false}
                className="flex-col gap-y-[10px] bg-slate-200 p-[20px] rounded-[10px]"
              >
                <Title level={5}>
                  Proof is not available as payment was done through the Maya
                  Partner. Please check your Maya account for more details on
                  the transaction
                </Title>
              </Row>
            )}
            {selectedPayment?.avatar_url && (
              <Row wrap={false} className="flex-col gap-y-[10px]">
                <Row wrap={false} className="flex-col">
                  <Title level={5}>Payment Proof</Title>
                  <Image
                    src={selectedPayment?.avatar_url}
                    alt="Payment Proof"
                    className="w-full rounded-lg"
                    placeholder={true}
                  />
                </Row>
                <Row wrap={false} className="gap-x-[10px]" justify={"center"}>
                  <Button
                    loading={
                      loading ||
                      updatingCredits ||
                      modifyingPackage ||
                      confirmingPayment
                    }
                    disabled={
                      confirmingPayment ||
                      loading ||
                      selectedPayment.status === "SUCCESSFUL"
                    }
                    onClick={() => handleUpdatePaymentStatus("SUCCESSFUL")}
                    className={`${
                      selectedPayment.status !== "SUCCESSFUL" &&
                      "hover:!bg-green-400 hover:!border-green-400 hover:!text-white bg-green-400"
                    } ${
                      selectedPayment.status === "SUCCESSFUL" &&
                      "hover:!bg-green-200 hover:!border-green-200 hover:!text-white bg-green-200"
                    } h-[40px] rounded-[10px]  text-white`}
                  >
                    {selectedPayment.status === "SUCCESSFUL"
                      ? "Confirmed"
                      : "Confirm Transaction"}
                  </Button>
                </Row>
              </Row>
            )}
            <Descriptions
              title="Customer Information"
              bordered
              column={1}
              size="small"
            >
              <Descriptions.Item label="Name">
                {selectedPayment.user_profiles?.full_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedPayment.user_profiles?.email || "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              title="Package Details"
              bordered
              column={1}
              size="small"
            >
              <Descriptions.Item label="Package Title">
                {selectedPayment.package_title || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Package Credits">
                {selectedPayment.package_credits || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Price">
                {selectedPayment.package_price
                  ? `PHP ${formatPrice(selectedPayment.package_price)}`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Validity Period">
                {selectedPayment.package_validity_period || "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              title="Payment Information"
              bordered
              column={1}
              size="small"
            >
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedPayment.status === "SUCCESSFUL" ? "green" : "orange"
                  }
                >
                  {selectedPayment.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedPayment.payment_method || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Uploaded At">
                {selectedPayment.uploaded_at
                  ? dayjs(selectedPayment.uploaded_at).format(
                      "MMM DD, YYYY (hh:mm A)",
                    )
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Approved At">
                {selectedPayment.approved_at
                  ? dayjs(selectedPayment.approved_at).format(
                      "MMM DD, YYYY (hh:mm A)",
                    )
                  : "Pending"}
              </Descriptions.Item>
              <Descriptions.Item label="Order ID">
                {selectedPayment.reference_id || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </AdminAuthenticatedLayout>
  );
};

export default PaymentsPage;
