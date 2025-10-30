"use client";

import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Drawer,
  Modal,
  Input,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import CreateInstructorForm from "@/components/forms/CreateInstructorForm";
import { IoIosSearch } from "react-icons/io";
import useDebounce from "@/hooks/use-debounce";
import { useInstructorManagement, useSearchUser } from "@/lib/api";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";

const { Title, Text } = Typography;

export default function InstructorManagementPage() {
  const [instructors, setInstructors] = useState<any[] | null>([]);
  const [input, setInput] = useState<string>("");
  const { debouncedValue } = useDebounce(input, 1000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const { searchInstructors, loading } = useSearchUser();
  const { createInstructor, loading: creatingInstructor } =
    useInstructorManagement();

  useEffect(() => {
    handleSearchInstructors();
  }, [debouncedValue]);

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

  const handleSearchInstructors = async () => {
    const data = await searchInstructors({ name: debouncedValue });
    console.log(data);
    try {
      if (data) {
        const usersWithSignedUrls = await Promise.all(
          data.map(async (instructor) => {
            if (!instructor.avatar_path) return instructor; // skip if no avatar

            // generate signed URL valid for 1 hour (3600s)
            const { data, error: urlError } = await supabase.storage
              .from("user-photos")
              .createSignedUrl(`${instructor.avatar_path}`, 3600);

            if (urlError) {
              console.error("Error generating signed URL:", urlError);
              return { ...instructor, avatar_url: null };
            }

            return { ...instructor, avatar_url: data?.signedUrl };
          })
        );

        console.log("usersWithSignedUrls: ", usersWithSignedUrls);
        setInstructors(usersWithSignedUrls);
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
    console.log("record: ", record);
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    console.log("Form values:", values);

    if (editingRecord) {
      // const index = data.findIndex((item) => item.key === editingRecord.key);
      // console.log("index: ", index);
      // if (index !== -1) {
      //   const currentSlots = data[index].slots.split("/")[0].trim();
      //   data[index] = {
      //     ...data[index],
      //     instructor: values.instructor,
      //     start_time: values.start_time,
      //     end_time: values.end_time,
      //     slots: `${currentSlots} / ${values.slots}`,
      //   };
      // }
    } else {
      const inputs = {
        first_name: values.first_name,
        last_name: values.last_name,
        full_name: `${values.first_name} ${values.last_name}`,
        avatar_path: values.avatar_path,
      };
      const response = await createInstructor({ values: inputs });

      if (response) {
        handleSearchInstructors();
        message.success("Instructor has been created!");
      }
    }

    setIsModalOpen(false);
    setEditingRecord(null);
  };

  return (
    <AdminAuthenticatedLayout>
      <div className="space-y-6">
        <Row wrap={false} className="flex flex-col gap-y-[15px]">
          <Row className="items-center justify-between">
            <Title level={2} className="!mb-0">
              Instructor Management
            </Title>

            <Button
              type="primary"
              onClick={handleOpenModal}
              icon={<PlusOutlined />}
              className="!bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
            >
              New Instructor
            </Button>
          </Row>

          <Input
            className="max-w-[300px]"
            placeholder="Search instructors"
            prefix={<IoIosSearch />}
            onChange={(e) => setInput(e.target.value)}
          />
        </Row>

        <Row gutter={[16, 16]}>
          {instructors &&
            instructors.map((data, idx) => (
              <Col key={idx} xs={24} sm={12} md={8} lg={6} xl={6} xxl={6}>
                <Card
                  onClick={() => handleEdit(data)}
                  hoverable
                  cover={
                    <div
                      style={{
                        height: 200, // same height as an image cover
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f5f5f5", // optional: placeholder background
                      }}
                    >
                      {data?.avatar_url === undefined && (
                        <User style={{ fontSize: 64, color: "#999" }} />
                      )}
                      {data?.avatar_url && (
                        <img
                          src={data.avatar_url}
                          alt={data.full_name}
                          style={{
                            objectFit: "cover",
                            height: 200,
                            width: "100%",
                          }}
                        />
                      )}
                    </div>
                  }
                >
                  <Card.Meta title={data.first_name} description={data.role} />
                </Card>
              </Col>
            ))}

          {!instructors?.length && (
            <Row className="w-full flex justify-center">
              <Text>No clients by that name</Text>
            </Row>
          )}
        </Row>
      </div>

      {isMobile ? (
        <Drawer
          title={editingRecord ? "Edit Instructor" : "Create New Instructor"}
          placement="right"
          onClose={handleCloseModal}
          open={isModalOpen}
          width={"100%"}
          styles={{
            body: { paddingTop: 24 },
          }}
        >
          <CreateInstructorForm
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            initialValues={editingRecord}
            isEdit={!!editingRecord}
          />
        </Drawer>
      ) : (
        <Modal
          title={editingRecord ? "Edit Instructor" : "Create New Instructor"}
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
          width={600}
        >
          <div className="pt-4">
            <CreateInstructorForm
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              initialValues={editingRecord}
              isEdit={!!editingRecord}
            />
          </div>
        </Modal>
      )}
    </AdminAuthenticatedLayout>
  );
}
