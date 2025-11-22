"use client";

import { useRef, useState } from "react";
import { Form, Tabs, TabsProps } from "antd";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { useAppSelector } from "@/lib/hooks";
import { useManagePassword, useUpdateUser } from "@/lib/api";
import { UpdateUserProfile } from "@/lib/supabase";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/features/authSlice";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import { useAppMessage } from "@/components/ui/message-popup";
import EditProfileForm from "@/components/forms/EditProfileForm";

export default function ProfilePage() {
  const [personalInfoForm] = Form.useForm();
  const [changePasswordForm] = Form.useForm();
  const watchedValues = Form.useWatch([], personalInfoForm);

  const initialValuesRef = useRef<any>(null);
  const [profileTab, setProfileTab] = useState<string>("personal-information");

  const dispatch = useDispatch();
  const { updateUser, loading: updating } = useUpdateUser();
  const user = useAppSelector((state) => state.auth.user);
  const { changePassword } = useManagePassword();
  const { showMessage, contextHolder } = useAppMessage();

  const handleSubmit = async (values: UpdateUserProfile) => {
    try {
      const response = await updateUser({
        values,
        id: user?.id as string,
      });

      if (response) {
        showMessage({
          type: "success",
          content: "Profile updated successfully!",
        });

        const updated = { ...values, ...user, id: user?.id as string };
        dispatch(setUser(updated as any));
      }
    } catch (error) {
      showMessage({
        type: "error",
        content: "Error updating personal information.",
      });
    }
  };

  const handleChangePassword = async ({
    values,
  }: {
    values: {
      current_password: string;
      new_password: string;
      confirm_new_password: string;
    };
  }) => {
    try {
      await changePassword({ newPassword: values.new_password });
      showMessage({
        type: "success",
        content: "Updated password!",
      });
    } catch (error) {
      showMessage({
        type: "error",
        content: "Failed to update password.",
      });
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "personal-information",
      label: "Personal Information",
      children: (
        <EditProfileForm
          loading={updating}
          clearSignal={profileTab}
          onSubmit={handleSubmit}
          form={personalInfoForm}
        />
      ),
    },
    {
      key: "change-password",
      label: "Change Password",
      children: (
        <ChangePasswordForm
          clearSignal={profileTab}
          onSubmit={(values: {
            current_password: string;
            new_password: string;
            confirm_new_password: string;
          }) => {
            handleChangePassword({ values });
          }}
          form={changePasswordForm}
        />
      ),
    },
  ];

  return (
    <AuthenticatedLayout>
      {contextHolder}
      <div className="bg-[#F9FAFB] flex justify-center items-center">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-sm p-6 sm:p-10">
          <Tabs
            defaultActiveKey="personal-information"
            onTabClick={(e) => setProfileTab(e)}
            items={items}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
