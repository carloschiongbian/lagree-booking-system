"use client";

import { Form, Input, InputNumber, Button, Row, Col, Checkbox } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { LuCalendarDays, LuPackage } from "react-icons/lu";
import { useEffect } from "react";
import { CreatePackageProps } from "@/lib/props";

interface CreatePackageFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: CreatePackageProps | null;
  isEdit?: boolean;
}

export default function CreatePackageForm({
  onSubmit,
  onCancel,
  loading = false,
  initialValues = null,
  isEdit = false,
}: CreatePackageFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        price: initialValues.price,
        validity_period: initialValues.validity_period,
        promo: initialValues.promo,
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
    if (!isEdit) {
      form.resetFields();
    }
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
            required
            name="name"
            label="Title"
            rules={[
              {
                required: true,
                message: "Please enter the package name",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Package Name"
              prefix={<LuPackage className="text-slate-400" />}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            required
            name="price"
            label="Price"
            rules={[
              {
                required: true,
                message: "Please enter package price",
              },
              {
                type: "number",
                min: 1,
                message: "Price must be more than 0",
              },
            ]}
          >
            <InputNumber
              size="large"
              placeholder="Enter price"
              prefix={<TeamOutlined className="text-slate-400" />}
              className="w-full"
              min={1}
              precision={0}
              onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && e.code !== "Backspace") {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const paste = e.clipboardData.getData("text");
                if (!/^\d+$/.test(paste)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            required
            name="validity_period"
            label="Validity Period (Days)"
            rules={[
              {
                required: true,
                message: "Please enter number of days",
              },
              {
                type: "number",
                min: 1,
                message: "Validity period must be at least 1 day",
              },
            ]}
          >
            <InputNumber
              size="large"
              placeholder="Enter validity period"
              prefix={<LuCalendarDays className="text-slate-400" />}
              className="w-full"
              min={1}
              precision={0}
              onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && e.code !== "Backspace") {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const paste = e.clipboardData.getData("text");
                if (!/^\d+$/.test(paste)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        </Col>

        <Col>
          <Form.Item
            name="promo"
            label="Promo"
            initialValue={false}
            valuePropName="checked"
          >
            <Checkbox>Checkbox</Checkbox>
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
              className="bg-[#733AC6] hover:!bg-[#5B2CA8] !border-none"
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
