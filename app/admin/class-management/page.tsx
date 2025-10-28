"use client";

import { useState, useEffect } from "react";
import { Row, Typography, Button, Modal, Drawer, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import DatePickerCarousel from "@/components/ui/datepicker-carousel";
import AdminBookingTable from "@/components/ui/admin-booking-table";
import CreateClassForm from "@/components/forms/CreateClassForm";
import dayjs, { Dayjs } from "dayjs";
import { CreateClassProps } from "@/lib/props";
import { IoMdPersonAdd } from "react-icons/io";
import ManualBookingForm from "@/components/forms/ManualBookingForm";
import { useClassManagement, useSearchUser } from "@/lib/api";

const { Title } = Typography;

let data: CreateClassProps[] = [
  {
    key: "1",
    instructor_id: "123494",
    instructor_name: "John Brown",
    start_time: dayjs(),
    end_time: dayjs(),
    slots: "5 / 10",
  },
  {
    key: "2",
    instructor_id: "123494",
    instructor_name: "Joe Black",
    start_time: dayjs(),
    end_time: dayjs(),
    slots: "5 / 10",
  },
  {
    key: "3",
    instructor_id: "123494",
    instructor_name: "Jim Green",
    start_time: dayjs(),
    end_time: dayjs(),
    slots: "5 / 10",
  },
  {
    key: "4",
    instructor_id: "123494",
    instructor_name: "Jim Red",
    start_time: dayjs(),
    end_time: dayjs(),
    slots: "5 / 10",
  },
];

export default function ClassManagementPage() {
  // const { createClass, loading } = useCreateClass();
  const { createClass, updateClass, fetchClasses, loading } =
    useClassManagement();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CreateClassProps | null>(
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
    if (selectedDate) {
      handleFetchClasses();
    }
  }, [selectedDate]);

  const handleFetchClasses = async () => {
    const data = await fetchClasses({ date: selectedDate as Dayjs });

    if (data) {
      const mapped = data?.map((item: any, index: number) => ({
        key: item.id,
        instructor_id: item.instructor_id,
        instructor_name: item.instructor_name,
        start_time: dayjs(item.start_time),
        end_time: dayjs(item.end_time),
        slots: `${item.taken_slots} / ${item.available_slots}`,
      }));

      setClasses(mapped);
    }

    console.log("fetched classes: ", data);
  };

  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: CreateClassProps) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };
  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const handleSubmit = async (values: any) => {
    if (editingRecord) {
      const index = classes.findIndex((item) => item.key === editingRecord.key);
      console.log("index :", index);
      if (index !== -1) {
        await updateClass({
          id: editingRecord.key,
          values: { ...values, class_date: selectedDate?.format("YYYY-MM-DD") },
        });

        handleFetchClasses();
        message.success("Class has been updated");
      }
    } else {
      // CREATE INSTRUCTOR MANAGEMENT FIRST
      console.log("values: ", values);

      const response = await createClass({
        values: { ...values, class_date: selectedDate?.format("YYYY-MM-DD") },
      });
      if (response) {
        handleFetchClasses();
        message.success("Class has been created!");
      }
    }

    setIsModalOpen(false);
    setEditingRecord(null);
  };

  return (
    <AdminAuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <Title level={2} className="!mb-2">
            Class Management
          </Title>
        </div>

        <Row className="wrap-none justify-center bg-transparent">
          <DatePickerCarousel onDateSelect={(e) => setSelectedDate(dayjs(e))} />
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
          />
        </div>
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
              onSubmit={handleSubmit}
              onCancel={handleCloseBookingModal}
              initialValues={editingRecord}
              isEdit={!!editingRecord}
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
                onSubmit={handleSubmit}
                onCancel={handleCloseBookingModal}
                initialValues={editingRecord}
                isEdit={!!editingRecord}
              />
            </div>
          </Modal>
        )}
        {isMobile ? (
          <Drawer
            title={editingRecord ? "Edit Class" : "Create New Class"}
            placement="right"
            onClose={handleCloseModal}
            open={isModalOpen}
            width={"100%"}
            styles={{
              body: { paddingTop: 24 },
            }}
          >
            <CreateClassForm
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              initialValues={editingRecord}
              isEdit={!!editingRecord}
            />
          </Drawer>
        ) : (
          <Modal
            centered
            title={editingRecord ? "Edit Class" : "Create New Class"}
            open={isModalOpen}
            onCancel={handleCloseModal}
            footer={null}
            width={600}
          >
            <div className="pt-4">
              <CreateClassForm
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
