import { clsx, type ClassValue } from "clsx";
import { Dayjs } from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
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
  return dateTime.format("HH:mm A");
};
