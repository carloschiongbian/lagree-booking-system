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
  Carousel,
} from "antd";
import { ImInfinite } from "react-icons/im";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DatePickerCarousel from "@/components/ui/datepicker-carousel";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LiaCoinsSolid } from "react-icons/lia";
import { useRouter } from "next/navigation";
import { useClassManagement, useManageCredits } from "@/lib/api";
import { calculateDuration } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/lib/hooks";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/features/authSlice";
import UserTermsAndConditions from "@/components/layout/UserTermsAndConditions";
import { ChevronRight, X } from "lucide-react";
import { useAppMessage } from "@/components/ui/message-popup";
import axios from "axios";

const { Title } = Typography;

const CAROUSEL_SLIDES = {
  TERMS: 0,
  BOOKING_DETAILS: 1,
};

export default function BookingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const carouselRef = useRef<any>(null);
  const user = useAppSelector((state) => state.auth.user);

  const { updateUserCredits } = useManageCredits();
  const { showMessage, contextHolder } = useAppMessage();
  const { fetchClasses, updateClass, bookClass, loading } =
    useClassManagement();

  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [carouselSlide, setCarouselSlide] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [delayedOverflow, setDelayedOverflow] = useState("hidden");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedOverflow(
        carouselSlide !== CAROUSEL_SLIDES.TERMS ? "hidden" : "auto"
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [carouselSlide]);
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
    if (selectedDate && user) {
      handleFetchClasses();
    }
  }, [selectedDate, user?.id]);

  const handleFetchClasses = async () => {
    const data = await fetchClasses({
      userId: user?.id,
      selectedDate: selectedDate as Dayjs,
    });

    if (data) {
      const mapped = await Promise.all(
        data.map(async (lagreeClass) => {
          let imageURL: any = null;
          // if (!user.avatar_path) return user; // skip if no avatar

          // generate signed URL valid for 1 hour (3600s)
          const { data, error: urlError } = await supabase.storage
            .from("user-photos")
            .createSignedUrl(
              `${lagreeClass.instructors.user_profiles.avatar_path}`,
              3600
            );

          if (urlError) {
            console.error("Error generating signed URL:", urlError);
            imageURL = null;
          }
          imageURL = data?.signedUrl;

          return {
            ...lagreeClass,
            key: lagreeClass.id,
            avatar_url: imageURL,
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
    console.log("item: ", item);
    setIsModalOpen(true);
    setSelectedRecord(item);
  };

  const handleCloseModal = () => {
    if (carouselSlide === CAROUSEL_SLIDES.TERMS) {
      carouselRef.current.next();
      setCarouselSlide(CAROUSEL_SLIDES.BOOKING_DETAILS);
      return;
    }

    setAcceptsTerms(false);
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleSendConfirmationEmail = async () => {
    const classDate = `${dayjs(selectedDate).format("MMMM")} ${dayjs(
      selectedDate
    ).format("DD")} ${dayjs(selectedDate).format("YYYY")}`;

    const classTime = dayjs(selectedRecord?.start_time).format("hh:mm A");

    const res = await axios.post("/api/send-email", {
      to: user?.email,
      instructor: selectedRecord.instructor_name,
      date: classDate,
      time: classTime,
      className: "Regular Class",
      emailType: "class_booking_confirmation",
    });

    const data = await res.data;
  };

  const handleBookClass = async () => {
    try {
      setIsSubmitting(true);
      if (user) {
        let promises;

        promises = [
          bookClass({
            classDate: dayjs(selectedDate).toISOString(),
            classId: selectedRecord.id,
            bookerId: user?.id as string,
            isWalkIn: false,
          }),
          updateClass({
            id: selectedRecord.id,
            values: {
              taken_slots: selectedRecord.taken_slots + 1,
            },
          }),
        ];

        if (user?.credits != null) {
          const updatedCredits = user.credits - 1;
          promises.push(
            updateUserCredits({
              userID: user.id as string,
              values: { credits: updatedCredits },
            })
          );

          dispatch(setUser({ ...user, credits: updatedCredits }));
        }

        // await Promise.all([...promises]);
        await Promise.all([...promises, handleSendConfirmationEmail()]);

        setIsSubmitting(false);
        handleCloseModal();
        showMessage({
          type: "success",
          content: "Successfully booked a class!",
        });
        handleFetchClasses();
      }
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
      showMessage({ type: "error", content: "Error while booking a class" });
    }
  };

  const handleScheduleAction = (item: any) => {
    if (user?.credits === 0) {
      router.push("/packages");
    } else {
      handleOpenModal(item);
    }
  };

  const renderActionButton = useMemo(
    () => (item: any) => {
      const isCancelled =
        item?.class_bookings?.[0]?.attendance_status === "cancelled";
      return (
        <>
          {!!item.class_bookings.length && (
            <Button
              type="primary"
              className={`${
                isCancelled
                  ? "bg-red-700 hover:!bg-red-700"
                  : "bg-[green] hover:!bg-[green]"
              } !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              {isCancelled ? "You Cancelled" : "Joined"}
            </Button>
          )}
          {!item.class_bookings.length && (
            <Button
              type="primary"
              disabled={
                user?.credits === 0
                  ? false
                  : item.taken_slots === item.available_slots
              }
              onClick={() => handleScheduleAction(item)}
              className={`bg-[#36013F] ${
                user?.credits === 0
                  ? "hover:!bg-[#36013F]"
                  : item.taken_slots === item.available_slots
                  ? ""
                  : "hover:!bg-[#36013F]"
              } !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              {user?.credits === 0 ? "Get Credits" : "Join"}
            </Button>
          )}
        </>
      );
    },
    [classes, user?.credits]
  );

  const handleShowTermsAndConditions = () => {
    setCarouselSlide(CAROUSEL_SLIDES.TERMS);
    carouselRef.current.goTo(CAROUSEL_SLIDES.TERMS);
  };

  const RenderClassList = useMemo(() => {
    return (
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={classes}
        locale={{
          emptyText: "A class hasn't been created for this day",
        }}
        renderItem={(item, index) => {
          const slotsRemaining = item.available_slots - item.taken_slots;
          return (
            <List.Item key={index} actions={[renderActionButton(item)]}>
              <Row className="wrap-none items-center gap-4">
                <Col className="flex flex-col items-center">
                  <Avatar
                    className="border-gray-500 border"
                    size={60}
                    src={item.avatar_url}
                  />
                  <p>
                    <span className="font-light">{item.instructor_name}</span>
                  </p>
                </Col>
                <Col>
                  <p>
                    <span className="font-semibold">
                      {`${dayjs(item.start_time).format("hh:mm")} ${dayjs(
                        item.start_time
                      ).format("A")}`}
                    </span>
                  </p>
                  <p>
                    {/* calc start and end time */}
                    <span className="font-light">
                      {calculateDuration(item.start_time, item.end_time)}
                    </span>
                  </p>
                  <p>
                    <span>{item.slots}</span>
                  </p>
                  <p>
                    <span
                      className={`font-bold ${
                        // calc available slots
                        slotsRemaining === 1 || slotsRemaining === 0
                          ? `text-red-500 font-semibold`
                          : ``
                      }`}
                    >
                      {slotsRemaining <= 0
                        ? "Full"
                        : slotsRemaining === 1
                        ? "Last Slot"
                        : `${slotsRemaining} slots left`}
                    </span>
                  </p>
                </Col>
              </Row>
            </List.Item>
          );
        }}
      />
    );
  }, [classes, loading]);

  return (
    <AuthenticatedLayout>
      {contextHolder}
      <div className="space-y-6">
        <Row className="flex flex-col wrap-none justify-center bg-transparent">
          <Col>
            <Row
              wrap={false}
              className="items-center"
              justify={"space-between"}
            >
              <p className="!mb-0 !pb-0 text-[24px] sm:text-[28px] md:text-[34px] xl:text-[42px] font-[400]">
                {`${dayjs().format("MMMM").toLowerCase()} ${dayjs().format(
                  "YYYY"
                )}`}
              </p>

              <Row
                wrap
                onClick={() => router.push("/credits")}
                className="cursor-pointer items-center gap-[5px] sm:gap-3 md:gap-[10px] text-[16px] sm:text-[18px] md:text-[20px] font-[400] bg-white rounded-lg py-2 px-3 shadow-sm border border-slate-300 md:w-auto"
              >
                {user?.credits && <LiaCoinsSolid size={24} />}
                {user?.credits === null && <ImInfinite />}

                <span className="flex flex-row flex-nowrap gap-x-[5px]">
                  <span>
                    {user?.credits !== null &&
                      user?.credits !== 0 &&
                      user?.credits}
                  </span>
                  <span>
                    {user?.credits && user?.credits >= 0 && user?.credits !== 1
                      ? "credits"
                      : user?.credits === 1
                      ? "credit"
                      : "credits"}
                  </span>
                </span>
              </Row>
            </Row>
            <Divider className="md:m-0 pb-[10px]" />
            <DatePickerCarousel
              isAdmin={false}
              onDateSelect={(e) => setSelectedDate(dayjs(e))}
            />
            <Row justify={"center"}>
              <span className="text-red-400">
                Please note that instructor assignments are subject to change
                without prior notice.
              </span>
            </Row>
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
              {RenderClassList}
            </div>
          </Card>
        </Row>
      </div>

      <Drawer
        keyboard={false}
        maskClosable={false}
        placement="right"
        title={carouselSlide === CAROUSEL_SLIDES.TERMS && "Back to Agreement"}
        closeIcon={carouselSlide === CAROUSEL_SLIDES.TERMS && <ChevronRight />}
        closable={!isSubmitting}
        onClose={handleCloseModal}
        open={isModalOpen}
        width={isMobile ? "100%" : "30%"}
        styles={{
          body: {
            paddingTop: 24,
            overflow: delayedOverflow,
          },
        }}
      >
        <div className="flex-1 overflow-hidden">
          <Carousel
            ref={carouselRef}
            autoplay={false}
            infinite={false}
            dots={false}
            initialSlide={1}
            className="h-full"
          >
            <div className="h-full overflow-y-auto">
              <UserTermsAndConditions />
            </div>
            <Row className="flex flex-col items-center">
              <Row className="w-full justify-center">
                <Avatar
                  className="border-gray-500 border w-full"
                  size={200}
                  src={selectedRecord?.avatar_url}
                />
              </Row>
              <Divider />
              <Col className="mb-[20px] items-start w-full">
                <Title>
                  {`${dayjs(selectedDate).format("MMMM")} ${dayjs(
                    selectedDate
                  ).format("DD")} ${dayjs(selectedDate).format("YYYY")}`}
                </Title>
                <Title level={5}>
                  Class with{" "}
                  <span className="text-red-400">
                    {selectedRecord?.instructor_name}
                  </span>{" "}
                  <span className="text-red-400">{selectedRecord?.time}</span>{" "}
                  on{" "}
                  <span className="text-red-400">
                    {dayjs(selectedRecord?.date).format("dddd")}
                  </span>
                </Title>
              </Col>
              <Row justify={"start"} className="w-full mb-[10px]">
                <Checkbox onChange={handleAcceptTermsChange}>
                  I have read the
                </Checkbox>
                <span
                  onClick={handleShowTermsAndConditions}
                  className="text-blue-400 cursor-pointer"
                >
                  Terms and Conditions
                </span>
              </Row>

              <Button
                /**
                 * temporary button disable since payment
                 * is not integrated yet
                 * to prevent multiple clicking
                 */
                loading={loading || isSubmitting}
                onClick={handleBookClass}
                disabled={!acceptsTerms || loading || isSubmitting}
                className={`${
                  acceptsTerms && "hover:!bg-[#36013F] hover:scale-[1.03]"
                } ${
                  !acceptsTerms || loading || isSubmitting
                    ? "!bg-[gray]"
                    : "!bg-[#36013F]"
                } !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 w-full h-[40px]`}
              >
                Book
              </Button>
            </Row>
          </Carousel>
        </div>
      </Drawer>
    </AuthenticatedLayout>
  );
}
