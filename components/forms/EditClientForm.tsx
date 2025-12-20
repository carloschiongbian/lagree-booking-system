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
  Spin,
  Modal,
  Select,
  Tooltip,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import PackageHistoryCard from "../ui/package-history-card";
import {
  useManageCredits,
  useManageImage,
  usePackageManagement,
  useSearchUser,
} from "@/lib/api";
import useDebounce from "@/hooks/use-debounce";
import { keys } from "lodash";

interface EditClientProps {
  onSubmit: (values: any) => void;
  onCancel: () => void | boolean;
  isModalOpen?: boolean;
  loading?: boolean;
  initialValues?: {
    id?: string;
    currentPackage?: any;
    clientPackage?: any;
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    avatar_url?: string;
    avatar_path?: string;
    credits?: number;
  } | null;
  isEdit?: boolean;
  refetch?: any;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
const { Title, Text } = Typography;

const EditClientForm = ({
  onSubmit,
  onCancel,
  isModalOpen,
  refetch,
  loading = false,
  initialValues = null,
  isEdit = false,
}: EditClientProps) => {
  const [form] = Form.useForm();
  const watchedValues = Form.useWatch([], form);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [file, setFile] = useState<UploadFile[] | null>(null);
  const [initialFileState, setInitialFileState] = useState<UploadFile[] | null>(
    null
  );
  const { saveImage } = useManageImage();
  const [email, setEmail] = useState<string>("");
  const { validateEmail } = useSearchUser();
  const { debouncedValue: debouncedEmail, loading: debouncing } = useDebounce(
    email,
    1500
  );
  const [emailTaken, setEmailTaken] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const initialValuesRef = useRef<any>(null);
  const [isModified, setIsModified] = useState<boolean>(false);

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
    if (initialValues) {
      // exclude avatar data since it's not part of the form
      const initial = {
        first_name: initialValues.first_name,
        last_name: initialValues.last_name,
        contact_number: initialValues.contact_number,
        email: initialValues.email,
        credits: initialValues.credits,
      };

      form.setFieldsValue({ credits: initialValues.credits });

      if (!!initialValues?.avatar_url?.length) {
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

      initialValuesRef.current = initial;
      form.setFieldsValue(initial);
    } else {
      form.resetFields();
      setFile(null);
      setPreviewImage("");
      setPreviewOpen(false);
    }
  }, [initialValues, form]);

