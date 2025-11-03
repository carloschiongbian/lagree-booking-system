"use client";

import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  List,
  Button,
  Divider,
  Drawer,
  Checkbox,
} from "antd";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DatePickerCarousel from "@/components/ui/datepicker-carousel";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { LiaCoinsSolid } from "react-icons/lia";
import { useRouter } from "next/navigation";
import { useClassManagement } from "@/lib/api";
import { calculateDuration } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/lib/hooks";

const { Title, Text } = Typography;

export default function BookingsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { fetchClasses, bookClass, loading } = useClassManagement();
  const [classes, setClasses] = useState<any[]>([]);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(5);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

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
    if (selectedDate) {
      handleFetchClasses();
    }
  }, [selectedDate]);

  const handleFetchClasses = async () => {
    const data = await fetchClasses({ selectedDate: selectedDate as Dayjs });

    if (data) {
      const mapped = await Promise.all(
        data.map(async (lagreeClass) => {
          // if (!user.avatar_path) return user; // skip if no avatar

          // generate signed URL valid for 1 hour (3600s)
          const { data, error: urlError } = await supabase.storage
            .from("user-photos")
            .createSignedUrl(`${lagreeClass.instructors.avatar_path}`, 3600);

          if (urlError) {
            console.error("Error generating signed URL:", urlError);
          }

          return {
            ...lagreeClass,
            key: lagreeClass.id,
            avatar_url: urlError ? null : data?.signedUrl,
            instructor_id: lagreeClass.instructor_id,
            instructor_name: lagreeClass.instructor_name,
            start_time: dayjs(lagreeClass.start_time),
            end_time: dayjs(lagreeClass.end_time),
            available_slots: lagreeClass.available_slots,
            taken_slots: lagreeClass.taken_slots,
            slots: `${lagreeClass.taken_slots} / ${lagreeClass.available_slots}`,
          };
        })
      );

      setClasses(mapped);
    }
  };

  const handleAcceptTermsChange = (e: any) => {
    setAcceptsTerms(e.target.checked);
  };
  const handleOpenModal = (item: any) => {
    setIsModalOpen(true);
    setSelectedRecord(item);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleBookClass = async () => {
    if (user) {
      await bookClass({
        classId: selectedRecord.id,
        bookerId: user?.id as string,
      });
    }
  };

  const renderActionButton = useMemo(
    () => (item: any) =>
      (
        <>
          {!!item.class_bookings.length && (
            <Button
              type="primary"
              className={`bg-[green] hover:!bg-[green] !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              Joined
            </Button>
          )}
          {!item.class_bookings.length && (
            <Button
              type="primary"
              disabled={userCredits === 0 ? false : item.available === 0}
              onClick={() => {
                if (userCredits === 0) {
                  router.push("/credits");
                } else {
                  handleOpenModal(item);
                }
              }}
              className={`bg-[#36013F] ${
                userCredits === 0
                  ? "hover:!bg-[#36013F]"
                  : item.available === 0
                  ? ""
                  : "hover:!bg-[#36013F]"
              } !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              {userCredits === 0 ? "Get Tokens" : "Join"}
            </Button>
          )}
        </>
      ),
    [userCredits]
  );

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <Row className="flex flex-col wrap-none justify-center bg-transparent">
          <Col>
            <Row
              wrap={false}
              className="items-center"
              justify={"space-between"}
            >
              <p className="!mb-0 !pb-0 text-[42px] font-[400]">
                {`${dayjs().format("MMMM").toLowerCase()} ${dayjs().format(
                  "YYYY"
                )}`}
              </p>

              <Row
                wrap={false}
                className="cursor-pointer items-center gap-[10px] text-[20px] font-[400] bg-white rounded-lg py-[7px] px-[10px] shadow-sm border border-slate-300"
              >
                <LiaCoinsSolid size={30} />
                <span>
                  <span className="text-red-400">{userCredits} </span>
                  {userCredits >= 0 && userCredits !== 1
                    ? "credits"
                    : userCredits === 1
                    ? "credit"
                    : "credits"}
                </span>
              </Row>
            </Row>
            <Divider className="m-0 pb-[10px]" />
            <DatePickerCarousel
              isAdmin={false}
              onDateSelect={(e) => setSelectedDate(dayjs(e))}
            />
          </Col>
        </Row>

        <Row wrap={false} className="w-full gap-x-[20px] items-start">
          <Card className="shadow-sm w-full">
            <div
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              className="max-h-[500px] overflow-y-auto"
            >
              <List
                itemLayout="horizontal"
                dataSource={classes}
                renderItem={(item, index) => (
                  <List.Item key={index} actions={[renderActionButton(item)]}>
                    <Row className="wrap-none items-center gap-4">
                      <Col className="flex flex-col items-center">
                        <Avatar
                          className="border-gray-500 border"
                          size={60}
                          src={item.avatar_url}
                        />
                        <p>
                          <span className="font-light">
                            {item.instructor_name}
                          </span>
                        </p>
                      </Col>
                      <Col>
                        <p>
                          <span className="font-semibold">
                            {dayjs(item.start_time).format("hh:mm")}
                          </span>
                        </p>
                        <p>
                          {/* calc start and end time */}
                          <span className="font-light">
                            {calculateDuration(item.start_time, item.end_time)}
                          </span>
                        </p>
                        <p>
                          <span
                            className={`${
                              // calc available slots
                              item.available_slots === 1 ||
                              item.available_slots === 0
                                ? `text-red-500 font-semibold`
                                : ``
                            }`}
                          >
                            {item.available_slots <= 0
                              ? "Full"
                              : item.available_slots === 1
                              ? "Last Slot"
                              : `${item.slots} slots left`}
                          </span>
                        </p>
                      </Col>
                    </Row>
                  </List.Item>
                )}
              />
            </div>

            {/* {classes.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <CalendarOutlined className="text-4xl mb-4" />
                <p>No bookings yet. Start by creating your first booking.</p>
              </div>
            )} */}
          </Card>
        </Row>
      </div>

      <Drawer
        placement="right"
        onClose={handleCloseModal}
        open={isModalOpen}
        width={isMobile ? "100%" : "30%"}
        styles={{
          body: { paddingTop: 24 },
        }}
      >
        <Col className="flex flex-col items-center">
          <Avatar
            className="border-gray-500 border w-full"
            size={200}
            src={selectedRecord?.avatar_url}
          />
          <Divider />
          <Col className="mb-[20px] items-start w-full">
            <Title>
              {`${dayjs(selectedDate).format("MMMM")} ${dayjs(
                selectedDate
              ).format("d")} ${dayjs(selectedDate).format("YYYY")}`}
            </Title>
            <Title level={5}>
              Class with{" "}
              <span className="text-red-400">
                {selectedRecord?.instructor_name}
              </span>{" "}
              <span className="text-red-400">{selectedRecord?.time}</span> on{" "}
              <span className="text-red-400">
                {dayjs(selectedRecord?.date).format("dddd")}
              </span>
            </Title>
          </Col>
          <Row justify={"start"} className="w-full mb-[10px]">
            <Checkbox onChange={handleAcceptTermsChange}>
              Accept Terms and Conditions
            </Checkbox>
          </Row>
          <Button
            loading={loading}
            onClick={handleBookClass}
            disabled={!acceptsTerms || loading}
            className={`bg-[#36013F] ${
              acceptsTerms ? "hover:!bg-[#36013F]" : ""
            } !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03] w-full h-[40px]`}
          >
            Book
          </Button>
        </Col>
      </Drawer>
    </AuthenticatedLayout>
  );
}
