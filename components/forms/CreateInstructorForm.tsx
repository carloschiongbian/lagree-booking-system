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
import { useEffect } from "react";
import { CreateClassProps, CreateInstructorProps } from "@/lib/props";

interface CreateClassFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: CreateInstructorProps | null;
  isEdit?: boolean;
}

export default function CreateInstructorForm({
  onSubmit,
  onCancel,
  loading = false,
  initialValues = null,
  isEdit = false,
}: CreateClassFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      //   const totalSlots = initialValues.slots.split("/")[1].trim();
      form.setFieldsValue({
        first_name: initialValues.first_name,
        last_name: initialValues.last_name,
        full_name: `${initialValues.first_name} ${initialValues.last_name}`,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
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
        <Row wrap={false} className="w-full gap-[10px] px-[8px]">
          <Form.Item
            className="w-full"
            name="first_name"
            label="First Name"
            rules={[
              {
                required: true,
                message: "Please enter first name",
              },
            ]}
          >
            <Input
              placeholder="First Name"
              suffix={<UserOutlined className="text-slate-400" />}
            />
          </Form.Item>

          <Form.Item
            className="w-full"
            name="last_name"
            label="Last Name"
            rules={[
              {
                required: true,
                message: "Please enter last name",
              },
            ]}
          >
            <Input
              placeholder="Last Name"
              suffix={<UserOutlined className="text-slate-400" />}
            />
          </Form.Item>
        </Row>
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
