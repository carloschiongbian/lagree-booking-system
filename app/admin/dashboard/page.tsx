"use client";
export const dynamic = "force-dynamic";

import { Card, Row, Col, Statistic, Typography, Grid } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import React, { useMemo } from "react";
import { Bar } from "@ant-design/plots";

const { Title } = Typography;

export default function DashboardPage() {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const formatHour = (hourValue: number) => {
    const wholeHours = Math.floor(hourValue);
    const minutes = Math.round((hourValue - wholeHours) * 60);
    const hh = String(wholeHours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // Example activities for the current day. Replace with real data as needed.
  const activities = useMemo(
    () => [
      { activity: "Breakfast", start: 7, end: 8 },
      { activity: "Commute", start: 8, end: 9 },
      { activity: "Work — Focus Block", start: 9, end: 12 },
      { activity: "Lunch", start: 12, end: 13 },
      { activity: "Work — Meetings", start: 13, end: 16 },
      { activity: "Gym", start: 18, end: 19.5 },
      { activity: "Leisure", start: 20, end: 22 },
    ],
    []
  );

  const data = useMemo(
    () => activities.map((a) => ({ activity: a.activity, range: [a.start, a.end] })),
    [activities]
  );

  const config = useMemo(
    () => ({
      data,
      isRange: true,
      xField: "range",
      yField: "activity",
      autoFit: true,
      height: isMobile ? 280 : 360,
      padding: [16, 24, 48, 120],
      legend: false,
      tooltip: {
        formatter: (datum: { activity: string; range: [number, number] }) => {
          return {
            name: datum.activity,
            value: `${formatHour(datum.range[0])} — ${formatHour(datum.range[1])}`,
          };
        },
      },
      xAxis: {
        position: "bottom",
        title: { text: "Hours" },
        min: 0,
        max: 24,
        nice: false,
        tickCount: 25,
        tickInterval: 1,
        label: {
          autoHide: false,
          formatter: (v: string | number) => {
            const num = Number(v);
            return `${String(Math.floor(num)).padStart(2, "0")}:00`;
          },
        },
      },
      yAxis: {
        title: { text: "Activity" },
      },
      // Make sure the scale covers the full day explicitly
      meta: {
        range: { min: 0, max: 24 },
      },
      barStyle: {
        radius: [4, 4, 4, 4],
      },
    }),
    [data, isMobile]
  );

  return (
    <AdminAuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <Title level={2} className="!mb-2">
            Dashboard
          </Title>
          <p className="text-slate-600">Welcome to your booking dashboard</p>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Total Bookings"
                value={12}
                prefix={<CalendarOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Confirmed"
                value={8}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Pending"
                value={4}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          className="shadow-sm hover:shadow-md transition-shadow"
          title="Today's Activities (Gantt)"
          bodyStyle={{ paddingTop: 8 }}
        >
          <Bar {...config} />
        </Card>
      </div>
    </AdminAuthenticatedLayout>
  );
}
