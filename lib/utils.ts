import { clsx, type ClassValue } from "clsx";
import dayjs, { Dayjs, isDayjs } from "dayjs";
import { twMerge } from "tailwind-merge";
import { ChartData } from "./props";
import { Day } from "react-day-picker";

export const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const attendanceStatus: any = {
  attended: "Attended",
  cancelled: "Cancelled",
  missed: "Missed",
};
export const ganttColors = [
  "#F28B82", // Muted Coral
  "#FDD663", // Soft Honey Yellow
  "#A8E6A3", // Gentle Mint
  "#9EC5E7", // Powder Blue
  "#C6B6F3", // Soft Lavender
  "#F9C7B4", // Warm Blush
  "#AEE6E4", // Pale Aqua
];

function formatDailyTime(time: string): number {
  const t = dayjs(time);
  const hours = t.hour();
  const minutes = t.minute();
  return parseFloat((hours + minutes / 60).toFixed(2));
}

/**
 * Converts class records to chart-friendly data.
 */
export function formatClassesForChart(data: any[]): ChartData[] {
  return data.map((item, index) => ({
    label: `Class with ${item.instructor_name}`,
    start: formatDailyTime(item.start_time),
    end: formatDailyTime(item.end_time),
    color: ganttColors[index],
  }));
}

export const timeToDecimal = (t: string) => {
  if (!t) return;
  if (t?.toString().includes(".")) return "";
  const [hh, mm] = t.split(":").map(Number);
  return hh + mm / 60;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  value: number | string,
  options: {
    decimals?: number;
    locale?: string;
  } = {}
): string {
  const { decimals = 0, locale = "en-US" } = options;

  // Convert to number safely
  const num = Number(value);
  if (isNaN(num)) return "0";

  // Use Intl.NumberFormat for consistent locale-based formatting
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export const formatTime = (dateTime: Dayjs) => {
  return dateTime.format("hh:mm A");
};

export const calculateDuration = (start: Dayjs, end: Dayjs): string => {
  let endTime = isDayjs(end) ? end : dayjs(end);
  let startTime = isDayjs(start) ? start : dayjs(start);

  if (endTime.isBefore(startTime)) {
    endTime = endTime.add(1, "day");
  }

  const diffInMinutes = endTime.diff(startTime, "minute");
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

export const getSlotsLeft = (
  availableSlots: number,
  takenSlots: number
): number => {
  const slotsLeft = availableSlots - takenSlots;
  return slotsLeft > 0 ? slotsLeft : 0;
};

export function decimalToMilitaryTime(decimalHour: number): string {
  const hours = Math.floor(decimalHour);
  const minutes = Math.round((decimalHour - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}
