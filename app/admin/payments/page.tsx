"use client";

import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import { useAppMessage } from "@/components/ui/message-popup";
import { useManageOrders } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Table, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { Title } = Typography;

interface OrdersTableType {
  key: string;
  id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_user_id?: string;
  amount?: number;
  currency?: string;
  product_name?: string;
  product_description?: string;
  status?: "processing" | "paid" | "succeeded" | "failed";
  created_at?: string;
  updated_at?: string;
}

const PaymentsPage = () => {
  const { fetchOrders, loading } = useManageOrders();
  const { showMessage, contextHolder } = useAppMessage();
  const [orders, setOrders] = useState<OrdersTableType[]>([]);
  const columns: ColumnsType<OrdersTableType> = [
    {
      title: "Customer ID",
      dataIndex: "customer_user_id",
      key: "customer_user_id",
      ellipsis: true,
      width: "12%",
    },
    {
      title: "Customer Name",
      dataIndex: "customer_name",
      key: "customer_name",
      ellipsis: true,
      width: "12%",
    },
    {
      title: "Purchase Date",
      dataIndex: "created_at",
      key: "created_at",
      width: "12%",
      ellipsis: true,
      sorter: (a, b) =>
        dayjs(a.created_at).toDate().getTime() -
        dayjs(b.created_at).toDate().getTime(),
      render: (value) =>
        value ? dayjs(value).format("MMM DD YYYY hh:mm A") : "",
    },
    {
      title: "Email",
      dataIndex: "customer_email",
      key: "customer_email",
      ellipsis: true,
      width: "12%",
    },
    {
      title: "Amount (PHP)",
      dataIndex: "amount",
      key: "amount",
      width: "12%",
      ellipsis: true,
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
      render: (value, record) => {
        const amount = value / 100;
        return value !== undefined ? `${formatPrice(amount)}` : "";
      },
    },
    {
      title: "Package",
      dataIndex: "product_name",
      key: "product_name",
      ellipsis: true,
      width: "12%",
    },
    {
      title: "Description",
      dataIndex: "product_description",
      key: "product_description",
      ellipsis: true,
      width: "12%",
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
          <Tag color={value === "paid" ? "green" : "red"}>
            {value.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  useEffect(() => {
    handleFetchOrders();
  }, []);

  const handleFetchOrders = async () => {
    try {
      const response = await fetchOrders();
      setOrders(response ?? []);
    } catch (error) {
      showMessage({ type: "error", content: "Error fetching orders" });
      console.log(error);
    }
  };

  return (
    <AdminAuthenticatedLayout>
      {contextHolder}
      <Title level={3}>Payments Page</Title>

      <Table<OrdersTableType>
        loading={loading}
        scroll={{ x: true }}
        columns={columns}
        dataSource={orders}
        size={"middle"}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          responsive: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    </AdminAuthenticatedLayout>
  );
};

export default PaymentsPage;
