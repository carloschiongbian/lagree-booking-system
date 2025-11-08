"use client";

import { supabase } from "@/lib/supabase";
import {
  Input,
  Form,
  Row,
  Col,
  Button,
  Typography,
  UploadFile,
  message,
  UploadProps,
  GetProp,
  Upload,
  Image,
  InputNumber,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/hooks";

interface EditClientProps {
  onSubmit: (values: any) => void;
  onCancel: () => void | boolean;
  isModalOpen?: boolean;
  loading?: boolean;
  initialValues?: {
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    avatar_url?: string;
    credits?: number;
  } | null;
  isEdit?: boolean;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
const { Title } = Typography;

const EditClientForm = ({
  onSubmit,
  onCancel,
  isModalOpen,
  loading = false,
  initialValues = null,
  isEdit = false,
}: EditClientProps) => {
  const BUCKET_NAME = "user-photos";
  const [form] = Form.useForm();
  const user = useAppSelector((state) => state.auth.user);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [file, setFile] = useState<UploadFile[] | null>(null);

  useEffect(() => {
    if (initialValues) {
      if (initialValues?.avatar_url) {
        setFile([
          {
            uid: "-1",
            name: "existing_image.png",
            status: "done",
            url: initialValues?.avatar_url,
          },
        ]);
      }
      form.setFieldsValue({
        first_name: initialValues.first_name,
        last_name: initialValues.last_name,
        contact_number: initialValues.contact_number,
        email: initialValues.email,
        credits: initialValues.credits,
      });
    } else {
      form.resetFields();
      setFile(null);
      setPreviewImage("");
      setPreviewOpen(false);
    }
  }, [initialValues, form]);

  const handleUpload = async (file: any) => {
    try {
      if (user && !!file.length) {
        setUploading(true);

        const filePath = `${user?.id}_${dayjs().toDate().getTime()}`;
        const fileExt = (file[0] as File).name.split(".").pop();
        const fileName = `${filePath}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
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
      message.error("Upload failed!");
    } finally {
      setUploading(false);
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

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFile(newFileList);
  };

  const handleSubmit = async (values: any) => {
    let imageURL: string = "";

    if (file) {
      const response = await handleUpload(file);
      if (response) {
        imageURL = response;
      }
    }

    const formData = {
      ...values,
      ...(!!imageURL.length && { avatar_path: imageURL }),
      full_name: `${values.first_name} ${values.last_name}`,
    };

    onSubmit(formData);
  };
  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      <Title level={3}>Personal Information</Title>
      <Col>
        <Row gutter={[16, 0]}>
          <Row justify={"center"} className="w-full mb-4">
            <Upload
              listType="picture-circle"
              fileList={file as UploadFile[]}
              onPreview={handlePreview}
              onChange={handleChange}
              accept="image/*"
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
        </Row>
        <Row gutter={[16, 0]}>
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
        </Row>
      </Col>

      <Title level={3}>Account Information</Title>
      <Row gutter={[16, 0]}>
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
      </Row>

      <Title level={3}>Package and Credits</Title>
      <Row gutter={[16, 0]}>
        {/* Remaining Credits */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="Remaining Credits"
            name="credits"
            rules={[
              {
                required: true,
                message: "Please enter amount of credits",
              },
            ]}
          >
            <InputNumber
              placeholder="Enter credits"
              // prefix={<TeamOutlined className="text-slate-400" />}
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

      <div className="flex justify-center sm:justify-end mt-6">
        <Button
          type="primary"
          loading={loading}
          disabled={loading}
          htmlType="submit"
          className="!bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
        >
          Save Changes
        </Button>
      </div>
    </Form>
  );
};

export default EditClientForm;
