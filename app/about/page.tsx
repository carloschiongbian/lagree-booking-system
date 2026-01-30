"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Typography,
  Row,
  Col,
  Divider,
  Table,
  Avatar,
  TableColumnsType,
} from "antd";
import { EnvironmentOutlined, UserOutlined } from "@ant-design/icons";
import { supabase } from "@/lib/supabase";
import { Class, Trainer, Schedule, Testimonial } from "@/lib/props";
import { useRouter } from "next/navigation";
import UnauthenticatedLayout from "@/components/layout/UnauthenticatedLayout";
import { useAboutPageData } from "@/lib/api";
import { CERTIFICATION_MAP } from "@/lib/utils";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;

export default function About() {
  const router = useRouter();
  const { fetchPageData, loading } = useAboutPageData();
  const [classes, setClasses] = useState<Class[]>([]);
  const [instructors, setInstructors] = useState<Trainer[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await fetchPageData();

    if (data) {
      const { classesRes, trainersRes, schedulesRes } = data;

      if (classesRes.data) setClasses(classesRes.data);
      if (trainersRes.data) setInstructors(trainersRes.data);
      if (schedulesRes.data) setSchedules(schedulesRes.data);
    }
  };

  const scheduleColumns = useMemo<TableColumnsType<any>>(
    () => [
      {
        title: "Instructor",
        key: "instructor",
        width: "25%",
        render: (record: Schedule) => {
          const fullName = record?.instructors?.user_profiles?.full_name || "";
          return (
            <Row wrap={false} className="items-center gap-x-[10px]">
              <Avatar
                className="border-slate-200 border"
                size={50}
                icon={<UserOutlined />}
                src={record.avatar_path}
              />
              <Text>{fullName}</Text>
            </Row>
          );
        },
      },
      {
        title: "Time",
        key: "time",
        width: "25%",
        render: (record: Schedule) => {
          const start = dayjs(record.start_time).format("hh:mm A");
          const end = dayjs(record.end_time).format("hh:mm A");
          return `${start} - ${end}`;
        },
      },
      {
        title: "Class",
        key: "class",
        width: "25%",
        render: (record: Schedule) => {
          const className = record?.class_name || "";
          return className;
        },
      },
      {
        title: (
          <Row className="flex flex-col" wrap={false}>
            <Text>Slots </Text>
            <span className="!text-[10px] text-gray-400">
              (No. of Attendees / Max Capacity)
            </span>
          </Row>
        ),
        key: "slots",
        width: "25%",
        render: (record: Schedule) => {
          const taken = record.taken_slots;
          const available = record.available_slots;
          return `${taken} / ${available}`;
        },
      },
    ],
    [schedules],
  );

  const daysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  // const sortedSchedules = [...schedules].sort((a, b) => {
  //   const dayDiff =
  //     daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week);
  //   if (dayDiff !== 0) return dayDiff;
  //   return a.start_time.localeCompare(b.start_time);
  // });

  return (
    <UnauthenticatedLayout>
      <section
        style={{
          background: "#fff",
          padding: "300px 40px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Title
            style={{
              fontSize: "3.5rem",
              fontWeight: 300,
              marginBottom: "24px",
              letterSpacing: "0.02em",
            }}
          >
            Welcome to the 8CLUB
          </Title>
          <Paragraph
            style={{
              fontSize: "1.25rem",
              color: "#666",
              lineHeight: 1.8,
              fontWeight: 300,
              margin: 0,
            }}
          >
            Slow. Controlled. Intentional
          </Paragraph>
        </div>
      </section>
      {/* What is Lagree */}
      <section
        id="about"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 40px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Title
            level={2}
            style={{
              fontSize: "2rem",
              fontWeight: 300,
              marginBottom: "48px",
              textAlign: "center",
            }}
          >
            What is Lagree?
          </Title>

          <Paragraph className="text-[1.25rem] font-light mb-12 text-justify">
            <span className="font-bold">
              More than just a workout, Lagree is a method
            </span>
            —a joint-friendly alternative to{" "}
            <span className="font-bold">
              high-impact training that delivers a high-intensity, low-impact,
              full-body workout.
            </span>{" "}
            Performed on the Megaformer, it builds strength, endurance, core
            stability, cardiovascular fitness, balance, and flexibility through
            slow, controlled, resistance-based movement that&apos;s safe on the
            joints.
          </Paragraph>
          <Paragraph className="text-[1.25rem] font-light mb-12 text-justify">
            Each <span className="font-bold">45-minute class</span> follows the
            principle of{" "}
            <span className="font-bold">progressive overload,</span> gradually
            increasing resistance, time, or intensity so the body continuously
            adapts and grows stronger—while supporting fat loss, muscle tone,
            metabolism, mental toughness, and long-term joint health.
          </Paragraph>

          <Row wrap={false} className="flex-col">
            <Text className="text-[1.25rem] font-bold !m-0 text-justify">
              Are you ready to shake, sweat, and sore?
            </Text>
            <Text className="text-[1.25rem] font-bold !m-0 text-justify">
              JOIN THE 8CLUB
            </Text>
          </Row>
        </div>
      </section>
      <Divider style={{ margin: "60px 0", borderColor: "#e8e8e8" }} />
      {/* Classes */}
      {/* <section
        id="classes"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 40px",
        }}
      >
        <Title
          level={2}
          style={{
            fontSize: "2rem",
            fontWeight: 300,
            marginBottom: "48px",
            textAlign: "center",
          }}
        >
          Our Classes
        </Title>

        <Row gutter={[48, 48]}>
          {classes.map((cls) => (
            <Col xs={24} md={12} key={cls.id}>
              <Card
                bordered={false}
                style={{
                  height: "100%",
                  background: "#fff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <Title
                  level={4}
                  style={{ fontWeight: 400, marginBottom: "16px" }}
                >
                  {cls.name}
                </Title>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    display: "block",
                    marginBottom: "16px",
                  }}
                >
                  {cls.intensity_level}
                </Text>
                <Paragraph
                  style={{ color: "#666", lineHeight: 1.8, fontWeight: 300 }}
                >
                  {cls.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
      <Divider style={{ margin: "60px 0", borderColor: "#e8e8e8" }} /> */}
      {/* Trainers */}
      <section
        id="trainers"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 40px",
        }}
      >
        <Title
          level={2}
          style={{
            fontSize: "2rem",
            fontWeight: 300,
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Our Trainers
        </Title>
        <Paragraph
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "48px",
            fontSize: "1rem",
            fontWeight: 300,
          }}
        >
          Expert guidance. Your safety is our priority.
        </Paragraph>

        <Row gutter={[48, 48]}>
          {instructors.map((instructor, index) => (
            <Col xs={24} md={12} key={index}>
              <Card
                style={{
                  height: "100%",
                  background: "#fff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <Row className="flex flex-col" wrap={false} justify={"center"}>
                  <Row wrap={false} justify={"center"}>
                    <Avatar
                      className="border-slate-200 border"
                      size={100}
                      icon={<UserOutlined />}
                      src={instructor.avatar_path}
                    />
                  </Row>
                  <Title
                    level={4}
                    style={{
                      fontWeight: 400,
                      marginBottom: "8px",
                      textAlign: "center",
                    }}
                  >
                    {instructor.full_name}
                  </Title>

                  <Row className="justify-center">
                    <span className="px-3 py-1 bg-[#f5f5f5] rounded text-[0.75rem] text-[#666] w-fit">
                      {
                        CERTIFICATION_MAP[
                          instructor.instructors?.[0]?.certification
                        ]
                      }
                    </span>
                  </Row>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
      <Divider style={{ margin: "60px 0", borderColor: "#e8e8e8" }} />
      {/* Schedule */}
      <section
        id="schedule"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 40px",
        }}
      >
        <Title
          level={2}
          style={{
            fontSize: "2rem",
            fontWeight: 300,
            marginBottom: "5px",
            textAlign: "center",
          }}
        >
          Class Schedule
        </Title>
        <Paragraph
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "0",
            fontSize: "1rem",
            fontWeight: 300,
          }}
        >
          Check out today&apos;s classes
        </Paragraph>
        <Paragraph
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "10px",
            fontSize: "1rem",
            fontWeight: 300,
          }}
        >
          Join our club <span className="text-red-400">for free</span> to join a
          class, and view future schedules
        </Paragraph>

        <div
          style={{
            background: "#fff",
            paddingBlock: "32px",
            borderRadius: "4px",
          }}
        >
          <Table
            loading={loading}
            dataSource={schedules}
            columns={scheduleColumns}
            pagination={false}
            rowKey="id"
            size="small"
            scroll={{ x: 1000 }}
            style={{ fontWeight: 300 }}
            locale={{ emptyText: "No classes have been schedules for today" }}
          />
        </div>
      </section>
      <Divider style={{ margin: "60px 0", borderColor: "#e8e8e8" }} />
      {/* Location */}
      <section
        id="location"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 40px",
        }}
      >
        <Title
          level={2}
          style={{
            fontSize: "2rem",
            fontWeight: 300,
            marginBottom: "48px",
            textAlign: "center",
          }}
        >
          Visit Us
        </Title>

        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <div
              style={{
                background: "#f5f5f5",
                height: 400,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
              }}
            >
              <EnvironmentOutlined style={{ fontSize: "4rem" }} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4} style={{ fontWeight: 400, marginBottom: "24px" }}>
              Streetscape Mall Banilad
            </Title>
            <Paragraph
              style={{
                color: "#666",
                lineHeight: 1.8,
                fontWeight: 300,
                fontSize: "1rem",
              }}
            >
              Maria Luisa Road
              <br />
              Cebu City, Cebu 6000
              <br />
              Philippines
            </Paragraph>
            <Paragraph
              style={{
                color: "#666",
                lineHeight: 1.8,
                fontWeight: 300,
                marginTop: "24px",
              }}
            >
              Located in the walkable Streetscape Mall, surrounded by cafés and
              lifestyle shops. A safe, accessible community space designed for
              wellness.
            </Paragraph>
            <Paragraph
              style={{
                color: "#666",
                lineHeight: 1.8,
                fontWeight: 300,
                marginTop: "16px",
              }}
            >
              Parking available at the mall.
            </Paragraph>
          </Col>
        </Row>
      </section>
      <Divider style={{ margin: "60px 0", borderColor: "#e8e8e8" }} />
      {/* Community / Testimonials */}
      <section
        id="community"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 40px",
        }}
      >
        <Title
          level={2}
          style={{
            fontSize: "2rem",
            fontWeight: 300,
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Our Community
        </Title>
        <Paragraph
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "48px",
            fontSize: "1rem",
            fontWeight: 300,
          }}
        >
          Real stories from real members.
        </Paragraph>

        <Row gutter={[32, 32]}>
          {testimonials.map((testimonial) => (
            <Col xs={24} md={8} key={testimonial.id}>
              <Card
                bordered={false}
                style={{
                  height: "100%",
                  background: "#fff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  textAlign: "center",
                }}
              >
                <Paragraph
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.8,
                    color: "#333",
                    fontStyle: "italic",
                    marginBottom: "16px",
                    fontWeight: 300,
                  }}
                >
                  "{testimonial.quote}"
                </Paragraph>
                <Text
                  style={{
                    fontSize: "0.875rem",
                    color: "#999",
                    fontWeight: 400,
                  }}
                >
                  — {testimonial.client_name}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </UnauthenticatedLayout>
  );
}
