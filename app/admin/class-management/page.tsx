"use client";

import { useState, useEffect } from "react";
import {
  Row,
  Button,
  Modal,
  Drawer,
  message,
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
    createClass,
    updateClass,
    fetchClasses,
    markAttendance,
    rebookAttendee,
    fetchClassAttendees,
  } = useClassManagement();
  const [classes, setClasses] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);

  const [isMobile, setIsMobile] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
    const data = await fetchClasses({
      selectedDate: selectedDate as Dayjs,
      isAdmin: true,
    });

    if (data) {
      const mapped = data?.map((item: any, index: number) => ({
        key: index,
        id: item.id,
        instructor_id: item.instructor_id,
        instructor_name: item.instructor_name,
        start_time: dayjs(item.start_time),
        end_time: dayjs(item.end_time),
        slots: `${item.taken_slots} / ${item.available_slots}`,
      }));

      setClasses(mapped);
    }
  };

  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  const handleOpenModal = () => {
    setSelectedRecord(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (record: CreateClassProps) => {
    setSelectedRecord(record);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
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
        attendeeName: classBookings.user_profiles.full_name,
      };
    });

    setSelectedRecord(record);
    setViewModalOpen(true);
    console.log("mapped: ", mapped);
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
        message.success("Class has been updated");
      } else {
        // CREATE INSTRUCTOR MANAGEMENT FIRST
        try {
          await createClass({
            values: {
              ...values,
              class_date: selectedDate?.toISOString(),
            },
          });

          handleFetchClasses();
          message.success("Class has been created!");
        } catch (error) {
          message.error("Failed to create class.");
        }
      }

      setIsFormModalOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      message.error("An error occurred. Please try again.");
    }
  };

  const handleChange = async ({
    bookingID,
    status,
  }: {
    bookingID: string;
    status: string;
  }) => {
    console.log(`selected ${status}`);

    const response = await markAttendance({ bookingID, status });
    console.log("response: ", response);
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

          {/* Empty State for 0 attendees */}
          {attendees.length === 0 && (
            <Row wrap={false} className="justify-center">
              <span className="font-semibold p-4">
                Nobody has booked this class yet
              </span>
            </Row>
          )}

          {/* Non-empty state */}
          <div
            style={{
              overflowY: "auto",
              maxHeight: "30vh",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE and Edge
            }}
            className="overflow-y-auto"
          >
            <List
              itemLayout="horizontal"
              dataSource={attendees}
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
                    disabled={item?.attendanceStatus === "cancelled"}
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

  return (
    <AdminAuthenticatedLayout>
      <div className="space-y-6">
        <p className="!mb-0 !pb-0 text-[42px] font-[400]">
          {`${dayjs().format("MMMM").toLowerCase()} ${dayjs().format("YYYY")}`}
        </p>
        <Divider className="m-0 pb-[10px]" />
        <Row className="wrap-none justify-center bg-transparent !mt-0">
          <DatePickerCarousel
            isAdmin={true}
            onDateSelect={(e) => setSelectedDate(dayjs(e))}
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
              Create
            </Button>
            {/* <Button
              type="primary"
              icon={<HiOutlineSwitchHorizontal />}
              onClick={handleOpenModal}
              className={`bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              Rebook Attendee
            </Button> */}
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
              onSubmit={handleSubmit}
              onCancel={handleCloseBookingModal}
              initialValues={selectedRecord}
              isEdit={!!selectedRecord}
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
                onSubmit={handleSubmit}
                onCancel={handleCloseBookingModal}
                initialValues={selectedRecord}
                isEdit={!!selectedRecord}
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
      </div>
    </AdminAuthenticatedLayout>
  );
}
