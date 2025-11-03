"use client";

import { Card, Row, Col, Statistic, Typography, Segmented } from "antd";
import { CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import React, { useEffect, useState } from "react";
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
import { useClassManagement } from "@/lib/api";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  daysOfWeek,
  formatClassesForChart,
  ganttColors,
  timeToDecimal,
} from "@/lib/utils";
dayjs.extend(isoWeek);

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
  const [dashboardKPI, setDashboardKPI] = useState<any>({
    totalClasses: 0,
    confirmedBookings: 0,
  });
  const [classes, setClasses] = useState<any[]>([]);
  const { fetchClasses, loading } = useClassManagement();
  const monday = dayjs().startOf("isoWeek").format("YYYY-MM-DD");
  const sunday = dayjs().endOf("isoWeek").format("YYYY-MM-DD");
  const [dashboardPeriod, setDashboardPeriod] = useState<"Daily" | "Weekly">(
    "Daily"
  );

  useEffect(() => {
    handleFetchClasses();
  }, [dashboardPeriod]);

  const handleFetchClasses = async () => {
    let params: any = {};

    if (dashboardPeriod === "Weekly") {
      params = {
        startDate: dayjs(monday),
        endDate: dayjs(sunday),
      };
    } else {
      params = { selectedDate: dayjs() };
    }

    const data = await fetchClasses(params);

    if (data) {
      //  {
      //   label: "Launching new features",
      //   day: "Wed",
      //   startTime: "11:00",
      //   endTime: "15:45",
      //   color: "#f9a8d4",
      // },
      let mapped;
      if (dashboardPeriod === "Weekly") {
        mapped = data?.map((item: any, index: number) => ({
          id: item.id,
          label: `Class with ${item.instructor_name}`,
          day: dayjs(item.class_date).format("ddd"),
          startTime: dayjs(item.start_time).format("HH:mm"),
          endTime: dayjs(item.end_time).format("HH:mm"),
          slots: `${item.taken_slots} / ${item.available_slots}`,
          color: ganttColors[index],
        }));
      } else {
        mapped = formatClassesForChart(data);
      }

      setDashboardKPI({
        totalClasses: mapped.length,
        confirmedBookings: mapped.reduce(
          (acc: number, curr: any) => acc + curr.taken_slots,
          0
        ),
      });

      setClasses(mapped);
    }
  };

  const DailyGanttChart = () => {
    // Labels on the Y-axis — each activity name
    const labels = classes?.map((a) => a.label);

    const data = {
      labels,
      datasets: [
        {
          label: "Daily Schedule",
          data: classes?.map((a) => ({
            x: [a.start, a.end],
            y: a.label,
          })),
          backgroundColor: classes?.map((a) => a.color),
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.8,
        },
      ],
    };

    const options: any = {
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear" as const,
          min: 7,
          max: 22,
          ticks: {
            stepSize: 1,
            callback: (value: number) => {
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
          type: "category" as const,
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
    const dataPoints = classes?.map((ev) => ({
      x: ev.day, // <-- use 'Wed' / 'Thu' etc. (string), not numeric index
      y: [timeToDecimal(ev.startTime), timeToDecimal(ev.endTime)],
      label: ev.label,
    }));

    const backgroundColors = classes?.map((ev) => ev.color);

    const data = {
      labels: daysOfWeek,
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
          labels: daysOfWeek,
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
                value={dashboardKPI.totalClasses}
                prefix={<CalendarOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1e293b" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Confirmed Bookings"
                value={dashboardKPI.confirmedBookings}
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
