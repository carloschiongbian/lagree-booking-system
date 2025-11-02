"use client";

import {
  Form,
  Button,
  Row,
  Col,
  Input,
  UploadFile,
  Upload,
  message,
  Image,
  GetProp,
  UploadProps,
} from "antd";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { CreateInstructorProps } from "@/lib/props";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/lib/hooks";
import dayjs from "dayjs";

interface CreateClassFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void | boolean;
  isModalOpen?: boolean;
  loading?: boolean;
  initialValues?: CreateInstructorProps | null;
  isEdit?: boolean;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export default function CreateInstructorForm({
  onSubmit,
  onCancel,
  isModalOpen,
  loading = false,
  initialValues = null,
  isEdit = false,
}: CreateClassFormProps) {
  const [form] = Form.useForm();
  const BUCKET_NAME = "user-photos";
  const user = useAppSelector((state) => state.auth.user);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [file, setFile] = useState<UploadFile[] | null>(null);

  useEffect(() => {
    if (initialValues) {
      //   const totalSlots = initialValues.slots.split("/")[1].trim();
      setFile([
        {
          uid: "-1",
          name: "existing_image.png",
          status: "done",
          url: initialValues?.avatar_url,
        },
      ]);
      form.setFieldsValue({
        first_name: initialValues.first_name,
        last_name: initialValues.last_name,
        full_name: `${initialValues.first_name} ${initialValues.last_name}`,
      });
    } else {
      form.resetFields();
      setFile(null);
      setPreviewImage("");
      setPreviewOpen(false);
    }
  }, [initialValues, form]);

  const handleUpload = async (file: any) => {
    console.log(file);
    try {
      if (!!file.length) {
        setUploading(true);

        // 1️⃣ Generate unique file name
        const filePath = `${dayjs().toDate().getTime()}`;
        const fileExt = (file[0] as File).name.split(".").pop();
        const fileName = `${filePath}.${fileExt}`;

        // 2️⃣ Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file[0].originFileObj as File, {
            upsert: true, // overwrite if exists
            contentType: (file[0] as File).type,
          });

        if (uploadError) throw uploadError;

        // 4️⃣ Save the image path to your database
        // const { error: dbError } = await supabase.from("instructors").insert({
        //   image_url: publicUrl, // or store filePath if you prefer private access
        // });

        // if (dbError) throw dbError;

        message.success("Image uploaded successfully!");

        // const imageURL = publicUrl.split("/").pop(); // "045
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
      <div style={{ marginTop: 8 }}>Upload</div>
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
  const handleFinish = async (values: any) => {
    let imageURL: string = "";
    const formattedValues = {
      ...values,
    };

    if (file) {
      const response = await handleUpload(file);
      if (response) {
        imageURL = response;
      }

      const formData = { ...formattedValues, avatar_path: imageURL };

      console.log("formData: ", formData);

      onSubmit(formData);
      form.resetFields();
    }
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFile(newFileList);
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
        <Row wrap={false} className="w-full gap-[10px] px-[8px]">
          <Form.Item
            className="w-full"
            name="first_name"
            label="First Name"
            rules={[
              {
                required: true,
                message: "Please enter first name",
              },
            ]}
          >
            <Input
              placeholder="First Name"
              suffix={<UserOutlined className="text-slate-400" />}
            />
          </Form.Item>

          <Form.Item
            className="w-full"
            name="last_name"
            label="Last Name"
            rules={[
              {
                required: true,
                message: "Please enter last name",
              },
            ]}
          >
            <Input
              placeholder="Last Name"
              suffix={<UserOutlined className="text-slate-400" />}
            />
          </Form.Item>
        </Row>
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
