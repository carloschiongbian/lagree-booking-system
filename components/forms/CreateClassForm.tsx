"use client";

import { Form, Select, TimePicker, InputNumber, Button, Row, Col } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CreateClassProps } from "@/lib/props";
import { useSearchUser } from "@/lib/api";
import omit from "lodash/omit";

interface CreateClassFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: CreateClassProps | null;
  isEdit?: boolean;
}

export default function CreateClassForm({
  onSubmit,
  onCancel,
  loading = false,
  initialValues = null,
  isEdit = false,
}: CreateClassFormProps) {
  const [form] = Form.useForm();
  const [instructors, setInstructors] = useState<any>([]);
  const { searchInstructors, loading: fetchingInstructors } = useSearchUser();

  useEffect(() => {
    handleSearchInstructors();
    if (initialValues) {
      const totalSlots = (initialValues.slots as string).split("/")[1].trim();
      form.setFieldsValue({
        instructor_name: initialValues.instructor_name,
        instructor_id: initialValues.instructor_id,
        time: [
          dayjs(initialValues.start_time, "hh:mm A"),
          dayjs(initialValues.end_time, "hh:mm A"),
        ],

        slots: parseInt(totalSlots),
      });
    } else {
      form.resetFields();
    }
  }, [initialValues]);

  const handleSearchInstructors = async () => {
    const data = await searchInstructors({});

    if (data) {
      const mapped = data.map((inst, key) => {
        return {
          key: inst.id,
          value: inst.user_profiles.full_name,
          label: inst.user_profiles.full_name,
          id: inst.id,
        };
      });

      setInstructors(mapped);
    }
  };

  const handleFinish = (values: any) => {
    const instructor = instructors.find(
      (inst: any) => inst.value === values.instructor_name
    );
    const formattedValues = {
      ...values,
      ...(!isEdit && { taken_slots: 0 }),
      available_slots: values.slots,
      instructor_name: values.instructor_name,
      instructor_id: instructor.id,
      start_time: values.time[0],
      end_time: values.time[1],
    };

    onSubmit(omit(formattedValues, ["time", "slots"]));
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
            name="instructor_name"
            label="Instructor"
            rules={[
              {
                required: true,
                message: "Please select an instructor",
              },
            ]}
          >
            <Select
              size="large"
              placeholder="Select an instructor"
              suffixIcon={<UserOutlined className="text-slate-400" />}
              options={instructors}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="time"
            label="Time"
            rules={[
              {
                required: true,
                message: "Please select a time",
              },
            ]}
          >
            <TimePicker.RangePicker
              size="large"
              use12Hours
              minuteStep={15}
              format="hh:mm A"
              suffixIcon={<ClockCircleOutlined className="text-slate-400" />}
              className="w-full"
              needConfirm={false}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            name="slots"
            label="Slots"
            rules={[
              {
                required: true,
                message: "Please enter number of slots",
              },
              {
                type: "number",
                min: 1,
                message: "Slots must be at least 1",
              },
            ]}
          >
            <InputNumber
              size="large"
              placeholder="Enter slots"
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
