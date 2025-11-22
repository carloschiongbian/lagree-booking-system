"use client";

import { useState, useEffect } from "react";
import {
  Row,
  Button,
  Modal,
  Drawer,
  Divider,
  Col,
  Typography,
  List,
  Select,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import DatePickerCarousel from "@/components/ui/datepicker-carousel";
import AdminBookingTable from "@/components/ui/admin-booking-table";
import CreateClassForm from "@/components/forms/CreateClassForm";
import dayjs, { Dayjs } from "dayjs";
import { CreateClassProps } from "@/lib/props";
import { IoMdPersonAdd } from "react-icons/io";
import ManualBookingForm from "@/components/forms/ManualBookingForm";
import { useClassManagement } from "@/lib/api";
import { formatTime } from "@/lib/utils";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import utc from "dayjs/plugin/utc";
import RebookAttendeeForm from "@/components/forms/RebookAttendeeForm";
import { useAppSelector } from "@/lib/hooks";
import { useDispatch } from "react-redux";
import { setClickedDashboardDate } from "@/lib/features/paramSlice";
import { useAppMessage } from "@/components/ui/message-popup";

dayjs.extend(utc);

const { Text } = Typography;

interface ClassBooking {
  id: string;
  created_at: string;
  booker_id: string;
  class_id: string;
  attendance_status: string | null;
  class_date: string;
  user_profiles: {
    full_name: string;
  };
  attendanceStatus: string | null;
  attendeeName: string;
}

export default function ClassManagementPage() {
  const {
    loading,
    bookClass,
    deleteClass,
    createClass,
    updateClass,
    fetchClasses,
    markAttendance,
    rebookAttendee,
    fetchClassAttendees,
  } = useClassManagement();
  const dispatch = useDispatch();
  const { showMessage, contextHolder } = useAppMessage();
  const param = useAppSelector((state) => state.param);
  const [classes, setClasses] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [fullAttendeeListToday, setFullAttendeeListToday] = useState<any[]>([]);

  const [isMobile, setIsMobile] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isRebookModalOpen, setIsRebookModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [cannotRebook, setCannotRebook] = useState<boolean>(false);

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
    try {
      let dateQuery = selectedDate;
      if (param?.clickedDashboardDate) {
        dateQuery = dayjs(param?.clickedDashboardDate);
      }

      const data = await fetchClasses({
        selectedDate: dateQuery as Dayjs,
        isAdmin: true,
      });

      if (data) {
        const mapped = data?.map((item: any, index: number) => {
          return {
            key: index,
            id: item.id,
            instructor_id: item.instructor_id,
            instructor_name: item.instructor_name,
            start_time: dayjs(item.start_time),
            end_time: dayjs(item.end_time),
            slots: `${item.taken_slots} / ${item.available_slots}`,
            taken_slots: item.taken_slots,
            available_slots: item.available_slots,
          };
        });

        const allBookings = data.flatMap((cls) =>
          cls.class_bookings.map((booking: any) => ({
            classID: cls.id,
            value: booking.booker_id,
            label: booking.user_profiles
              ? booking.user_profiles.full_name
              : `${booking.walk_in_first_name} ${booking.walk_in_last_name}`,
            class_id: cls.id,
            class_name: cls.instructor_name,
            start_time: cls.start_time,
            end_time: cls.end_time,
            taken_slots: cls.taken_slots,
            available_slots: cls.available_slots,
            bookingID: booking.id,
          }))
        );

        setAllBookings(allBookings);

        const grouped = allBookings.reduce((acc, booking) => {
          if (!acc[booking.value]) {
            acc[booking.value] = {
              bookingID: booking.bookingID,
              classID: booking.classID,
              value: booking.value,
              label: booking.label,
              originalClasses: [
                {
                  value: booking.class_id,
                  label: `${booking.class_name} ${dayjs(
                    booking.start_time
                  ).format("hh:mm A")} - ${dayjs(booking.end_time).format(
                    "hh:mm A"
                  )}`,
                  takenSlots: booking.taken_slots,
                  availableSlots: booking.available_slots,
                  bookingID: booking.bookingID,
                  startTime: booking.start_time,
                },
              ],
            };
          } else {
            acc[booking.value].originalClasses.push({
              bookingID: booking.bookingID,
              value: booking.class_id,
              label: `${booking.class_name} ${dayjs(booking.start_time).format(
                "HH:mm A"
              )} - ${dayjs(booking.end_time).format("HH:mm A")}`,
              takenSlots: booking.taken_slots,
              availableSlots: booking.available_slots,
              startTime: booking.start_time,
            });
          }
          return acc;
        }, {} as Record<string, any>);

        const result = Object.values(grouped);

        setFullAttendeeListToday(result);
        setClasses(mapped);
      }

      if (param.clickedDashboardDate) {
        dispatch(setClickedDashboardDate(null));
      }
    } catch (error) {
      showMessage({
        type: "error",
        content: "Error fetching classes. Please try refreshing your browser",
      });
    }
  };

  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  const handleOpenModal = () => {
    setSelectedRecord(null);
    setIsFormModalOpen(true);
  };

  const handleOpenRebookModal = () => {
    // setSelectedRecord(null);
    setIsRebookModalOpen(true);
  };

  const handleEdit = (record: CreateClassProps) => {
    setSelectedRecord(record);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedRecord(null);
  };

  const handleCloseRebookModal = () => {
    setIsRebookModalOpen(false);
    setSelectedRecord(null);
  };
  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const handleView = async (record: CreateClassProps) => {
    const response = await fetchClassAttendees({
      classID: record.id as string,
    });

    const mapped = response?.map((classBookings) => {
      return {
        ...selectedRecord,
        ...classBookings,
        attendanceStatus: classBookings.attendance_status,
        attendeeName: classBookings.user_profiles
          ? classBookings.user_profiles.full_name
          : `${classBookings.walk_in_first_name} ${classBookings.walk_in_last_name}`,
      };
    });

    setSelectedRecord(record);
    setViewModalOpen(true);
    setAttendees(mapped as []);
  };

  const handleCloseView = () => {
    setAttendees([]);
    setViewModalOpen(false);
    setSelectedRecord(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedRecord) {
        await updateClass({
          id: selectedRecord.id as string,
          values: { ...values, class_date: selectedDate?.toISOString() },
        });

        handleFetchClasses();
        showMessage({ type: "success", content: "Class has been updated!" });
      } else {
        try {
          await createClass({
            values: {
              ...values,
              class_date: selectedDate?.toISOString(),
            },
          });

          handleFetchClasses();
          showMessage({ type: "success", content: "Class has been created!" });
        } catch (error) {
          showMessage({ type: "error", content: "Failed to create class" });
        }
      }

      setIsFormModalOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      showMessage({
        type: "error",
        content: "Error modifying class. Please try again",
      });
    }
  };

  const handleManualBook = async (values: any) => {
    try {
      let promises = [
        bookClass({
          classDate: values.classDate,
          classId: values.class_id,
          walkInFirstName: values.first_name,
          walkInLastName: values.last_name,
          walkInClientEmail: values.walk_in_client_email,
          walkInClientContactNumber: values.walk_in_client_contact_number,
          isWalkIn: true,
        }),
        updateClass({
          id: values.class_id,
          values: {
            taken_slots: values.taken_slots + 1,
          },
        }),
      ];

      await Promise.all([...promises]);
      handleCloseBookingModal();

      showMessage({
        type: "success",
        content: "Successfully created manual booking",
      });
    } catch (error) {
      showMessage({ type: "error", content: "Error in manual booking" });
    }
  };

  const handleRebookAttendee = async ({
    originalClass,
    newClassID,
    bookerName,
  }: {
    originalClass: string;
    newClassID: string;
    bookerName: string;
  }) => {
    const originalBookingRecord = allBookings.find(
      (item: any) => item.classID === originalClass && item.label === bookerName
    );

    const originalClassRecord = classes.find(
      (item: any) => item.id === originalClass
    );

    const newClassRecord = classes.find((item: any) => item.id === newClassID);

    await rebookAttendee({
      oldTakenSlots: originalClassRecord.taken_slots,
      oldClassID: originalClassRecord.id,
      bookingID: originalBookingRecord.bookingID,
      newClassID: newClassID,
      newTakenSlots: newClassRecord.taken_slots,
    });

    handleFetchClasses();
    handleCloseRebookModal();
  };

  const handleChange = async ({
    bookingID,
    status,
  }: {
    bookingID: string;
    status: string;
  }) => {
    try {
      await markAttendance({ bookingID, status });

      showMessage({ type: "success", content: "Marked Attendance" });
    } catch (error) {
      showMessage({ type: "error", content: "Error marking attendance" });
    }
  };

  const RenderViewClass = () => {
    return (
      <Col className="flex flex-col pt-0 space-y-4">
        <Row wrap={false} className="justify-between">
          <Text className="!mt-[10px]">
            <span className="font-semibold">Instructor:</span>{" "}
            {selectedRecord?.instructor_name}
          </Text>
          <Text className="!mt-[10px]">
            <span className="font-semibold">Time:</span>{" "}
            {`${formatTime(dayjs(selectedRecord?.start_time))} - ${formatTime(
              dayjs(selectedRecord?.end_time)
            )}`}
          </Text>
        </Row>

        <Divider />

        <Col>
          <div className="mb-[15px]">
            <span className="font-semibold">Attendees</span>
          </div>

          <div
            style={{
              overflowY: "auto",
              maxHeight: "30vh",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            className="overflow-y-auto"
          >
            <List
              itemLayout="horizontal"
              dataSource={attendees}
              locale={{ emptyText: "Nobody has booked this class yet" }}
              loading={loading}
              renderItem={(item, index) => (
                <Row
                  key={index}
                  wrap={false}
                  className={`${
                    attendees.length > 1 && "border-b"
                  } py-3 justify-between`}
                >
                  <List.Item.Meta
                    title={item.attendeeName}
                    className="flex items-center"
                  />

                  <Select
                    disabled={
                      item?.attendanceStatus === "cancelled" || cannotRebook
                    }
                    defaultValue={item?.attendanceStatus}
                    placeholder="Status"
                    className="!outline-none"
                    style={{ width: 120 }}
                    onChange={(e) =>
                      handleChange({ bookingID: item.id, status: e })
                    }
                    options={[
                      { value: "no-show", label: "No Show" },
                      { value: "attended", label: "Attended" },
                      {
                        value: "cancelled",
                        label: "Cancelled",
                        disabled: true,
                      },
                    ]}
                  />
                </Row>
              )}
            />
          </div>
        </Col>
      </Col>
    );
  };

  const handleSelectedDateChange = (date: any) => {
    if (param.clickedDashboardDate) {
      setSelectedDate(dayjs(param.clickedDashboardDate));
      setCannotRebook(
        dayjs(param.clickedDashboardDate).isBefore(dayjs().subtract(1, "day"))
      );
    } else {
      setSelectedDate(dayjs(date));
      setCannotRebook(dayjs(date).isBefore(dayjs().subtract(1, "day")));
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteClass({ id: id as string });

      showMessage({
        type: "success",
        content: "Successfully deleted the class!",
      });

      handleFetchClasses();
    } catch (error) {
      showMessage({ type: "error", content: "Failed to delete the class" });
    }
  };

  return (
    <AdminAuthenticatedLayout>
      {contextHolder}
      <div className="space-y-6">
        <p className="!mb-0 !pb-0 text-[42px] font-[400]">
          {`${dayjs().format("MMMM").toLowerCase()} ${dayjs().format("YYYY")}`}
        </p>
        <Divider className="m-0 pb-[10px]" />
        <Row className="wrap-none justify-center bg-transparent !mt-0">
          <DatePickerCarousel
            isAdmin={true}
            initialDate={
              param.clickedDashboardDate
                ? dayjs(param.clickedDashboardDate)
                : undefined
            }
            onDateSelect={handleSelectedDateChange}
          />
        </Row>

        <div>
          <Row className="mb-4 gap-2 justify-end">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenModal}
              className={`bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              Create a Class
            </Button>
            <Button
              disabled={
                cannotRebook || !classes?.length || !allBookings?.length
              }
              type="primary"
              icon={<HiOutlineSwitchHorizontal />}
              onClick={handleOpenRebookModal}
              className={`bg-[#36013F] ${
                !!allBookings?.length &&
                !!classes?.length &&
                !cannotRebook &&
                "hover:!bg-[#36013F]"
              } !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              Rebook Attendee
            </Button>
            <Button
              type="primary"
              icon={<IoMdPersonAdd />}
              onClick={handleOpenBookingModal}
              className={`bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              Manual Booking
            </Button>
          </Row>
          <AdminBookingTable
            loading={loading}
            data={[...classes]}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleConfirmDelete}
          />
        </div>
        {/* Manual Booking */}
        {isMobile ? (
          <Drawer
            title={"Manual Booking"}
            placement="right"
            onClose={handleCloseBookingModal}
            open={isBookingModalOpen}
            width={"100%"}
            styles={{
              body: { paddingTop: 24 },
            }}
          >
            <ManualBookingForm
              classes={classes}
              selectedDate={selectedDate}
              onSubmit={handleManualBook}
              onCancel={handleCloseBookingModal}
              initialValues={selectedRecord}
              loading={loading}
              clearSignal={isBookingModalOpen}
            />
          </Drawer>
        ) : (
          <Modal
            title={"Manual Booking"}
            open={isBookingModalOpen}
            onCancel={handleCloseBookingModal}
            footer={null}
            width={600}
          >
            <div className="pt-4">
              <ManualBookingForm
                classes={classes}
                selectedDate={selectedDate}
                onSubmit={handleManualBook}
                onCancel={handleCloseBookingModal}
                initialValues={selectedRecord}
                loading={loading}
                clearSignal={isBookingModalOpen}
              />
            </div>
          </Modal>
        )}

        {/* Class form modal */}
        {isMobile ? (
          <Drawer
            title={selectedRecord ? "Edit Class" : "Create New Class"}
            placement="right"
            onClose={handleCloseModal}
            open={isFormModalOpen}
            width={"100%"}
            styles={{
              body: { paddingTop: 24 },
            }}
          >
            <CreateClassForm
              loading={loading}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              initialValues={selectedRecord}
              isEdit={!!selectedRecord}
            />
          </Drawer>
        ) : (
          <Modal
            title={selectedRecord ? "Edit Class" : "Create New Class"}
            open={isFormModalOpen}
            onCancel={handleCloseModal}
            footer={null}
            width={600}
          >
            <div className="pt-4">
              <CreateClassForm
                loading={loading}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                initialValues={selectedRecord}
                isEdit={!!selectedRecord}
              />
            </div>
          </Modal>
        )}

        {/* View class details */}
        {isMobile ? (
          <Drawer
            loading={loading}
            title="View Class Details"
            placement="right"
            onClose={handleCloseView}
            open={viewModalOpen}
            width="100%"
            maskClosable={false}
            styles={{
              body: { paddingTop: 24 },
            }}
          >
            {RenderViewClass()}
          </Drawer>
        ) : (
          <Modal
            loading={loading}
            title="View Class Details"
            open={viewModalOpen}
            onCancel={handleCloseView}
            footer={null}
            width={600}
            maskClosable={false}
          >
            {RenderViewClass()}
          </Modal>
        )}

        {/* Rebook Modal */}
        {isMobile ? (
          <Drawer
            keyboard={false}
            closable={false}
            title="Rebook Attendee"
            placement="right"
            onClose={handleCloseRebookModal}
            open={isRebookModalOpen}
            maskClosable={false}
            width="100%"
            styles={{
              body: { paddingTop: 24 },
            }}
          >
            <RebookAttendeeForm
              onSubmit={(e) => handleRebookAttendee(e)}
              loading={loading}
              onCancel={handleCloseRebookModal}
              attendees={fullAttendeeListToday}
              classes={classes}
              clearSignal={isRebookModalOpen}
            />
          </Drawer>
        ) : (
          <Modal
            keyboard={false}
            closable={false}
            title="Rebook Attendee"
            open={isRebookModalOpen}
            onCancel={handleCloseRebookModal}
            width={600}
            maskClosable={false}
            footer={null}
          >
            <RebookAttendeeForm
              onSubmit={(e) => handleRebookAttendee(e)}
              loading={loading}
              onCancel={handleCloseRebookModal}
              attendees={fullAttendeeListToday}
              classes={classes}
              clearSignal={isRebookModalOpen}
            />
          </Modal>
        )}
      </div>
    </AdminAuthenticatedLayout>
  );
}
