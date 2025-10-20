"use client";
export const dynamic = "force-dynamic";

import { Card, Row, Col, Statistic, Typography, Grid, Segmented } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const { Title } = Typography;

type EventItem = {
  label: string;
  day: string;
  startTime: string;
  endTime: string;
  color: string;
};

export default function DashboardPage() {
  const GanttChart = () => {
    const activities = [
      { name: "Event Planning", start: 7, end: 10 },
      { name: "Layout Logistics", start: 9, end: 13 },
      { name: "Select Vendors", start: 13, end: 16 },
      { name: "Hire Venue", start: 15, end: 18 },
      { name: "Marketing", start: 17, end: 21 },
    ];

    const labels = activities.map((a) => a.name);

    const data = {
      labels,
      datasets: [
        {
          label: "Schedule",
          data: activities.map((a) => ({
            x: [a.start, a.end],
            y: a.name,
          })),
          backgroundColor: "#733AC6",
          // borderRadius: 10,
          barPercentage: 0.5,
        },
      ],
    };

    const options = {
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear" as const,
          min: 9,
          max: 22,
          ticks: {
            stepSize: 1,
            callback: (value: number) => {
              const hour = dayjs().hour(value).minute(0);
              return hour.format("h A"); // e.g. 7 AM, 8 AM
            },
          },
          title: {
            display: true,
          },
        },
        y: {
          title: {
            display: true,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const [start, end] = context.raw.x;
              return `${start}:00 - ${end}:00`;
            },
          },
        },
      },
    };

    return (
      <div className="w-full h-[500px]">
        <Bar data={data} options={options} />
      </div>
    );
  };

  const WeeklyScheduleChart: React.FC = () => {
    const events: EventItem[] = [
      {
        label: "Launching new features",
        day: "Wed",
        startTime: "11:00",
        endTime: "15:45",
        color: "#f9a8d4",
      },
      {
        label: "Meeting with Nami",
        day: "Thu",
        startTime: "13:30",
        endTime: "15:00",
        color: "#fcd34d",
      },
      {
        label: "Meeting with Helen",
        day: "Fri",
        startTime: "13:45",
        endTime: "15:30",
        color: "#d8b4fe",
      },
      // Add a second event same day to verify stacking/visibility
      {
        label: "Workshop",
        day: "Wed",
        startTime: "08:30",
        endTime: "10:00",
        color: "#93c5fd",
      },
    ];

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // convert "HH:mm" -> decimal hours
    const timeToDecimal = (t: string) => {
      const [hh, mm] = t.split(":").map(Number);
      return hh + mm / 60;
    };

    // map day string to numeric category index (0..6)
    const dayIndex = (d: string) =>
      Math.max(0, Math.min(days.length - 1, days.indexOf(d)));

    // Build data points: x = numeric category index, y = [start, end]
    const dataPoints = events.map((ev) => ({
      x: dayIndex(ev.day),
      y: [timeToDecimal(ev.startTime), timeToDecimal(ev.endTime)],
      label: ev.label,
    }));

    // backgroundColor array in the same order as data points
    const backgroundColors = events.map((ev) => ev.color);

    const data = {
      labels: days,
      datasets: [
        {
          label: "Schedule",
          data: dataPoints,
          // Use parsing to tell Chart.js which properties to read for axes
          parsing: { xAxisKey: "x", yAxisKey: "y" },
          backgroundColor: backgroundColors,
          borderRadius: 8,
          borderSkipped: false,
          // Thickness controls — tuned for a "calendar block" feel
          barThickness: 28, // fixed thickness (px)
          maxBarThickness: 36,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (ctx: any) => ctx[0]?.raw?.label ?? "",
            label: (ctx: any) => {
              const raw = ctx.raw as any;
              if (!raw || !raw.y) return "";
              const [s, e] = raw.y as number[];
              const fmt = (h: number) => {
                const hh = Math.floor(h);
                const mm = Math.round((h % 1) * 60);
                return `${String(hh).padStart(2, "0")}:${String(mm).padStart(
                  2,
                  "0"
                )}`;
              };
              return `${fmt(s)} — ${fmt(e)}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "category",
          labels: days,
          offset: true, // helps center bars on ticks
          grid: { display: false },
          ticks: { color: "#374151", font: { size: 13 } },
        },
        y: {
          type: "linear",
          position: "left",
          min: 7,
          max: 22,
          ticks: {
            stepSize: 1,
            callback: (v) => {
              const hour = Math.floor(Number(v));
              const suffix = hour >= 12 ? "PM" : "AM";
              const displayHour = hour % 12 || 12;
              return `${displayHour}:00 ${suffix}`;
            },
          },
          grid: { color: "#e5e7eb" },
        },
      },
      // ensure bars are not grouped (we're using one dataset)
      elements: {
        bar: {
          // fallback color if something goes wrong
          backgroundColor: "#60a5fa",
        },
      },
    };

    return (
      <div style={{ width: "100%", height: 520, padding: 12 }}>
        <div style={{ height: 460 }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    );
  };

  return (
    <AdminAuthenticatedLayout>
      <div className="space-y-6">
        <Row wrap={false} className="justify-between items-center">
          <Title level={2} className="!mb-2">
            Dashboard
          </Title>
          <Segmented options={["Daily", "Weekly"]} />
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Total Classes"
                value={12}
                prefix={<CalendarOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Confirmed Bookings"
                value={8}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col>
          {/* <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Pending"
                value={4}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col> */}
        </Row>

        <Card
          className="shadow-sm hover:shadow-md transition-shadow"
          title="Today's Classes"
          styles={{ header: { border: "none" }, body: { padding: 0 } }}
        >
          {/* <GanttChart /> */}

          {/* daily view?  */}
          <WeeklyScheduleChart />
        </Card>
      </div>
    </AdminAuthenticatedLayout>
  );
}
