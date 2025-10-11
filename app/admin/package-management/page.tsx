"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Button,
  Modal,
  Drawer,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import DatePickerCarousel from "@/components/ui/datepicker-carousel";
import AdminBookingTable from "@/components/ui/admin-booking-table";
import CreateClassForm from "@/components/forms/CreateClassForm";
import { formatTime } from "@/lib/utils";
import dayjs from "dayjs";
import { CreatePackageProps } from "@/lib/props";
import AdminPackageTable from "@/components/ui/admin-package-table";
import CreatePackageForm from "@/components/forms/CreatePackageForm";

const { Title } = Typography;

let data: CreatePackageProps[] = [
  {
    key: "1",
    name: "12 Sessions",
    price: 5000,
    validity_period: 20,
    promo: false,
  },
  {
    key: "2",
    name: "Drop In",
    price: 5000,
    validity_period: 30,
    promo: true,
  },
  {
    key: "3",
    name: "Trial Pack",
    price: 5000,
    validity_period: 50,
    promo: false,
  },
  {
    key: "4",
    name: "40 Sessions",
    price: 5000,
    validity_period: 40,
    promo: false,
  },
];

export default function ClassManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CreatePackageProps | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpenModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: CreatePackageProps) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleSubmit = (values: any) => {
    if (editingRecord) {
      const index = data.findIndex((item) => item.key === editingRecord.key);
      if (index !== -1) {
        data[index] = {
          ...data[index],
          name: values.name,
          price: values.price,
          promo: values.promo,
          validity_period: values.validity_period,
        };
      }
    } else {
      data.push({
        key: (data.length + 1).toString(),
        name: values.name,
        price: values.price,
        promo: values.promo,
        validity_period: values.validity_period,
      });
    }

    setIsModalOpen(false);
    setEditingRecord(null);
  };

  return (
    <AdminAuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <Title level={2} className="!mb-2">
            Package Management
          </Title>
        </div>

        <div>
          <Row className="mb-4 justify-end">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenModal}
              className={`bg-[#733AC6] hover:!bg-[#5B2CA8] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              Create
            </Button>
          </Row>
          <AdminPackageTable data={data} onEdit={handleEdit} />
        </div>
        {isMobile ? (
          <Drawer
            title={editingRecord ? "Edit Package" : "Create New Package"}
            placement="right"
            onClose={handleCloseModal}
            open={isModalOpen}
            width={"100%"}
            styles={{
              body: { paddingTop: 24 },
            }}
          >
            <CreatePackageForm
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              initialValues={editingRecord}
              isEdit={!!editingRecord}
            />
          </Drawer>
        ) : (
          <Modal
            title={editingRecord ? "Edit Package" : "Create New Package"}
            open={isModalOpen}
            onCancel={handleCloseModal}
            footer={null}
            width={600}
          >
            <div className="pt-4">
              <CreatePackageForm
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                initialValues={editingRecord}
                isEdit={!!editingRecord}
              />
            </div>
          </Modal>
        )}
      </div>
    </AdminAuthenticatedLayout>
  );
}
