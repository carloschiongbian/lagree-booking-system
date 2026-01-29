"use client";

import { useManageImage } from "@/lib/api";
import { useAppSelector } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  GetProp,
  Input,
  Row,
  Upload,
  UploadFile,
  UploadProps,
  Image,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useAppMessage } from "../ui/message-popup";
import { keys, omit } from "lodash";
import { FileType } from "@/lib/utils";

interface Props {
  clearSignal: any;
  form: FormInstance;
  loading?: boolean;
  onSubmit: (values: any) => void;
}

const EditProfileForm = ({ loading, clearSignal, onSubmit, form }: Props) => {
  const user = useAppSelector((state) => state.auth.user);
  const initialValuesRef = useRef<any>(null);
  const [isModified, setIsModified] = useState<boolean>(false);
  const watchedValues = Form.useWatch([], form);
  const { showMessage, contextHolder } = useAppMessage();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [file, setFile] = useState<UploadFile[] | null>(null);
  const [initialFileState, setInitialFileState] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      if (user?.avatar_url) {
        setInitialFileState([
          {
            uid: "-1",
            name: "existing_image.png",
            status: "done",
            url: user?.avatar_url,
          },
        ]);

        setFile([
          {
            uid: "-1",
            name: "existing_image.png",
            status: "done",
            url: user?.avatar_url,
          },
        ]);
      }
      const initial = {
        first_name: user.first_name,
        last_name: user.last_name,
        birthday: dayjs(user.birthday),
        contact_number: user.contact_number,
        email: user.email,
        location: user.location,
        emergency_contact_name: user.emergency_contact_name,
        emergency_contact_number: user.emergency_contact_number,
        avatar_url: user?.avatar_url,
      };

      const values = omit(initial, ["avatar_url"]);
      form.setFieldsValue(values);
      initialValuesRef.current = values;
    } else {
      form.resetFields();
    }
  }, [user]);

  useEffect(() => {
    const fileKeys = keys(file?.[0]);
    if (
      JSON.stringify(watchedValues) !==
        JSON.stringify(initialValuesRef.current) ||
      (!!fileKeys.length && !fileKeys.includes("url")) ||
      file?.length !== initialFileState?.length
    ) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [watchedValues, file]);

  useEffect(() => {
    handleClear();
  }, [clearSignal]);

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

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

      if (user?.avatar_url) {
        setFile([
          {
            uid: "-1",
            name: "existing_image.png",
            status: "done",
            url: user?.avatar_url,
          },
        ]);
      } else {
        setFile([]);
      }
    }
  };

  const handleClear = () => {
    form.resetFields();
    handleResetProfileForm();
  };

  const handleSubmit = async (formData: any) => {
    let imageURL: string | File = "";
    const modifiedFile = file?.[0];

    if (
      modifiedFile !== undefined &&
      modifiedFile !== null &&
      modifiedFile?.name !== "existing_image.png"
    ) {
      const response = await handleUpload(file);
      if (response) {
        imageURL = response;
      }
    }

    const values = {
      ...formData,
      ...(modifiedFile?.name !== "existing_image.png" && {
        avatar_path: imageURL.length ? imageURL : null,
      }),
      location: formData.location,
      birthday: dayjs(formData.birthday).toISOString(),
      full_name: `${formData.first_name} ${formData.last_name}`,
    };

    onSubmit(values);
  };

  const handleUpload = async (file: any) => {
    try {
      if (user && !!file.length) {
        const filePath = `${user?.id}_${dayjs().toDate().getTime()}`;
        const fileExt = (file[0] as File).name.split(".").pop();
        const fileName = `${filePath}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("user-photos")
          .upload(fileName, file[0].originFileObj as File, {
            upsert: true, // overwrite if exists
            contentType: (file[0] as File).type,
          });

        if (uploadError) throw uploadError;

        const imageURL = fileName;

        return imageURL;
      }
    } catch (err: any) {
      console.error(err);
      showMessage({ type: "error", content: "Failed to upload image." });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>User Photo</div>
    </button>
  );

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFile(newFileList);
  };

  return (
    <>
      {contextHolder}
      <Row justify={"center"} className="w-full mb-4">
        <Upload
          listType="picture-circle"
          beforeUpload={() => false}
          fileList={file as UploadFile[]}
          onPreview={handlePreview}
          onChange={handleChange}
          accept="image/*"
          onDrop={(e) => console.log(e)}
        >
          {file && file.length > 0 ? null : uploadButton}
        </Upload>
      </Row>
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
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
              rules={[
                { required: true, message: "Please enter your last name" },
              ]}
            >
              <Input placeholder="Enter last name" />
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
              !loading && "!bg-[#800020] hover:!bg-[#800020] hover:scale-[1.03]"
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
              isModified &&
              "!bg-[#800020] hover:!bg-[#800020] hover:scale-[1.03]"
            } !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200`}
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </>
  );
};

export default EditProfileForm;
