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
  Typography,
  Divider,
  Select,
  DatePicker,
  Spin,
  FormInstance,
  Modal,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { CreateInstructorProps } from "@/lib/props";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/lib/hooks";
import dayjs from "dayjs";
import { MdContactEmergency } from "react-icons/md";
import useDebounce from "@/hooks/use-debounce";
import { useSearchUser } from "@/lib/api";
import { keys } from "lodash";
import { CERTIFICATIONS } from "@/lib/utils";

interface CreateClassFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void | boolean;
  onDelete: (id: string) => void;
  onDeactivate: (id: string) => void;
  isModalOpen?: boolean;
  loading?: boolean;
  initialValues?: CreateInstructorProps | null;
  isEdit?: boolean;
  clearSignal?: any;
  form: FormInstance;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const { Title, Text } = Typography;

export default function CreateInstructorForm({
  onSubmit,
  onCancel,
  isModalOpen,
  loading = false,
  initialValues = null,
  onDelete,
  onDeactivate,
  isEdit = false,
  clearSignal,
  form,
}: CreateClassFormProps) {
  const watchedValues = Form.useWatch([], form);
  const BUCKET_NAME = "user-photos";
  const user = useAppSelector((state) => state.auth.user);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [file, setFile] = useState<UploadFile[] | null>(null);
  const [initialFileState, setInitialFileState] = useState<UploadFile[] | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const { validateEmail } = useSearchUser();
  const [email, setEmail] = useState<string>("");
  const { debouncedValue: debouncedEmail, loading: debouncing } = useDebounce(
    email,
    1500
  );

  const [isMobile, setIsMobile] = useState(false);
  const [emailTaken, setEmailTaken] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const initialValuesRef = useRef<any>(null);

  const [isModified, setIsModified] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // rAF throttle
    let rafId: number | null = null;
    const onResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        handleResize();
      });
    };

    handleResize();
    window.addEventListener("resize", onResize);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (
      (!!debouncedEmail?.length &&
        initialValuesRef.current?.email !== debouncedEmail) ||
      initialValuesRef.current?.email !== email
    ) {
      handleValidateEmail({ debouncedEmail: debouncedEmail });
    } else {
      setIsValidating(false);
    }
  }, [debouncedEmail]);

  useEffect(() => {
    const fileKeys = keys(file?.[0]);

    let formCopy = { ...watchedValues };

    if (
      JSON.stringify(formCopy) !== JSON.stringify(initialValuesRef.current) ||
      (!!fileKeys.length && !fileKeys.includes("url")) ||
      file?.length !== initialFileState?.length
    ) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [watchedValues, file, initialValuesRef.current]);

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

        setInitialFileState([
          {
            uid: "-1",
            name: "existing_image.png",
            status: "done",
            url: initialValues?.avatar_url,
          },
        ]);
      }
      const initial = {
        id: initialValues?.id,
        first_name: initialValues.first_name,
        last_name: initialValues.last_name,
        contact_number: initialValues.contact_number,
        email: initialValues.email,
        certification: initialValues.certification,
        employment_start_date: dayjs(initialValues.employment_start_date),
        emergency_contact_name: initialValues.emergency_contact_name,
        emergency_contact_number: initialValues.emergency_contact_number,
      };

      initialValuesRef.current = initial;
      form.setFieldsValue(initial);
    } else {
      form.resetFields();
      setFile(null);
      setPreviewImage("");
      setPreviewOpen(false);
    }
  }, [initialValues, form]);

  const handleValidateEmail = async ({
    debouncedEmail,
  }: {
    debouncedEmail: string;
  }) => {
    const response = await validateEmail({ email: debouncedEmail });
    const isTaken = isEdit
      ? response !== null && initialValuesRef.current.email !== debouncedEmail
      : response !== null;

    setEmailTaken(isTaken);

    form.setFields([
      {
        name: "email",
        errors: !isTaken ? [] : ["Email has already been taken"],
      },
    ]);
    setIsValidating(false);
  };

  const handleUpload = async (file: any) => {
    try {
      if (!!file.length) {
        setUploading(true);

        const filePath = `${dayjs().toDate().getTime()}`;
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

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFile(newFileList);
  };

  const handleReset = () => {
    form.setFieldsValue(initialValuesRef.current);
    setFile([]);
    setInitialFileState([]);
    setIsModified(false);
    setIsValidating(false);
    setEmailTaken(false);
  };
  const handleSubmit = async (values: any) => {
    let imageURL: string | File = "";

    const instructorFile = file?.[0];

    if (instructorFile?.name !== "existing_image.png") {
      const response = await handleUpload(file);

      if (response) {
        imageURL = response;
      }
    }

    const formData = {
      ...values,
      ...(!!imageURL.length && { avatar_path: imageURL }),
    };

    handleReset();
    onSubmit(formData);
  };

  const showDeleteConfirm = () => {
    setIsDeleteModalOpen(true);
  };

  const showDeactivateConfirm = () => {
    setDeactivateModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (initialValuesRef.current.id) {
      onDelete(initialValuesRef.current.id as string);
    }
    handleReset();
    onCancel();
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDeactivate = () => {
    onDeactivate(initialValuesRef.current.id as string);

    handleReset();
    onCancel();
    setDeactivateModalOpen(false);
  };

  const handleCancelDeactivate = () => {
    setDeactivateModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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

        <Title level={4}>Personal Information</Title>
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

          <Row wrap={false} className="w-full gap-[10px] px-[8px]">
            <Form.Item
              label="Contact Number"
              className="w-[50%]"
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
          </Row>
        </Row>

        <Divider className="md:m-0 pb-[10px]" />

        <Title level={4}>Account Information</Title>
        <Row gutter={[16, 0]}>
          <Row wrap={false} className="w-full gap-[10px] px-[8px] mb-[20px]">
            <Row wrap={false} className="flex flex-col justify-start">
              <Form.Item
                className="!mb-[5px]"
                label={
                  <Row wrap={false} className="items-center gap-x-[10px]">
                    <p>Email Address</p>
                    {debouncing && <Spin spinning={debouncing} size="small" />}
                  </Row>
                }
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email address",
                  },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsValidating(true);
                  }}
                  placeholder="Enter email address"
                />
              </Form.Item>
            </Row>
          </Row>

          {!isEdit && (
            <Row wrap={false} className="w-full gap-[10px] px-[8px]">
              <Form.Item
                label="Password"
                className="w-full"
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
                label="Confirm Password"
                className="w-full"
                name="confirm_password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400" />}
                  placeholder="Confirm Password"
                />
              </Form.Item>
            </Row>
          )}
        </Row>

        <Divider className="md:m-0 pb-[10px]" />

        <Title level={4}>Professional Information</Title>
        <Row gutter={[16, 0]}>
          <Row wrap={false} className="w-full gap-[10px] px-[8px]">
            <Form.Item
              label="Certification / Specialty"
              className="w-full"
              name="certification"
              rules={[
                { required: true, message: "Please select a certification" },
              ]}
            >
              <Select
                options={CERTIFICATIONS}
                prefix={<MailOutlined className="text-slate-400" />}
                placeholder="Select a certification"
              />
            </Form.Item>

            <Form.Item
              className="w-full"
              label="Employment Start Date"
              name="employment_start_date"
              rules={[
                {
                  required: true,
                  message: "Please select start of employment",
                },
              ]}
            >
              <DatePicker
                placeholder="Start Date"
                className="w-full"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Row>

          <Row wrap={false} className="w-full gap-[10px] px-[8px]">
            <Form.Item
              className="w-full"
              name="emergency_contact_name"
              label="Emergency Contact Name"
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
              className="w-full"
              name="emergency_contact_number"
              label="Emergency Contact Number"
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
          </Row>
        </Row>

        <Form.Item className="mb-0 mt-6">
          <Row gutter={12} className="flex-row justify-end" wrap={false}>
            <Col>
              <Button size="large" onClick={onCancel} disabled={loading} block>
                Cancel
              </Button>
            </Col>
            {isEdit && (
              <Col>
                <Button
                  danger
                  size="large"
                  onClick={showDeleteConfirm}
                  disabled={loading}
                  block
                >
                  Delete
                </Button>
              </Col>
            )}
            {isEdit && (
              <Col>
                <Button
                  className={`!bg-[#36013F] hover:!bg-[#36013F] hover:scale-[1.03] !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200`}
                  size="large"
                  onClick={showDeactivateConfirm}
                  disabled={loading}
                  block
                >
                  {initialValues?.deactivated === true
                    ? "Reactivate"
                    : "Deactivate"}
                </Button>
              </Col>
            )}
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                disabled={loading || isValidating || emailTaken || !isModified}
                className={`${
                  !isValidating && !emailTaken && isModified
                    ? "!bg-[#36013F] hover:!bg-[#36013F] hover:scale-[1.03]"
                    : "!bg-[gray] hover:!bg-[gray]"
                } !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200`}
              >
                {isEdit ? "Update" : "Create"}
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>

      <Modal
        title="Delete Instructor"
        open={isDeleteModalOpen}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        width={isMobile ? "90%" : 430}
      >
        <Row className="py-[20px]">
          <Text>Are you sure you want to delete this instructor?</Text>
        </Row>
      </Modal>

      <Modal
        title={`${
          initialValues?.deactivated === true ? "Reactivate" : "Deactivate"
        }  Instructor`}
        open={deactivateModalOpen}
        onOk={handleConfirmDeactivate}
        onCancel={handleCancelDeactivate}
        okText={
          initialValues?.deactivated === true ? "Reactivate" : "Deactivate"
        }
        okType="danger"
        cancelText="Cancel"
        width={isMobile ? "90%" : 430}
      >
        <Row className="py-[20px]">
          <Text>
            Are you sure you want to{" "}
            {initialValues?.deactivated === true ? "reactivate" : "deactivate"}{" "}
            this instructor?
          </Text>
        </Row>
      </Modal>
    </>
  );
}
