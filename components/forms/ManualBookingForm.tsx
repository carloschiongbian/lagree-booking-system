"use client";

import {
  Form,
  Select,
  Button,
  Row,
  Col,
  Input,
  Tabs,
  AutoCompleteProps,
  AutoComplete,
  Spin,
  Typography,
  Tooltip,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { CreateClassProps } from "@/lib/props";
import { MdOutlineSchedule } from "react-icons/md";
import { useSearchUser } from "@/lib/api";
import useDebounce from "@/hooks/use-debounce";

interface CreateManualBookingFormProps {
  selectedDate?: Dayjs;
  classes: any[];
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: CreateClassProps | null;
  clearSignal?: boolean;
}

const { Text } = Typography;

type FormType = "walk-in" | "existing";

export default function ManualBookingForm({
  selectedDate,
  classes,
  onSubmit,
  onCancel,
  loading = false,
  initialValues = null,
  clearSignal,
}: CreateManualBookingFormProps) {
  const [form] = Form.useForm();
  const [formTab, setFormTab] = useState<FormType>("walk-in");
  const [schedules, setSchedules] = useState<any>([]);
  const [schedulesCopy, setSchedulesCopy] = useState<any>([]);

  const [selectedExistingClient, setSelectedExistingClient] =
    useState<any>(null);
  const [searchedClient, setSearchedClient] = useState("");
  const [options, setOptions] = useState<AutoCompleteProps["options"]>([]);
  const { searchClients, loading: searchingClients } = useSearchUser();

  const { debouncedValue, loading: debouncing } = useDebounce(
    searchedClient,
    500,
  );

  useEffect(() => {
    handleParseClasses({ tab: formTab });
  }, [selectedDate, classes, selectedDate]);

  useEffect(() => {
    form.resetFields();
  }, [onCancel]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        instructor: initialValues.instructor_id,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form, classes, selectedDate]);

  useEffect(() => {
    if (!!debouncedValue.length) {
      handleSearchClient();
    } else {
      handleChangeClient();
    }
  }, [debouncedValue]);

  const onSelect = (data: any) => {
    setSelectedExistingClient(data);
    handleParseClasses({ existingClient: data });
  };

  const handleSearchClient = async () => {
    const clients = await searchClients({ name: debouncedValue });
    const mapped = clients?.map((client: any) => {
      const credits = client.user_credits?.[0]?.credits;
      return {
        key: client.id,
        id: client.id,
        classBookings: client.class_bookings,
        firstName: client.first_name,
        lastName: client.last_name,
        fullName: `${client.first_name} ${client.last_name}`,
        value: `${client.first_name} ${client.last_name} ${
          credits === 0
            ? "(No Credits Available)"
            : `(${
                credits === null ? "Unlimited" : `${credits}`
              } credits available)`
        }`,
        disabled: credits === 0,
        credits: credits,
      };
    });
    setOptions(mapped);
  };

  const handleParseClasses = async ({
    existingClient,
    tab = formTab,
  }: {
    existingClient?: any;
    tab?: FormType;
  }) => {
    const now = dayjs();
    let mapped: any = [];

    if (tab === "walk-in") {
      mapped = classes
        .filter((cls) => dayjs(cls.start_time).isAfter(now))
        .map((cls, key) => ({
          value: cls.id,
          label: `${cls.instructor_name} (${dayjs(cls.start_time).format(
            "hh:mm A",
          )} - ${dayjs(cls.end_time).format("hh:mm A")})`,
          id: cls.instructor_id,
          key,
          takenSlots: cls.taken_slots,
        }));
    }
    if (tab === "existing") {
      let existingClientBookings: string[];

      let filtered: any = [];
      if (existingClient) {
        existingClientBookings =
          existingClient.classBookings.map((x: any) => x.class_id) ?? [];

        filtered = classes.filter(
          (cls) => !existingClientBookings.includes(cls.id),
        );
      } else {
        filtered = classes;
      }

      filtered = filtered.filter((cls: any) =>
        dayjs(cls.start_time).isAfter(now),
      );

      mapped = filtered.map((cls: any, key: number) => ({
        value: cls.id,
        label: `${cls.instructor_name} (${dayjs(cls.start_time).format(
          "hh:mm A",
        )} - ${dayjs(cls.end_time).format("hh:mm A")})`,
        id: cls.instructor_id,
        key,
        takenSlots: cls.taken_slots,
      }));
    }

    setSchedules(mapped);
    setSchedulesCopy(mapped);
  };

  const handleAutoCompleteBlur = () => {
    setSearchedClient("");
    setSelectedExistingClient(null);
    setOptions([]);
  };

  const onInputChange = async (e: any) => {
    setSearchedClient(e);
  };

  const handleChangeClient = () => {
    handleParseClasses({});
    setSearchedClient("");
    setSelectedExistingClient(null);
    setOptions([]);
  };

  const handleFinish = (data: any) => {
    const values = form.getFieldsValue();

    const found = schedules.find(
      (item: any) => item.value === values.class_schedule,
    );
    const formattedValues = {
      ...values,
      taken_slots: found.takenSlots,
      class_id: values.class_schedule,
      class_date: selectedDate,
      bookingType: formTab,
      ...(selectedExistingClient && {
        existingClientRecord: selectedExistingClient,
      }),
    };
    onSubmit(formattedValues);
    form.resetFields();
  };

  const handleTabSwitch = (e: FormType | string) => {
    if (e === "walk-in") {
      handleParseClasses({ tab: e });
      setSelectedExistingClient(null);
      setSearchedClient("");
      setOptions([]);
    }

    if (e === "existing") {
      handleParseClasses({ tab: e });
    }

    form.resetFields();
    setFormTab(e as FormType);
  };

  const WalkInForm = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark="optional"
        className="w-full"
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={24}>
            <Form.Item
              name="class_schedule"
              label="Class Schedule"
              rules={[
                {
                  required: true,
                  message: "Please select a class schedule",
                },
              ]}
            >
              <Select
                allowClear
                placeholder="Select a class schedule"
                suffixIcon={<MdOutlineSchedule className="text-slate-400" />}
                options={schedulesCopy}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="First Name"
              name="first_name"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input placeholder="First Name" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Last Name"
              name="last_name"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Email"
              name="walk_in_client_email"
              rules={[{ required: true, message: "Please enter an email" }]}
            >
              <Input placeholder="Walk-In Email" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Contact Number"
              name="walk_in_client_contact_number"
              rules={[
                { required: true, message: "Please enter contact number" },
              ]}
            >
              <Input placeholder="Walk-In Number" />
            </Form.Item>
          </Col>
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
                Book
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
  };

  const ExistingForm = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        className="w-full"
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={24}>
            <Form.Item
              name="existing_client"
              label={
                selectedExistingClient === null ? (
                  <Text>
                    Client Name{" "}
                    <span className="text-red-400">
                      (Search and select a client)
                    </span>
                  </Text>
                ) : (
                  <Row wrap={false} className="gap-x-[10px]">
                    <Text>Client Name</Text>
                    <Button size="small" onClick={handleChangeClient}>
                      Change Client
                    </Button>
                  </Row>
                )
              }
              rules={[
                {
                  required: true,
                  message: "Please search and select an existing client",
                },
              ]}
            >
              <AutoComplete
                disabled={selectedExistingClient !== null}
                onBlur={handleAutoCompleteBlur}
                allowClear={!searchingClients}
                options={options}
                onSelect={(_, record) => onSelect(record)}
                value={selectedExistingClient?.fullName}
                onChange={onInputChange}
                placeholder="input here"
                suffixIcon={
                  searchingClients && (
                    <Spin size="small" spinning={searchingClients} />
                  )
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24}>
            <Tooltip
              title={
                selectedExistingClient &&
                !schedulesCopy.length &&
                "Client is already joining every class today."
              }
            >
              <Form.Item
                name="class_schedule"
                label="Class Schedule"
                rules={[
                  {
                    required: true,
                    message: "Please select a class schedule",
                  },
                ]}
              >
                <Select
                  disabled={
                    selectedExistingClient === null ||
                    (selectedExistingClient && !schedulesCopy.length)
                  }
                  allowClear
                  placeholder="Select a class schedule"
                  suffixIcon={<MdOutlineSchedule className="text-slate-400" />}
                  options={schedulesCopy}
                />
              </Form.Item>
            </Tooltip>
          </Col>
        </Row>

        <Form.Item className="mb-0 mt-6">
          <Row gutter={12} className="flex-row justify-end">
            <Col xs={12} sm={8}>
              <Button size="large" onClick={onCancel} disabled={loading} block>
                Cancel
              </Button>
            </Col>
            <Col xs={12} sm={8}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                onClick={handleFinish}
                disabled={selectedExistingClient === null}
                loading={loading}
                block
                className={`${
                  selectedExistingClient && "bg-[#36013F] hover:!bg-[#36013F]"
                } !border-none`}
              >
                Book
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    );
  };

  const items = [
    {
      key: "walk-in",
      label: "Walk-In Client",
      children: WalkInForm(),
    },
    {
      key: "existing",
      label: "Existing Client",
      children: ExistingForm(),
    },
  ];

  return (
    <Tabs defaultActiveKey={formTab} items={items} onChange={handleTabSwitch} />
  );
}
