"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Button,
  Modal,
  Drawer,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import DatePickerCarousel from "@/components/ui/datepicker-carousel";
import AdminBookingTable from "@/components/ui/admin-booking-table";
import CreateClassForm from "@/components/forms/CreateClassForm";
import { formatTime } from "@/lib/utils";
import dayjs from "dayjs";
import { CreateClassProps } from "@/lib/props";

const { Title } = Typography;

let data: CreateClassProps[] = [
  {
    key: "1",
    instructor: "John Brown",
    start_time: formatTime(dayjs()),
    end_time: formatTime(dayjs()),
    slots: "5 / 10",
  },
  {
    key: "2",
    instructor: "Joe Black",
    start_time: formatTime(dayjs()),
    end_time: formatTime(dayjs()),
    slots: "5 / 10",
  },
  {
    key: "3",
    instructor: "Jim Green",
    start_time: formatTime(dayjs()),
    end_time: formatTime(dayjs()),
    slots: "5 / 10",
  },
  {
    key: "4",
    instructor: "Jim Red",
    start_time: formatTime(dayjs()),
    end_time: formatTime(dayjs()),
    slots: "5 / 10",
  },
];

export default function ClassManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CreateClassProps | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleSubmit = (values: any) => {
    console.log("Form values:", values);

    if (editingRecord) {
      const index = data.findIndex((item) => item.key === editingRecord.key);
      if (index !== -1) {
        const currentSlots = data[index].slots.split("/")[0].trim();
        data[index] = {
          ...data[index],
          instructor: values.instructor,
          start_time: values.time,
          end_time: values.time,
          slots: `${currentSlots} / ${values.slots}`,
        };
      }
    } else {
      data.push({
        key: (data.length + 1).toString(),
        instructor: values.instructor,
        start_time: values.time,
        end_time: values.time,
        slots: `0 / ${values.slots}`,
      });
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
          <DatePickerCarousel onDateSelect={(e) => console.log(e)} />
        </Row>

        <div>
          <Row className="mb-4 justify-end">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenModal}
              className={`bg-[#733AC6] hover:!bg-[#5B2CA8] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              Create
            </Button>
          </Row>
          <AdminBookingTable data={data} onEdit={handleEdit} />
        </div>
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
