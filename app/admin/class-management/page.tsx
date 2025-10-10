"use client";

import { Card, Row, Col, Statistic, Typography, Button } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import DatePickerCarousel from "@/components/ui/datepicker-carousel";
import AdminBookingTable from "@/components/ui/admin-booking-table";

const { Title } = Typography;

export default function ClassManagementPage() {
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
              className={`bg-[#733AC6] hover:!bg-[#5B2CA8] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              Create
            </Button>
          </Row>
          <AdminBookingTable />
        </div>
        {/* <Card className="shadow-sm" title="Recent Bookings">
          <div className="text-center py-12 text-slate-500">
            <CalendarOutlined className="text-4xl mb-4" />
            <p>No bookings yet. Start by creating your first booking.</p>
          </div>
        </Card> */}
      </div>
    </AdminAuthenticatedLayout>
  );
}
