"use client";

import { Card, Row, Col, Statistic, Typography, Segmented } from "antd";
import { CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import AdminAuthenticatedLayout from "@/components/layout/AdminAuthenticatedLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { useDispatch } from "react-redux";
import { setClickedDashboardDate } from "@/lib/features/paramSlice";
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
  const router = useRouter();
  const dispatch = useDispatch();

  const [classes, setClasses] = useState<any[]>([]);
  const [dashboardKPI, setDashboardKPI] = useState<any>({
    totalClasses: 0,
    confirmedBookings: 0,
  });
  const { fetchClasses, loading } = useClassManagement();
  const monday = useMemo(
    () => dayjs().startOf("isoWeek").format("YYYY-MM-DD"),
    []
  );
  const sunday = useMemo(
    () => dayjs().endOf("isoWeek").format("YYYY-MM-DD"),
    []
  );
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
      params = { selectedDate: dayjs(), isAdmin: true };
    }

    const data = await fetchClasses(params);
    if (data) {
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
          classDate: item.class_date,
        }));
      } else {
        mapped = formatClassesForChart(data);
      }

      setDashboardKPI({
        totalClasses: mapped.length,
        confirmedBookings: data.reduce(
          (acc: number, curr: any) => acc + curr.class_bookings.length,
          0
        ),
      });

      setClasses(mapped);
    }
  };

  const formatDecimalHour = (decimal: number) => {
    const hour = Math.floor(decimal);
    const minutes = Math.round((decimal - hour) * 60);

    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const paddedMinutes = minutes.toString().padStart(2, "0");

    return `${displayHour}:${paddedMinutes} ${suffix}`;
  };

  const DailyGanttChart = useCallback(() => {
    // Labels on the Y-axis — each activity name
    const labels = classes?.map((a) => a.label) ?? [];

    // Row metrics
    const CANDLE_HEIGHT = 40; // desired candle height in px
    const ROW_GAP = 1; // gap between rows in px
    const ROW_HEIGHT = CANDLE_HEIGHT + ROW_GAP; // total per-row required height
    const MIN_CANVAS_HEIGHT = 460; // keep your previous minimum

    // compute height needed to display all rows at 30px each (plus a little padding)
    const computedHeight = Math.max(
      MIN_CANVAS_HEIGHT,
      labels.length * ROW_HEIGHT + 20
    );

    const data = {
      labels,
      datasets: [
        {
          label: "Daily Schedule",
          data:
            classes?.map((a) => ({
              x: [a.start, a.end],
              y: a.label,
            })) ?? [],
          backgroundColor: classes?.map((a) => a.color) ?? [],
          borderRadius: 8,
          borderSkipped: false,
          barThickness: CANDLE_HEIGHT,
          maxBarThickness: CANDLE_HEIGHT,
          categoryPercentage: 1,
          barPercentage: 1,
        },
      ],
    };

    const options: any = {
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,

      // Detect click on a bar/candle
      onClick: () => {
        router.push("/admin/class-management");
      },

      // Make cursor pointer when hovering
      onHover: (event: any, elements: any[]) => {
        if (elements.length > 0) {
          event.native.target.style.cursor = "pointer";
        } else {
          event.native.target.style.cursor = "default";
        }
      },

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
              const startTime = formatDecimalHour(start);
              const endTime = formatDecimalHour(end);

              return `${startTime} - ${endTime}`;
            },
          },
        },
      },
    };

    return (
      <div style={{ width: "100%", height: computedHeight, padding: 12 }}>
        <div
          style={{ height: computedHeight - 40 /* inner padding reserve */ }}
        >
          <Bar data={data} options={options} />
        </div>
      </div>
    );
  }, [classes]);

  const WeeklyScheduleChart = useCallback(() => {
    const dataPoints = classes?.map((ev) => ({
      x: ev.day,
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

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (_, elements: any[]) => {
        if (elements.length > 0) {
          const element = elements[0];
          const index = element.index;
          const clicked = classes[index];

          console.log("Clicked candle:", clicked);
          dispatch(setClickedDashboardDate(clicked.classDate));
          router.push("/admin/class-management");
        }
      },
      onHover: (event: any, elements: any[]) => {
        if (elements.length > 0) {
          event.native.target.style.cursor = "pointer";
        } else {
          event.native.target.style.cursor = "default";
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (ctx: any) => ctx[0]?.raw?.label ?? "",
            label: (ctx: any) => {
              const raw = ctx.raw as any;
              if (!raw || !raw.y) return "";

              const [start, end] = raw.y;
              const startTime = formatDecimalHour(start);
              const endTime = formatDecimalHour(end);

              return `${startTime} - ${endTime}`;
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
  }, [classes]);

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
