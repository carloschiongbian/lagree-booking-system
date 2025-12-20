"use client";

import { useState, useEffect } from "react";
import { Row, Typography, Button, Modal, Drawer, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import { CreatePackageProps } from "@/lib/props";
import AdminPackageTable from "@/components/ui/admin-package-table";
import CreatePackageForm from "@/components/forms/CreatePackageForm";
import { usePackageManagement } from "@/lib/api";
import { useAppMessage } from "@/components/ui/message-popup";

const { Title } = Typography;

export default function PackageManagementPage() {
  const [packageForm] = Form.useForm();
  const [packages, setPackages] = useState<any[]>([]);
  const { showMessage, contextHolder } = useAppMessage();
  const {
    createPackage,
    updatePackage,
    fetchPackages,
    deletePackage,
    loading,
  } = usePackageManagement();
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
    const response = await fetchPackages({ isAdmin: true });
    if (response) {
      const mapped = response.map((pkg: any, index: number) => ({
        key: pkg.id,
        id: pkg.id,
        title: pkg.title,
        price: pkg.price,
        validity_period: pkg.validity_period,
        package_credits: pkg.package_credits,
        offered_for_clients: pkg.offered_for_clients,
      }));
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

  const handleSubmit = async (values: CreatePackageProps) => {
    const formData = {
      title: values.name,
      price: values.price,
      package_type: "regular",
      package_credits: values.package_credits ?? null,
      validity_period: values.validity_period,
      offered_for_clients: values.offered_for_clients,
    };
    try {
      if (editingRecord) {
        await updatePackage({
          id: editingRecord?.key as string,
          values: formData,
        });
      } else {
        await createPackage({ values: formData });
      }

      setIsModalOpen(false);
      setEditingRecord(null);
      handleFetchPackages();

      showMessage({
        type: "success",
        content: editingRecord
          ? "Successfully updated package"
          : "Successfully created new package",
      });
    } catch (error) {
      showMessage({
        type: "error",
        content: editingRecord
          ? "Error updating package"
          : "Error creating new package",
      });
      console.error("Error submitting package:", error);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deletePackage({ id: id as string });

      showMessage({
        type: "success",
        content: "Successfully deleted the package!",
      });

      handleFetchPackages();
    } catch (error) {
      showMessage({ type: "error", content: "Failed to delete the package" });
    }
  };

  return (
    <AdminAuthenticatedLayout>
      {contextHolder}
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
              className={`bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              Create
            </Button>
          </Row>
          <AdminPackageTable
            loading={loading}
            data={[...packages]}
            onEdit={handleEdit}
            onDelete={handleConfirmDelete}
          />
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
            destroyOnHidden={true}
          >
            <CreatePackageForm
              clearSignal={isModalOpen}
              form={packageForm}
              loading={loading}
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
            destroyOnHidden={true}
          >
            <div className="pt-4">
              <CreatePackageForm
                clearSignal={isModalOpen}
                form={packageForm}
                loading={loading}
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
