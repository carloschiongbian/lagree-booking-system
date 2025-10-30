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
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CreateClassProps } from "@/lib/props";
import { MdOutlineSchedule } from "react-icons/md";
import { useSearchUser } from "@/lib/api";

interface CreateClassFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: CreateClassProps | null;
  isEdit?: boolean;
}

export default function ManualBookingForm({
  onSubmit,
  onCancel,
  loading = false,
  initialValues = null,
  isEdit = false,
}: CreateClassFormProps) {
  const [form] = Form.useForm();
  const [instructors, setInstructors] = useState<any>([]);
  const { searchInstructors, loading: searchingInstructor } = useSearchUser();

  useEffect(() => {
    handleSearchInstructors();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        instructor: initialValues.instructor_id,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleSearchInstructors = async () => {
    const data = await searchInstructors({});
    console.log(data);
    setInstructors(data);
  };

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      start_time: values.time[0],
      end_time: values.time[1],
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
              placeholder="Select a class schedule"
              suffixIcon={<MdOutlineSchedule className="text-slate-400" />}
              options={instructors}
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
              {isEdit ? "Update" : "Create"}
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
