"use client";

import { useState, useEffect } from "react";
import { Row, Typography, Button, Modal, Drawer } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import { CreatePackageProps } from "@/lib/props";
import AdminPackageTable from "@/components/ui/admin-package-table";
import CreatePackageForm from "@/components/forms/CreatePackageForm";
import { usePackageManagement } from "@/lib/api";

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

export default function PackageManagementPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const { createPackage, fetchPackages, loading } = usePackageManagement();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CreatePackageProps | null>(
    null
  );

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
    console.log(response);
    if (response) {
      const mapped = response.map((pkg: any, index: number) => ({
        key: pkg.id,
        title: pkg.title,
        price: pkg.price,
        validity_period: pkg.validity_period,
        promo: pkg.package_type === "promo",
      }));
      console.log("mapped: ", mapped);
      setPackages(mapped);
    }
  };

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

  const handleSubmit = async (values: any) => {
    const formData = {
      title: values.name,
      price: values.price,
      package_type: values.promo ? "promo" : "regular",
      validity_period: values.validity_period,
    };
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
      await createPackage({ values: formData });
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
          <AdminPackageTable data={[...packages]} onEdit={handleEdit} />
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
