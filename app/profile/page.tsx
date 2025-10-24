"use client";

import React, { useEffect } from "react";
import { Form, Input, Button, DatePicker, message, Row, Col } from "antd";
import dayjs from "dayjs";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { useAppSelector } from "@/lib/hooks";
import { useUpdateUser } from "@/lib/api";
import { UpdateUserProfile } from "@/lib/supabase";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/features/authSlice";

export default function ProfilePage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { updateUser } = useUpdateUser();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        first_name: user.first_name,
        last_name: user.last_name,
        birthday: dayjs(user.birthday),
        contact_number: user.contact_number,
        email: user.email,
        location: user.location,
        emergency_contact_name: user.emergency_contact_name,
        emergency_contact_number: user.emergency_contact_number,
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleSubmit = async (formData: UpdateUserProfile) => {
    const values = {
      ...formData,
      location: formData.location,
      birthday: dayjs(formData.birthday).toISOString(),
      full_name: `${formData.first_name} ${formData.last_name}`,
    };

    const response = await updateUser({
      values,
      id: user?.id as string,
    });

    if (response) {
      const updated = { ...formData, ...user, id: user?.id as string };
      dispatch(setUser(updated));
      console.log("Form Values:", formData);
      message.success("Profile updated successfully!");
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="bg-[#F9FAFB] flex justify-center items-center">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-sm p-6 sm:p-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center sm:text-left">
            Edit Profile
          </h2>

          <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            initialValues={{
              birthday: dayjs(),
            }}
          >
            <Row gutter={[16, 16]}>
              {/* First Name */}
              <Col xs={24} sm={12}>
                <Form.Item
                  initialValue={user?.first_name}
                  label="First Name"
                  name="first_name"
                  rules={[
                    { required: true, message: "Please enter your first name" },
                  ]}
                >
                  <Input
                    defaultValue={user?.first_name}
                    placeholder="Enter first name"
                  />
                </Form.Item>
              </Col>

              {/* Last Name */}
              <Col xs={24} sm={12}>
                <Form.Item
                  initialValue={user?.last_name}
                  label="Last Name"
                  name="last_name"
                  rules={[
                    { required: true, message: "Please enter your last name" },
                  ]}
                >
                  <Input
                    defaultValue={user?.last_name}
                    placeholder="Enter last name"
                  />
                </Form.Item>
              </Col>

              {/* Birthday */}
              <Col xs={24} sm={12}>
                <Form.Item
                  initialValue={dayjs(user?.birthday)}
                  label="Birthday"
                  name="birthday"
                  rules={[
                    { required: true, message: "Please select your birthday" },
                  ]}
                >
                  <DatePicker
                    defaultValue={dayjs(user?.birthday)}
                    className="w-full"
                    format="YYYY-MM-DD"
                    placeholder="Select date"
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    }
                  />
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

              {/* Address */}
              <Col xs={24}>
                <Form.Item
                  label="Address"
                  name="location"
                  rules={[
                    { required: true, message: "Please enter your address" },
                  ]}
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

            <div className="flex justify-center sm:justify-end mt-6">
              <Button
                type="primary"
                htmlType="submit"
                className="!bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
