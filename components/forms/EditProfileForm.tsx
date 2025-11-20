"use client";

import useDebounce from "@/hooks/use-debounce";
import { useManagePassword } from "@/lib/api";
import { useAppSelector } from "@/lib/hooks";
import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  clearSignal: any;
  form: FormInstance;
  loading?: boolean;
  onSubmit: (values: any) => void;
}

const { Text } = Typography;

const EditProfileForm = ({ loading, clearSignal, onSubmit, form }: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  const initialValuesRef = useRef<any>(null);
  const [isModified, setIsModified] = useState<boolean>(false);
  const watchedValues = Form.useWatch([], form);

  useEffect(() => {
    if (user) {
      const initial = {
        first_name: user.first_name,
        last_name: user.last_name,
        birthday: dayjs(user.birthday),
        contact_number: user.contact_number,
        email: user.email,
        location: user.location,
        emergency_contact_name: user.emergency_contact_name,
        emergency_contact_number: user.emergency_contact_number,
      };

      form.setFieldsValue(initial);
      initialValuesRef.current = initial;
    } else {
      form.resetFields();
    }
  }, [user]);

  useEffect(() => {
    if (
      JSON.stringify(watchedValues) !== JSON.stringify(initialValuesRef.current)
    ) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [watchedValues]);

  useEffect(() => {
    handleClear();
  }, [clearSignal]);

  const handleResetProfileForm = () => {
    if (initialValuesRef.current) {
      form.setFieldsValue({
        first_name: initialValuesRef.current.first_name,
        last_name: initialValuesRef.current.last_name,
        birthday: dayjs(initialValuesRef.current.birthday),
        contact_number: initialValuesRef.current.contact_number,
        email: initialValuesRef.current.email,
        location: initialValuesRef.current.location,
        emergency_contact_name: initialValuesRef.current.emergency_contact_name,
        emergency_contact_number:
          initialValuesRef.current.emergency_contact_number,
      });
    }
  };

  const handleClear = () => {
    form.resetFields();
    handleResetProfileForm();
  };

  const handleSubmit = (formData: any) => {
    const values = {
      ...formData,
      location: formData.location,
      birthday: dayjs(formData.birthday).toISOString(),
      full_name: `${formData.first_name} ${formData.last_name}`,
    };

    onSubmit(values);
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      <Row gutter={[16, 16]}>
        {/* First Name */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="First Name"
            name="first_name"
            rules={[
              { required: true, message: "Please enter your first name" },
            ]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>
        </Col>

        {/* Last Name */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="Last Name"
            name="last_name"
            rules={[{ required: true, message: "Please enter your last name" }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
        </Col>

        {/* Birthday */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="Birthday"
            name="birthday"
            rules={[{ required: true, message: "Please select your birthday" }]}
          >
            <DatePicker
              className="w-full"
              format="YYYY-MM-DD"
              placeholder="Select date"
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
          </Form.Item>
        </Col>

        {/* Contact Number */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="Contact Number"
            name="contact_number"
            rules={[
              {
                required: true,
                message: "Please enter your contact number",
              },
              {
                pattern: /^[0-9]+$/,
                message: "Contact number must be digits only",
              },
            ]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>
        </Col>

        {/* Email */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email address",
              },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
        </Col>

        {/* Address */}
        <Col xs={24}>
          <Form.Item
            label="Address"
            name="location"
            rules={[{ required: true, message: "Please enter your address" }]}
          >
            <Input.TextArea placeholder="Enter address" rows={3} />
          </Form.Item>
        </Col>

        {/* Emergency Contact Name */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="Emergency Contact Name"
            name="emergency_contact_name"
            rules={[
              {
                required: true,
                message: "Please enter emergency contact name",
              },
            ]}
          >
            <Input placeholder="Enter emergency contact name" />
          </Form.Item>
        </Col>

        {/* Emergency Contact Number */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="Emergency Contact Number"
            name="emergency_contact_number"
            rules={[
              {
                required: true,
                message: "Please enter emergency contact number",
              },
              {
                pattern: /^[0-9]+$/,
                message: "Emergency contact must be digits only",
              },
            ]}
          >
            <Input placeholder="Enter emergency contact number" />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex justify-center sm:justify-end mt-6 gap-x-[10px]">
        <Button
          disabled={loading}
          type="primary"
          onClick={handleResetProfileForm}
          className={`${
            !loading && "!bg-[#36013F] hover:!bg-[#36013F] hover:scale-[1.03]"
          } !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200`}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          disabled={!isModified || loading}
          loading={loading}
          htmlType="submit"
          className={`${
            isModified && "!bg-[#36013F] hover:!bg-[#36013F] hover:scale-[1.03]"
          } !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200`}
        >
          Save Changes
        </Button>
      </div>
    </Form>
  );
};

export default EditProfileForm;
