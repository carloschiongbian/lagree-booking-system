"use client";
export const dynamic = "force-dynamic";

import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import { Row, Typography, Spin, Drawer, Col, Segmented } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useManageCredits, useSearchUser, useUpdateUser } from "@/lib/api";
import { useEffect, useState } from "react";
import useDebounce from "@/hooks/use-debounce";
import EditClientForm from "@/components/forms/EditClientForm";
import { supabase } from "@/lib/supabase";
import AdminClientTable from "@/components/ui/admin-client-table";
import { omit } from "lodash";
import { useAppSelector } from "@/lib/hooks";
import dayjs from "dayjs";
import { attendanceStatus } from "@/lib/utils";
import UserBookingHistory from "@/components/ui/user-booking-history";

const { Title, Text } = Typography;

export default function ClientManagementPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const { updateUserCredits } = useManageCredits();
  const { searchClients, loading } = useSearchUser();
  const { updateUser, loading: updating } = useUpdateUser();

  useEffect(() => {
    handleSearchClients();
  }, []);

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

  const handleSearchClients = async () => {
    // const data = await searchClients({ name: debouncedValue });
    const data = await searchClients({});

    try {
      if (data) {
        const mapped = await Promise.all(
          data.map(async (user: any) => {
            let classBookings: any[] = [];
            let signedUrl: string | undefined = "";
            let clientPackage = !!user.client_packages.length
              ? user.client_packages[0]
              : null;

            //if user has an avatar
            if (user.avatar_path) {
              // generate signed URL valid for 1 hour (3600s)
              const { data, error: urlError } = await supabase.storage
                .from("user-photos")
                .createSignedUrl(`${user?.avatar_path}`, 3600);

              if (urlError) {
                console.error("Error generating signed URL:", urlError);
                signedUrl = undefined;
              }

              signedUrl = data?.signedUrl;
            }

            //if user has bookings
            if (!!user.class_bookings.length) {
              classBookings = user.class_bookings.map((classBooking: any) => {
                return {
                  id: classBooking.id,
                  attendance: classBooking.attendance_status,
                  classDate: classBooking.class_date,

                  classDetails: {
                    id: classBooking.classes.id,
                    instructor: classBooking.classes.instructors.full_name,
                    startTime: classBooking.classes.start_time,
                    endTime: classBooking.classes.end_time,
                  },
                };
              });
            }

            if (clientPackage) {
              clientPackage = {
                status: clientPackage.status,
                packages: {
                  title: clientPackage.package_name,
                },
                packageCredits: clientPackage.package_credits,
                validityPeriod: clientPackage.validity_period,
                purchaseDate: clientPackage.purchase_date,
                expirationDate: clientPackage.expiration_date,
              };
            }

            return {
              ...user,
              clientPackage,
              key: user.id,
              avatar_url: signedUrl,
              bookingHistory: classBookings,
              credits: user?.user_credits?.[0]?.credits ?? 0,
            };
          })
        );

        setClients(mapped);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setSelectedRecord(null);
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setIsEditing(true);
  };

  const handleViewBookingHistory = (record: any) => {
    setSelectedRecord(record);
    setIsViewingHistory(true);
  };
  const handleCloseBookingHistory = (record: any) => {
    setSelectedRecord(record);
    setIsViewingHistory(false);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedRecord) {
        await Promise.all([
          updateUser({
            id: selectedRecord.id,
            values: omit(values, ["credits"]),
          }),
          updateUserCredits({
            userID: selectedRecord?.id as string,
            values: { credits: values.credits },
          }),
        ]);

        setIsEditing(false);
        setSelectedRecord(null);
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
                  viewBookingHistory={handleViewBookingHistory}
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
          maskClosable={false}
          placement="right"
          onClose={handleCloseModal}
          open={isEditing}
          width={"100%"}
          styles={{
            body: { paddingTop: 24 },
          }}
        >
          {isEditing && (
            <EditClientForm
              loading={updating}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              initialValues={selectedRecord}
              isEdit={!!selectedRecord}
            />
          )}
        </Drawer>
      ) : (
        <Drawer
          maskClosable={false}
          open={isEditing}
          width={"35%"}
          onClose={handleCloseModal}
          footer={null}
          styles={{
            body: { paddingTop: 10 },
          }}
        >
          <div className="pt-4">
            {isEditing && (
              <EditClientForm
                loading={updating}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                initialValues={selectedRecord}
                isEdit={!!selectedRecord}
              />
            )}
            {/* {isViewingHistory &&

            } */}
          </div>
        </Drawer>
      )}
      {isMobile ? (
        <Drawer
          title={"Booking History"}
          maskClosable={false}
          placement="right"
          onClose={handleCloseBookingHistory}
          open={isViewingHistory}
          width={"100%"}
          styles={{
            body: { paddingTop: 24 },
          }}
        >
          <UserBookingHistory
            bookingHistory={selectedRecord?.bookingHistory ?? []}
          />
        </Drawer>
      ) : (
        <Drawer
          title={"Booking History"}
          maskClosable={false}
          open={isViewingHistory}
          width={"35%"}
          onClose={handleCloseBookingHistory}
          // onCancel={handleCloseModal}
          footer={null}
          styles={{
            body: { paddingTop: 10 },
          }}
        >
          <Segmented options={["Bookings", "Payments"]} block />
          <div className="pt-4">
            <UserBookingHistory
              bookingHistory={selectedRecord?.bookingHistory ?? []}
            />
          </div>
        </Drawer>
      )}
    </AdminAuthenticatedLayout>
  );
}
