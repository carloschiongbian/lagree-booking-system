"use client";

import React from "react";
import { Form, Input, Button, DatePicker, message, Row, Col } from "antd";
import dayjs from "dayjs";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

export default function ProfilePage() {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log("Form Values:", values);
    message.success("Profile updated successfully!");
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
                  label="First Name"
                  name="firstName"
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
                  name="lastName"
                  rules={[
                    { required: true, message: "Please enter your last name" },
                  ]}
                >
                  <Input placeholder="Enter last name" />
                </Form.Item>
              </Col>

              {/* Middle Name */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Middle Name"
                  name="middleName"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your middle name",
                    },
                  ]}
                >
                  <Input placeholder="Enter middle name" />
                </Form.Item>
              </Col>

              {/* Birthday */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Birthday"
                  name="birthday"
                  rules={[
                    { required: true, message: "Please select your birthday" },
                  ]}
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
                  name="contactNumber"
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
                  name="address"
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
                  name="emergencyName"
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
                  name="emergencyContact"
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
                className="px-6 rounded-lg"
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
