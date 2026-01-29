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
  Form,
  Tabs,
  Tag,
  Spin,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import CreateInstructorForm from "@/components/forms/CreateInstructorForm";
import { IoIosSearch } from "react-icons/io";
import useDebounce from "@/hooks/use-debounce";
import {
  useInstructorManagement,
  useManageImage,
  useManagePassword,
  useSearchUser,
} from "@/lib/api";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAppMessage } from "@/components/ui/message-popup";
import axios from "axios";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import { CERTIFICATIONS } from "@/lib/utils";
import axiosApi from "@/lib/axiosConfig";

const { Title, Text } = Typography;

export default function InstructorManagementPage() {
  const [accountCreationForm] = Form.useForm();
  const [changePasswordForm] = Form.useForm();
  const [instructors, setInstructors] = useState<any[] | null>([]);
  const [input, setInput] = useState<string>("");
  const { debouncedValue } = useDebounce(input, 1000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modifyingInstructor, setModifyingInstructor] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profileTab, setProfileTab] = useState<
    "account-creation" | "change-password"
  >("account-creation");
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const { searchInstructors, loading: fetchingInstructors } = useSearchUser();
  const {
    reactivateInstructor,
    deactivateInstructor,
    deleteInstructor,
    updateInstructor,
    createInstructorProfile,
    loading: loadingInstructor,
  } = useInstructorManagement();
  const { changePassword, loading: changingPassword } = useManagePassword();
  const { showMessage, contextHolder } = useAppMessage();
  const { fetchImage } = useManageImage();

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

  useEffect(() => {
    if (profileTab === "account-creation") {
      changePasswordForm.resetFields();
    }
  }, [profileTab]);

  const handleSearchInstructors = async () => {
    const data = await searchInstructors({ name: debouncedValue });
    try {
      if (data) {
        const usersWithSignedUrls = await Promise.all(
          data.map(async (record: any) => {
            let signedUrl: string | null | undefined = undefined;
            const certification: any = CERTIFICATIONS.find(
              (x) => x.value === record.certification,
            );
            const instructor = {
              ...record,
              ...record.user_profiles,
              first_name: record?.user_profiles?.first_name,
              last_name: record?.user_profiles?.last_name,
              full_name: record?.user_profiles?.full_name,
              avatar_path: record?.user_profiles?.avatar_path,
              deactivated: record?.user_profiles?.deactivated,
              certification: certification.label,
            };

            // generate signed URL valid for 1 hour (3600s)
            if (instructor.avatar_path !== null) {
              const signedURL = await fetchImage({
                avatarPath: instructor.avatar_path,
              });

              signedUrl = signedURL;
            }

            return { ...instructor, avatar_url: signedUrl };
          }),
        );

        setInstructors(usersWithSignedUrls);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleOpenModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    setProfileTab("account-creation");
    changePasswordForm.resetFields();
    // accountCreationForm.resetFields();
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setModifyingInstructor(true);
    const professionalDetails = {
      certification: values.certification,
      employment_start_date: values.employment_start_date,
    };

    const credentials = {
      email: values.email,
      password: values.password,
    };
    const userProfile = {
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      full_name: `${values.first_name} ${values.last_name}`,
      avatar_path: values.avatar_path,
      contact_number: values.contact_number,
      emergency_contact_name: values.emergency_contact_name,
      emergency_contact_number: values.emergency_contact_number,
      user_type: "instructor",
    };

    if (instructors && selectedRecord) {
      try {
        const updateResponse = await updateInstructor({
          id: selectedRecord.id,
          values: { ...professionalDetails },
        });

        if (!updateResponse) {
          showMessage({
            type: "error",
            content: "Error updating instructor",
          });
        }

        const { data } = await axiosApi.post("/update-user-email", {
          id: selectedRecord.id,
          email: credentials.email,
        });

        if (!data) {
          showMessage({
            type: "error",
            content: "Error updating email",
          });
        }

        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({
            ...userProfile,
          })
          .eq("id", selectedRecord.id);

        if (profileError) {
          showMessage({
            type: "error",
            content: "Error updating profile",
          });
        }

        showMessage({
          type: "success",
          content: "Instructor has been updated!",
        });
      } catch (error) {
        showMessage({
          type: "error",
          content: "Error updating instructor",
        });
        setModifyingInstructor(false);
      }
    } else {
      try {
        const { data } = await axiosApi.post("/create-instructor", {
          email: credentials.email,
          password: credentials.password,
        });

        if (data.user) {
          const { error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              id: data.user.id,
              ...userProfile,
              deactivated: false,
            });

          if (profileError) {
            showMessage({
              type: "error",
              content: "Error creating profile",
            });
          }

          const createInstructorResponse = await createInstructorProfile({
            values: {
              ...professionalDetails,
              user_id: data.user.id,
              password: credentials.password,
            },
          });

          if (!createInstructorResponse) {
            showMessage({
              type: "error",
              content: "Error creating instructor",
            });
            return;
          }

          showMessage({
            type: "success",
            content: "Instructor has been created!",
          });
        }
      } catch (error) {
        showMessage({
          type: "error",
          content: "Instructor creation failed.",
        });
        setModifyingInstructor(false);
      }
    }

    handleSearchInstructors();
    setIsModalOpen(false);
    setSelectedRecord(null);
    setModifyingInstructor(false);
  };

  const handleChangePassword = async ({
    values,
  }: {
    values: {
      current_password: string;
      new_password: string;
      confirm_new_password: string;
    };
  }) => {
    try {
      const response = await changePassword({
        userID: selectedRecord.id as string,
        newPassword: values.new_password,
      });

      if (response) {
        showMessage({
          type: "success",
          content: "Updated password!",
        });
      } else {
        showMessage({
          type: "error",
          content: "Failed to update password.",
        });
      }
    } catch (error) {
      showMessage({
        type: "error",
        content: "Failed to update password.",
      });
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteInstructor({ id: id as string });

      showMessage({
        type: "success",
        content: "Successfully deleted the instructor!",
      });

      handleSearchInstructors();
    } catch (error) {
      showMessage({
        type: "error",
        content: "Failed to delete the instructor",
      });
    }
  };

  const handleConfirmDeactivate = async (id: string) => {
    try {
      await deactivateInstructor({ id: id as string });

      showMessage({
        type: "success",
        content: "Successfully deactivated the instructor!",
      });

      handleSearchInstructors();
    } catch (error) {
      showMessage({
        type: "error",
        content: "Failed to deactivate the instructor",
      });
    }
  };
  const handleConfirmReactivate = async (id: string) => {
    try {
      await reactivateInstructor({ id: id as string });

      showMessage({
        type: "success",
        content: "Successfully reactivated the instructor!",
      });

      handleSearchInstructors();
    } catch (error) {
      showMessage({
        type: "error",
        content: "Failed to reactivate the instructor",
      });
    }
  };

  const formTabs = [
    {
      key: "account-creation",
      label: "Account Creation",
      children: (
        <CreateInstructorForm
          onDelete={(e) => handleConfirmDelete(e)}
          loading={loadingInstructor || modifyingInstructor}
          isModalOpen={isModalOpen}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          initialValues={selectedRecord}
          isEdit={!!selectedRecord}
          clearSignal={isModalOpen || profileTab}
          form={accountCreationForm}
          onDeactivate={(e) => {
            const instructor = instructors?.find((x) => x.id === e);
            if (
              instructor.deactivated === null ||
              instructor.deactivated === false
            ) {
              handleConfirmDeactivate(instructor.id);
            } else {
              handleConfirmReactivate(instructor.id);
            }
          }}
        />
      ),
    },
    {
      key: "change-password",
      label: "Change Password",
      children: (
        <ChangePasswordForm
          loading={changingPassword}
          clearSignal={isModalOpen || profileTab}
          onSubmit={(values: {
            current_password: string;
            new_password: string;
            confirm_new_password: string;
          }) => {
            handleChangePassword({ values });
          }}
          form={changePasswordForm}
          isAdmin={true}
          userEmail={selectedRecord?.email}
        />
      ),
      disabled: !selectedRecord,
    },
  ];

  const renderSpinner = useMemo(() => {
    return <Spin spinning={true} />;
  }, []);

  return (
    <AdminAuthenticatedLayout>
      {contextHolder}
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

        {fetchingInstructors && (
          <Row wrap={false} justify="center">
            {renderSpinner}
          </Row>
        )}
        {!fetchingInstructors && (
          <Row gutter={[16, 16]}>
            {instructors &&
              instructors.map((data, idx) => {
                return (
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
                              className="rounded-t-lg"
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
                      <Card.Meta
                        title={
                          <Row className="gap-[5px]">
                            <Text>{data.first_name}</Text>
                            {data?.deactivated === true && (
                              <Tag color="red">Deactivated</Tag>
                            )}
                          </Row>
                        }
                        description={data.certification}
                      />
                      {/* {data?.deactivated === true && (
                    <Tag color="red">Deactivated</Tag>
                  )} */}
                    </Card>
                  </Col>
                );
              })}

            {!instructors?.length && (
              <Row className="w-full flex justify-center">
                <Text>No instructors by that name</Text>
              </Row>
            )}
          </Row>
        )}
      </div>

      {isMobile ? (
        <Drawer
          placement="right"
          onClose={handleCloseModal}
          open={isModalOpen}
          width={"100%"}
          styles={{
            body: { paddingTop: 24 },
          }}
        >
          <Tabs
            activeKey={profileTab}
            defaultValue={profileTab}
            onTabClick={(e) =>
              setProfileTab(e as "account-creation" | "change-password")
            }
            items={formTabs}
          />
        </Drawer>
      ) : (
        <Modal
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
          width={600}
          maskClosable={false}
          destroyOnHidden={true}
        >
          <Tabs
            activeKey={profileTab}
            defaultValue={profileTab}
            onTabClick={(e) =>
              setProfileTab(e as "account-creation" | "change-password")
            }
            items={formTabs}
          />
        </Modal>
      )}
    </AdminAuthenticatedLayout>
  );
}