  useEffect(() => {
    const fileKeys = keys(file?.[0]);

    let formCopy = { ...watchedValues };
    if (!keys(formCopy).includes("credits")) {
      formCopy.credits = null;
    }

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

  const handleValidateEmail = async ({
    debouncedEmail,
  }: {
    debouncedEmail: string;
  }) => {
    const response = await validateEmail({ email: debouncedEmail });
    const isTaken =
      response !== null && initialValuesRef.current.email !== debouncedEmail;

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
      if (initialValues?.id && !!file.length) {
        setUploading(true);

        const response = await saveImage({ file, id: initialValues.id });

        return response;
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
    let imageURL: string | File = "";
    const clientFile = file?.[0];

    if (
      clientFile !== undefined &&
      clientFile !== null &&
      clientFile?.name !== "existing_image.png"
    ) {
      const response = await handleUpload(file);
      if (response) {
        imageURL = response;
      }
    }

    const formData = {
      ...values,
      ...(clientFile?.name !== "existing_image.png" && {
        avatar_path: imageURL,
      }),
      full_name: `${values.first_name} ${values.last_name}`,
    };

    onSubmit(formData);
  };

  const handleClose = () => {
    form.resetFields();
    setFile(null);
    setPreviewImage("");
    setPreviewOpen(false);
    onCancel();
  };

  const [isPackagesModalOpen, setIsPackagesModalOpen] =
    useState<boolean>(false);
  const {
    fetchPackages,
    purchasePackage,
    updateClientPackage,
    loading: addingPackage,
  } = usePackageManagement();
  const { updateUserCredits } = useManageCredits();
  const [packages, setPackages] = useState<any>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const handleOpenPackagesModal = () => {
    setIsPackagesModalOpen(true);
  };
  const handleClosePackagesModal = () => {
    setIsPackagesModalOpen(false);
  };

  useEffect(() => {
    if (isPackagesModalOpen) {
      handleFetchPackages();
    }
  }, [isPackagesModalOpen]);

  const handleFetchPackages = async () => {
    const response = await fetchPackages({ isAdmin: true });

    const mapped = response?.map((data) => {
      return {
        ...data,
        validityPeriod: data.validity_period,
        packageType: data.package_type,
        packageCredits: data.package_credits,
        key: data.id,
        value: data.id,

        label: data.title,
      };
    });
    setPackages(mapped);
  };

  const handleAddPackage = async () => {
    await handlePurchasePackage();
    await handleUpdateUserCredits({ credits: selectedPackage.packageCredits });

    refetch();
    handleClose();
    handleClosePackagesModal();
  };

  const handleUpdateUserCredits = async ({ credits }: { credits: number }) => {
    try {
      await updateUserCredits({
        userID: initialValues?.id as string,
        values: { credits },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handlePurchasePackage = async () => {
    try {
      if (initialValues?.clientPackage && initialValues?.credits === 0) {
        await updateClientPackage({
          clientPackageID: initialValues?.clientPackage.clientPackageID,
          values: { status: "expired", expirationDate: dayjs() },
        });
      }

      const response = await purchasePackage({
        userID: initialValues?.id as string,
        packageID: selectedPackage.id,
        paymentMethod: "qr",
        packageName: selectedPackage.title,
        validityPeriod: selectedPackage.validityPeriod,
        packageCredits: selectedPackage.packageCredits,
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
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
          <Col className="!mb-[20px]" xs={24} sm={12}>
            <>
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
            </>
          </Col>
        </Row>

        <Title level={3} className="!mb-[30px]">
          Active Package and Credits
        </Title>
        <Row gutter={[16, 0]}>
          {/* Remaining Credits */}

          <Row className="w-full mb-[40px]" justify={"center"}>
            {initialValues?.clientPackage && (
              <Row justify={"center"}>
                <PackageHistoryCard
                  item={initialValues?.clientPackage as any}
                />
              </Row>
            )}
            {(!initialValues?.clientPackage ||
              initialValues?.credits === 0) && (
              <Row
                justify={"center"}
                className={`bg-slate-200 w-full rounded-[10px] p-[30px] flex-col flex items-center ${
                  initialValues?.credits === 0 && "mt-[10px]"
                }`}
              >
                <Title className="!font-light" level={5}>
                  {initialValues?.credits === 0
                    ? "Client has no more credits"
                    : "Client has no active package"}
                </Title>
                <Button
                  className={`bg-white`}
                  onClick={handleOpenPackagesModal}
                >
                  Add Package
                </Button>
              </Row>
            )}
          </Row>

          {initialValues?.clientPackage && (
            <Col xs={24} sm={12}>
              <Tooltip
                title={
                  initialValues.credits === null &&
                  "User has unlimited sessions"
                }
              >
                <Form.Item
                  label={`Remaining Credits`}
                  name="credits"
                  rules={[
                    {
                      required: true,
                      message: "Please enter amount of credits",
                    },
                  ]}
                >
                  <InputNumber
                    disabled={initialValues.credits === null}
                    placeholder="Enter credits"
                    // prefix={<TeamOutlined className="text-slate-400" />}
                    className="w-full"
                    min={0}
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
              </Tooltip>
            </Col>
          )}
        </Row>

        <Row className="flex gap-x-[10px] justify-center sm:justify-end mt-6">
          <Button
            onClick={handleClose}
            loading={loading}
            disabled={loading}
            className=" font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03]"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={loading}
            disabled={loading || isValidating || emailTaken || !isModified}
            htmlType="submit"
            className={`${
              !isValidating && !emailTaken && isModified
                ? "!bg-[#36013F] hover:!bg-[#36013F] hover:scale-[1.03]"
                : "!bg-[gray] hover:!bg-[gray]"
            } !border-none !text-white font-medium rounded-lg shadow-sm transition-all duration-200`}
          >
            Save Changes
          </Button>
        </Row>
      </Form>
      <Modal
        keyboard={false}
        title={`Select Package for ${initialValues?.first_name} ${initialValues?.last_name}`}
        open={isPackagesModalOpen}
        onCancel={handleClosePackagesModal}
        width={600}
        destroyOnHidden={true}
        maskClosable={false}
        footer={
          <Row className="gap-[10px] flex flex-row justify-end">
            <Button disabled={addingPackage} loading={addingPackage}>
              Cancel
            </Button>
            <Button
              loading={addingPackage}
              disabled={addingPackage}
              onClick={handleAddPackage}
              className={`bg-[#36013F] hover:!bg-[#36013F] !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03]`}
            >
              Add
            </Button>
          </Row>
        }
      >
        <Row className="w-full flex flex-col">
          <Row className="flex flex-col">
            <Text>Package</Text>
            <Select
              disabled={addingPackage}
              placeholder={`Select`}
              className="w-[50%]"
              options={packages}
              onSelect={(_, record) => setSelectedPackage(record)}
            />
          </Row>
        </Row>
      </Modal>
    </>
  );
};

export default EditClientForm;
