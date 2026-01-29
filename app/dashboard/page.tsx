"use client";

import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Button,
  Tooltip,
  Modal,
  Drawer,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { useEffect, useState } from "react";
import {
  useClassManagement,
  useClientBookings,
  useManageImage,
} from "@/lib/api";
import { useAppSelector } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { User } from "lucide-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { isNotMoreThan24HoursAway } from "@/lib/utils";

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

const { Title, Text } = Typography;

export default function DashboardPage() {
  const router = useRouter();
  const { cancelClass, loading: cancellingClass } = useClassManagement();
  const { fetchClientBookings } = useClientBookings();
  const user = useAppSelector((state) => state.auth.user);

  const [isMobile, setIsMobile] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [openCancelModal, setOpenCancelModal] = useState<boolean>(false);
  const { fetchImage } = useManageImage();

  useEffect(() => {
    handleFetchBookings();
  }, [user]);

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

  const handleOpenCancelConfirmation = () => {
    setOpenCancelModal(true);
  };

  const handleCloseCancelConfirmation = () => {
    setOpenCancelModal(false);
  };

  const handleFetchBookings = async () => {
    if (user) {
      const bookings: any = await fetchClientBookings({
        userID: user?.id as string,
      });

      const now = dayjs();

      const validBookings = bookings.filter(
        (booking: any) =>
          booking.classes !== null && booking.attendance_status !== "cancelled",
      );
      if (!!validBookings.length) {
        const filtered = validBookings.filter((booking: any) =>
          dayjs(booking.classes.start_time).isSameOrAfter(now),
        );
        const mapped = await Promise.all(
          filtered.map(async (booking: any) => {
            let imageURL: any = null;
            // if (!booking.avatar_path) return booking; // skip if no avatar

            // generate signed URL valid for 1 hour (3600s)

            const signedURL = await fetchImage({
              avatarPath: booking.classes.instructors.user_profiles.avatar_path,
            });

            imageURL = signedURL;
            return {
              ...booking,
              avatar_url: imageURL,
              id: booking.id,
              bookerId: booking.booker_id,
              classId: booking.class_id,
              className: booking.classes.class_name,
              classStartTime: booking.classes.start_time,
              classEndTime: booking.classes.end_time,
              classDate: booking.class_date,
              instructorName: booking.classes.instructor_name,
              instructorAvatarPath: booking.classes.instructors.avatar_path,
            };
          }),
        );

        setUpcomingBookings(mapped);
      }
    }
  };

  const handleCancelClass = async () => {
    await cancelClass({
      id: selectedRecord.id,
      classID: selectedRecord.classes.id,
      takenSlots: selectedRecord.classes.taken_slots,
    });

    handleFetchBookings();
    handleCloseCancelConfirmation();
  };
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <Title level={2} className="!mb-2">
            Quick View
          </Title>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Total Credits"
                value={(user?.credits as number) ?? "Unlimited"}
                prefix={<CalendarOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1e293b", margin: 0, padding: 0 }}
              />
            </Card>
          </Col>
        </Row>

        <Col>
          <Title level={2} className="!mb-2">
            Upcoming Classes
          </Title>
          <Row gutter={[16, 16]}>
            {upcomingBookings &&
              upcomingBookings.map((data, idx) => {
                const notCancellable = isNotMoreThan24HoursAway(
                  dayjs(data.classes.start_time),
                );

                return (
                  <Col key={idx} xs={24} sm={12} md={8} lg={6} xl={6} xxl={6}>
                    <Card
                      hoverable={false}
                      onClick={() => setSelectedRecord(data)}
                      cover={
                        <div
                          style={{
                            height: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {data?.avatar_url === undefined && (
                            <User style={{ fontSize: 64, color: "#999" }} />
                          )}
                          {data?.avatar_url && (
                            <img
                              className="rounded-t-lg border"
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
                      className="border"
                      styles={{ actions: { paddingInline: "10px" } }}
                      actions={[
                        <Tooltip
                          title={
                            notCancellable &&
                            "Cannot cancel less than 24 hours from the class."
                          }
                        >
                          <Button
                            onClick={handleOpenCancelConfirmation}
                            disabled={notCancellable}
                            className={`w-full ${
                              !notCancellable &&
                              "!bg-red-400 hover:!bg-red-700 hover:!border-red-600 hover:!text-white"
                            } border-red-600 bg-red-200 text-white`}
                          >
                            Cancel
                          </Button>
                        </Tooltip>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <Row wrap={false} className="flex flex-col">
                            <Text className="text-[16px]">
                              {data.className}
                            </Text>
                            <Text className="text-[14px] font-normal">
                              with {data.instructorName}
                            </Text>
                          </Row>
                        }
                        description={
                          <Row wrap={false} className="flex flex-col">
                            <Text>
                              {dayjs(data.class_date).format("MMM DD (ddd)")}
                            </Text>
                            <Text>
                              {`${dayjs(data.classStartTime).format(
                                "hh:mm A",
                              )} to ${dayjs(data.classEndTime).format(
                                "hh:mm A",
                              )}`}
                            </Text>
                          </Row>
                        }
                      />
                    </Card>
                  </Col>
                );
              })}

            {!upcomingBookings?.length && (
              <Card title="No upcoming bookings" className="shadow-sm w-full">
                <Row className="w-full flex-col flex items-center justify-center">
                  <Button
                    onClick={() => router.push("/bookings")}
                    className={`bg-[#800020] hover:!bg-[#800020] !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03] h-[40px]`}
                  >
                    Book a Class
                  </Button>
                </Row>
              </Card>
            )}
          </Row>
        </Col>
      </div>

      {isMobile ? (
        <Drawer
          loading={cancellingClass}
          title={"Confirm Cancellation"}
          placement="right"
          onClose={handleCloseCancelConfirmation}
          open={openCancelModal}
          width={"100%"}
          styles={{
            body: { paddingTop: 24 },
          }}
        >
          <Row className="flex flex-col pt-4 gap-y-[15px]">
            <Row className="flex flex-col pt-4">
              <Text className="text-center font-normal text-[14px]">
                Are you sure you want to cancel this class?
              </Text>
              <Text className="text-center font-normal text-[14px]">
                Cancelling would mean you won&apos;t be able to book this class
                again.
              </Text>
            </Row>

            <Row className="gap-x-[10px]" justify={"end"}>
              <Button disabled={cancellingClass} loading={cancellingClass}>
                Close
              </Button>
              <Button
                disabled={cancellingClass}
                loading={cancellingClass}
                onClick={handleCancelClass}
                className={`!bg-red-700 hover:!border-red-600 hover:!text-white border-red-600 text-white`}
              >
                Confirm
              </Button>
            </Row>
          </Row>
        </Drawer>
      ) : (
        <Modal
          title={"Confirm Cancellation"}
          open={openCancelModal}
          onCancel={handleCloseCancelConfirmation}
          width={500}
          centered
          footer={
            <Row className="gap-x-[10px]" justify={"end"}>
              <Button disabled={cancellingClass} loading={cancellingClass}>
                Close
              </Button>
              <Button
                disabled={cancellingClass}
                loading={cancellingClass}
                onClick={handleCancelClass}
                className={`!bg-red-700 hover:!border-red-600 hover:!text-white border-red-600 text-white`}
              >
                Confirm
              </Button>
            </Row>
          }
        >
          <Row className="flex flex-col pt-4">
            <Text className="text-center font-normal text-[14px]">
              Are you sure you want to cancel this class?
            </Text>
            <Text className="text-center font-normal text-[14px]">
              Cancelling would mean you won&apos;t be able to book this class
              again.
            </Text>
          </Row>
        </Modal>
      )}
    </AuthenticatedLayout>
  );
}
