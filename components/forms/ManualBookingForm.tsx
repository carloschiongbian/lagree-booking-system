"use client";

import {
  Form,
  Select,
  TimePicker,
  InputNumber,
  Button,
  Row,
  Col,
  Input,
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { CreateClassProps } from "@/lib/props";
import { MdOutlineSchedule } from "react-icons/md";
import { useSearchUser } from "@/lib/api";

interface CreateClassFormProps {
  selectedDate?: Dayjs;
  classes: any[];
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: CreateClassProps | null;
  clearSignal?: boolean;
}

export default function ManualBookingForm({
  selectedDate,
  classes,
  onSubmit,
  onCancel,
  loading = false,
  initialValues = null,
  clearSignal,
}: CreateClassFormProps) {
  const [form] = Form.useForm();
  const [schedules, setSchedules] = useState<any>([]);

  useEffect(() => {
    handleParseClasses();
  }, [selectedDate]);

  useEffect(() => {
    form.resetFields();
  }, [onCancel]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        instructor: initialValues.instructor_id,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleParseClasses = async () => {
    const mapped = classes.map((cls, key) => {
      return {
        value: cls.id,
        label: `${cls.instructor_name} (${dayjs(cls.start_time).format(
          "hh:mm A"
        )} - ${dayjs(cls.end_time).format("hh:mm A")})`,
        id: cls.instructor_id,
        key: key,
        takenSlots: cls.taken_slots,
      };
    });
    setSchedules(mapped);
  };

  const handleFinish = (values: any) => {
    const found = schedules.find(
      (item: any) => item.value === values.class_schedule
    );
    const formattedValues = {
      ...values,
      taken_slots: found.takenSlots,
      class_id: values.class_schedule,
      class_date: selectedDate,
    };
    onSubmit(formattedValues);
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      requiredMark="optional"
      className="w-full"
    >
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={24}>
          <Form.Item
            name="class_schedule"
            label="Class Schedule"
            rules={[
              {
                required: true,
                message: "Please select a class schedule",
              },
            ]}
          >
            <Select
              allowClear
              placeholder="Select a class schedule"
              suffixIcon={<MdOutlineSchedule className="text-slate-400" />}
              options={schedules}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="First Name"
            name="first_name"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="Last Name"
            name="last_name"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="Email"
            name="walk_in_client_email"
            rules={[{ required: true, message: "Please enter an email" }]}
          >
            <Input placeholder="Walk-In Email" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="Contact Number"
            name="walk_in_client_contact_number"
            rules={[{ required: true, message: "Please enter contact number" }]}
          >
            <Input placeholder="Walk-In Number" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item className="mb-0 mt-6">
        <Row gutter={12} className="flex-row-reverse">
          <Col xs={12} sm={8}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              className="bg-[#36013F] hover:!bg-[#36013F] !border-none"
            >
              Book
            </Button>
          </Col>
          <Col xs={12} sm={8}>
            <Button size="large" onClick={onCancel} disabled={loading} block>
              Cancel
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
}
