"use client";

import useDebounce from "@/hooks/use-debounce";
import { useManagePassword } from "@/lib/api";
import { useAppSelector } from "@/lib/hooks";
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";

interface Props {
  clearSignal: any;
  form: FormInstance;
  onSubmit: (values: {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
  }) => void;
}

const { Text } = Typography;

const ChangePasswordForm = ({ clearSignal, onSubmit, form }: Props) => {
  const user = useAppSelector((state) => state.auth.user);
  const { validatePassword } = useManagePassword();

  const [invalidCurrentPassword, setInvalidCurrentPassword] =
    useState<boolean>(true);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const { debouncedValue: debouncedCurrentPassword } = useDebounce(
    currentPassword,
    1000
  );

  useEffect(() => {
    console.log("clearing");
    handleClear();
  }, [clearSignal]);

  useEffect(() => {
    if (user && !!currentPassword?.length) {
      handleValidatePassword();
    }
  }, [debouncedCurrentPassword]);

  const handleValidatePassword = async () => {
    const response = await validatePassword({
      email: user?.email as string,
      currentPassword: debouncedCurrentPassword,
    });

    if (!response) {
      setInvalidCurrentPassword(true);
      form.setFields([
        {
          name: "current_password",
          errors: ["Incorrect password"],
        },
      ]);
    } else {
      // Clear error if valid
      setInvalidCurrentPassword(false);
      form.setFields([
        {
          name: "current_password",
          errors: [],
        },
      ]);
    }

    setIsValidating(false);
  };

  const handleClear = () => {
    form.setFields([
      {
        name: "current_password",
        errors: [],
      },
      {
        name: "new_password",
        errors: [],
      },
      {
        name: "confirm_new_password",
        errors: [],
      },
    ]);
    setInvalidCurrentPassword(true);
    setCurrentPassword("");
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    const newPassword = form.getFieldValue("new_password");
    const confirmedNewPassword = form.getFieldValue("confirm_new_password");

    if (
      !!newPassword.length &&
      !!confirmedNewPassword.length &&
      newPassword !== confirmedNewPassword
    ) {
      form.setFields([
        {
          name: "new_password",
          errors: ["New passwords do not match"],
        },
        {
          name: "confirm_new_password",
          errors: ["New passwords do not match"],
        },
      ]);
    } else if (
      !!newPassword.length &&
      !!confirmedNewPassword.length &&
      newPassword === confirmedNewPassword
    ) {
      form.setFields([
        {
          name: "new_password",
          errors: [],
        },
        {
          name: "confirm_new_password",
          errors: [],
        },
      ]);

      onSubmit(values);
    }
  };

  const handleValidate = (e: any) => {
    setIsValidating(true);
    setCurrentPassword(e.target.value);
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      <Row gutter={[16, 16]}>
        {/* Current Password */}
        <Col className="!mb-[30px]" xs={24} sm={12}>
          <Form.Item
            className="!mb-[5px]"
            label="Current Password"
            name="current_password"
            rules={[
              {
                required: true,
                message: "Please enter your current password",
              },
            ]}
          >
            <Input.Password
              disabled={
                !!form?.getFieldValue("current_password")?.length &&
                !form.getFieldError("current_password").length &&
                !invalidCurrentPassword
              }
              value={currentPassword}
              placeholder="Current Password"
              onChange={handleValidate}
            />
          </Form.Item>
          {isValidating && <Spin size="small" spinning={isValidating} />}
          {!isValidating &&
            !!form?.getFieldValue("current_password")?.length &&
            !form.getFieldError("current_password").length && (
              <Text className="text-green-500">Verified</Text>
            )}
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* New Password */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="New Password"
            name="new_password"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              disabled={invalidCurrentPassword}
              placeholder="New Password"
            />
          </Form.Item>
        </Col>

        {/* Confirm Password */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="Confirm New Password"
            name="confirm_new_password"
            rules={[
              {
                required: true,
                message: "Please confirm your new password",
              },
            ]}
          >
            <Input.Password
              disabled={invalidCurrentPassword}
              placeholder="Confirm New Password"
            />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex justify-center sm:justify-end mt-6 gap-x-[15px]">
        <Button
          onClick={handleClear}
          type="primary"
          className="!bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
        >
          Cancel
        </Button>
        <Button
          disabled={invalidCurrentPassword}
          type="primary"
          htmlType="submit"
          className={`${
            !invalidCurrentPassword &&
            "!bg-[#36013F] hover:!bg-[#36013F] hover:scale-[1.03]"
          } !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200`}
        >
          Change Password
        </Button>
      </div>
    </Form>
  );
};

export default ChangePasswordForm;
