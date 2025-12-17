"use client";

import {
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Checkbox,
  FormInstance,
} from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { LuCalendarDays, LuPackage } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
import { CreatePackageProps } from "@/lib/props";

interface CreatePackageFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: CreatePackageProps | null;
  isEdit?: boolean;
  form: FormInstance;
  clearSignal?: boolean;
}

export default function CreatePackageForm({
  onSubmit,
  onCancel,
  loading = false,
  initialValues = null,
  isEdit = false,
  form,
  clearSignal,
}: CreatePackageFormProps) {
  const initialRef = useRef<any>(null);
  const [isOffered, setIsOffered] = useState<boolean>(false);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);

  useEffect(() => {
    if (initialRef.current) {
      form.setFieldsValue(initialRef.current);
      setIsUnlimited(false);
    }
  }, [clearSignal]);

  useEffect(() => {
    if (initialValues) {
      setIsUnlimited(initialValues.package_credits ? false : true);
      setIsOffered(initialValues.offered_for_clients as boolean);

      let initial = {
        name: initialValues.title,
        price: initialValues.price,
        validity_period: initialValues.validity_period,
        ...(initialValues.package_credits !== null && {
          package_credits: initialValues.package_credits,
        }),
      };

      initialRef.current = initial;
      form.setFieldsValue(initial);
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      offered_for_clients: isOffered,
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

        <Col xs={24} sm={12}>
          <Form.Item
            className="!mb-[5px] !pb-[5px]"
            name="package_credits"
            label="Number of Sessions"
            rules={[
              {
                required: !isUnlimited,
                message: "Please enter number of sessions",
              },
              {
                type: "number",
                min: 1,
                message: "Number must be more than 0",
              },
            ]}
          >
            <InputNumber
              size="large"
              disabled={isUnlimited}
              placeholder="Enter number of sessions"
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
          <Checkbox
            checked={isUnlimited}
            onChange={(e) => {
              if (e.target.checked === true) {
                form.setFieldValue("package_credits", undefined);
              }

              setIsUnlimited(e.target.checked);
            }}
          >
            Unlimited Sessions
          </Checkbox>
        </Col>

        <Col xs={24} sm={12}>
          <Row wrap={false} className="flex flex-col justify-center h-full">
            <Checkbox
              checked={isOffered}
              onChange={(e) => {
                form.setFieldValue("offered_for_clients", undefined);
                setIsOffered(e.target.checked);
              }}
            >
              Make available to clients
            </Checkbox>
          </Row>
        </Col>
      </Row>

      <Form.Item className="mb-0 mt-6">
        <Row gutter={12} className="flex-row justify-end">
          <Col xs={12} sm={8}>
            <Button size="large" onClick={onCancel} disabled={loading} block>
              Cancel
            </Button>
          </Col>
          <Col xs={12} sm={8}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              disabled={loading}
              block
              className="bg-[#36013F] hover:!bg-[#36013F] !border-none"
            >
              {isEdit ? "Update" : "Create"}
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
}
