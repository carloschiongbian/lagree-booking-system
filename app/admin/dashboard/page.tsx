"use client";

import { Card, Row, Col, Statistic, Typography, Segmented } from "antd";
import { CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import React, { useState } from "react";
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
  const [dashboardPeriod, setDashboardPeriod] = useState<"Daily" | "Weekly">(
    "Daily"
  );
  const DailyGanttChart = () => {
    const activities = [
      { label: "Event Planning", start: 7, end: 10.9, color: "#93c5fd" },
      { label: "Layout Logistics", start: 10, end: 13, color: "#f9a8d4" },
      { label: "Select Vendors", start: 13, end: 16, color: "#fcd34d" },
      { label: "Hire Venue", start: 16, end: 18, color: "#d8b4fe" },
      { label: "Marketing", start: 18, end: 21, color: "#86efac" },
    ];

    // Labels on the Y-axis — each activity name
    const labels = activities.map((a) => a.label);

    const data = {
      labels,
      datasets: [
        {
          label: "Daily Schedule",
          data: activities.map((a) => ({
            x: [a.start, a.end], // start and end hours
            y: a.label, // the activity name
          })),
          backgroundColor: activities.map((a) => a.color),
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.8,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          min: 7,
          max: 22,
          ticks: {
            stepSize: 1,
            callback: (v: string | number) => {
              const value = Number(v);
              const hour = Math.floor(value);
              const suffix = hour >= 12 ? "PM" : "AM";
              const displayHour = hour % 12 || 12;
              return `${displayHour} ${suffix}`;
            },
          },
          grid: { color: "#e5e7eb" },
          title: {
            display: true,
            color: "#374151",
          },
        },
        y: {
          type: "category",
          grid: { display: false },
          ticks: {
            color: "#374151",
            font: { size: 13 },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const [start, end] = ctx.raw.x;
              return `${start}:00 - ${end}:00`;
            },
          },
        },
      },
    };

    return (
      <div style={{ width: "100%", height: 500, padding: 12 }}>
        <div style={{ height: 460 }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    );
  };

  const WeeklyScheduleChart = () => {
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
      {
        label: "Workshop",
        day: "Wed",
        startTime: "08:30",
        endTime: "10:00",
        color: "#93c5fd",
      },
    ];

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const timeToDecimal = (t: string) => {
      const [hh, mm] = t.split(":").map(Number);
      return hh + mm / 60;
    };

    // IMPORTANT: use the exact day string here (must match the labels array items)
    const dataPoints = events.map((ev) => ({
      x: ev.day, // <-- use 'Wed' / 'Thu' etc. (string), not numeric index
      y: [timeToDecimal(ev.startTime), timeToDecimal(ev.endTime)],
      label: ev.label,
    }));

    const backgroundColors = events.map((ev) => ev.color);

    const data = {
      labels: days,
      datasets: [
        {
          label: "Schedule",
          data: dataPoints,
          parsing: { xAxisKey: "x", yAxisKey: "y" },
          backgroundColor: backgroundColors,
          borderRadius: 5,
          borderSkipped: false,
          // Thicker candles:
          barThickness: 44, // fixed thickness in px
          maxBarThickness: 56, // upper bound
          categoryPercentage: 0.9,
        },
      ],
    };

    // uncomment to verify the shape at runtime
    // console.log("chart data", data);

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
          offset: true,
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
      elements: {
        bar: {
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
          <Segmented
            defaultValue={dashboardPeriod}
            options={["Daily", "Weekly"]}
            onChange={(e) => setDashboardPeriod(e as "Daily" | "Weekly")}
          />
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={
                  dashboardPeriod === "Daily"
                    ? "Total Classes Today"
                    : "Total Classes This Week"
                }
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
        </Row>

        <Card
          className="shadow-sm hover:shadow-md transition-shadow"
          title={
            dashboardPeriod === "Daily"
              ? "Today's Schedule"
              : "This Week's Schedule"
          }
          styles={{ header: { border: "none" }, body: { padding: 0 } }}
        >
          {dashboardPeriod === "Daily" && <DailyGanttChart />}
          {dashboardPeriod === "Weekly" && <WeeklyScheduleChart />}
        </Card>
      </div>
    </AdminAuthenticatedLayout>
  );
}
