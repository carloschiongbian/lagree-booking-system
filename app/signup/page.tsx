"use client";

import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Steps,
  message,
  DatePicker,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { MdContactEmergency } from "react-icons/md";
import { useManageCredits, useSearchUser } from "@/lib/api";
import useDebounce from "@/hooks/use-debounce";
import { useAppMessage } from "@/components/ui/message-popup";

const { Title, Text } = Typography;

export default function SignupPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stepOneData, setStepOneData] = useState<any>(null);
  const { showMessage, contextHolder } = useAppMessage();
  const { validateEmail, loading: validatingEmail } = useSearchUser();
  const { createUserCredits, loading: creatingCredits } = useManageCredits();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onFinishStepOne = async (values: any) => {
    setStepOneData(values);
    setCurrentStep(1);
  };

  const onFinishStepTwo = async (values: any) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: stepOneData.email,
        password: stepOneData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            id: authData.user.id,
            email: stepOneData.email,
            contact_number: stepOneData.contact_number,
            full_name: `${values.first_name} ${values.last_name}`,
            first_name: values.first_name,
            emergency_contact_name: values.emergency_contact_name,
            emergency_contact_number: values.emergency_contact_number,
            last_name: values.last_name,
            birthday: values.birthday
              ? values.birthday.format("YYYY-MM-DD")
              : null,
            location: values.location,
            is_user: true,
          });

        await createUserCredits({ values: { user_id: authData.user.id } });

        if (profileError) throw profileError;
      }

      showMessage({
        type: "success",
        content: "Success! Redirecting you to your account!",
        duration: 7000,
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 5000);
    } catch (error: any) {
      console.log(JSON.stringify(error));
      if (JSON.parse(JSON.stringify(error)).code === "user_already_exists") {
        setCurrentStep(0);

        showMessage({
          type: "error",
          content: "Email has already been taken.",
          duration: 10000,
        });
      }
      console.log("error: ", error);
      message.error(error.message || "Sign up failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      {contextHolder}
      <Card
        className="w-full max-w-md shadow-xl border-0"
        style={{ borderRadius: 12 }}
      >
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            Create Account
          </Title>
          <Text type="secondary">Join us today</Text>
        </div>

        <Steps
          current={currentStep}
          className="mb-8"
          items={[{ title: "Account" }, { title: "Profile" }]}
        />
        {currentStep === 0 && (
          <Form
            form={form}
            name="signup-step-1"
            onFinish={onFinishStepOne}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-400" />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="Confirm Password"
              />
            </Form.Item>

            <Form.Item
              name="contact_number"
              rules={[
                { required: true, message: "Please enter your contact number" },
                {
                  pattern: /^[0-9+\s-()]+$/,
                  message: "Please enter a valid phone number",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-slate-400" />}
                placeholder="Contact Number"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="h-11 !bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
              >
                Next
              </Button>
            </Form.Item>

            <div className="text-center">
              <Text type="secondary">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </Link>
              </Text>
            </div>
          </Form>
        )}
        {currentStep === 1 && (
          <Form
            name="signup-step-2"
            onFinish={onFinishStepTwo}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="first_name"
              rules={[
                { required: true, message: "Please enter your first name" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400" />}
                placeholder="First Name"
              />
            </Form.Item>

            <Form.Item
              name="last_name"
              rules={[
                { required: true, message: "Please enter your last name" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400" />}
                placeholder="Last Name"
              />
            </Form.Item>

            <Form.Item
              name="birthday"
              rules={[
                { required: true, message: "Please select your birthday" },
              ]}
            >
              <DatePicker
                placeholder="Birthday"
                className="w-full"
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              name="location"
              rules={[
                { required: true, message: "Please enter your location" },
              ]}
            >
              <Input
                prefix={<EnvironmentOutlined className="text-slate-400" />}
                placeholder="Location"
              />
            </Form.Item>

            <Form.Item
              name="emergency_contact_name"
              rules={[
                {
                  required: true,
                  message: "Please enter an emergency contact name",
                },
              ]}
            >
              <Input
                prefix={<MdContactEmergency className="text-slate-400" />}
                placeholder="Emergency Contact Name"
              />
            </Form.Item>

            <Form.Item
              name="emergency_contact_number"
              rules={[
                {
                  required: true,
                  message: "Please enter an emergency contact number",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-slate-400" />}
                placeholder="Emergency Contact Number"
              />
            </Form.Item>

            <div className="flex gap-3">
              <Button
                disabled={loading}
                loading={loading}
                onClick={() => setCurrentStep(0)}
                block
                className="h-11"
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={loading}
                block
                className="h-11 !bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
              >
                Create Account
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}
