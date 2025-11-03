"use client";
export const dynamic = "force-dynamic";

import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import { Row, Typography, Spin, Drawer } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useSearchUser, useUpdateUser } from "@/lib/api";
import { useEffect, useState } from "react";
import useDebounce from "@/hooks/use-debounce";
import EditClientForm from "@/components/forms/EditClientForm";
import { supabase } from "@/lib/supabase";
import AdminClientTable from "@/components/ui/admin-client-table";

const { Title, Text } = Typography;

export default function ClientManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  // const [input, setInput] = useState<string>("");
  // const { debouncedValue } = useDebounce(input, 1000);
  const { searchClients, loading } = useSearchUser();
  const { updateUser, loading: updating } = useUpdateUser();

  useEffect(() => {
    handleSearchClients();
  }, []);

  const handleSearchClients = async () => {
    // const data = await searchClients({ name: debouncedValue });
    const data = await searchClients({});

    try {
      if (data) {
        const mapped = await Promise.all(
          data.map(async (user) => {
            if (!user.avatar_path) return user; // skip if no avatar

            // generate signed URL valid for 1 hour (3600s)
            const { data, error: urlError } = await supabase.storage
              .from("user-photos")
              .createSignedUrl(`${user.avatar_path}`, 3600);

            if (urlError) {
              console.error("Error generating signed URL:", urlError);
              return { ...user, avatar_url: null };
            }

            return { ...user, key: user.id, avatar_url: data?.signedUrl };
          })
        );

        setClients(mapped);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleOpenModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        await updateUser({
          id: editingRecord.id,
          values,
        });

        setIsModalOpen(false);
        setEditingRecord(null);
        handleSearchClients();
      }
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  return (
    <AdminAuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <Row className="flex flex-col gap-y-[15px]">
            <Title level={2} className="!mb-0">
              Client Management
            </Title>
            {/* <Input
              className="max-w-[300px]"
              placeholder="Search clients"
              prefix={<IoIosSearch />}
              onChange={(e) => setInput(e.target.value)}
            /> */}
          </Row>
        </div>

        <div className="w-full">
          {loading ? (
            <div className="flex justify-center w-full">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                size="large"
              />
            </div>
          ) : (
            <>
              <div className="w-full">
                <AdminClientTable
                  loading={loading}
                  data={[...clients]}
                  onEdit={handleEdit}
                />
              </div>

              {/* {!clients?.length && (
                <div className="flex justify-center w-full">
                  <Text>No clients by that name</Text>
                </div>
              )} */}
            </>
          )}
        </div>
      </div>

      {isMobile ? (
        <Drawer
          // title={"Edit Client"}
          maskClosable={false}
          placement="right"
          onClose={handleCloseModal}
          open={isModalOpen}
          width={"100%"}
          styles={{
            body: { paddingTop: 24 },
          }}
        >
          <EditClientForm
            loading={updating}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            initialValues={editingRecord}
            isEdit={!!editingRecord}
          />
        </Drawer>
      ) : (
        <Drawer
          // title={"Edit Client"}
          maskClosable={false}
          open={isModalOpen}
          width={"30%"}
          onClose={handleCloseModal}
          // onCancel={handleCloseModal}
          footer={null}
          // width={600}
          styles={{
            body: { paddingTop: 10 },
          }}
        >
          <div className="pt-4">
            <EditClientForm
              loading={updating}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              initialValues={editingRecord}
              isEdit={!!editingRecord}
            />
          </div>
        </Drawer>
      )}
    </AdminAuthenticatedLayout>
  );
}
