import React, { useState, useMemo, useEffect } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import dayjs, { Dayjs } from "dayjs";
import clsx from "clsx";

interface DatePickerCarouselProps {
  initialDate?: Dayjs;
  onDateSelect?: (date: Dayjs | string) => void;
  maxDaysAhead?: number; // limit how far ahead users can scroll
}

const DatePickerCarousel: React.FC<DatePickerCarouselProps> = ({
  initialDate = dayjs(), // default to today
  onDateSelect,
  maxDaysAhead = 30,
}) => {
  const today = dayjs().startOf("day");
  const [currentDate, setCurrentDate] = useState(initialDate.startOf("day"));
  const [selectedDate, setSelectedDate] = useState(initialDate.startOf("day"));
  const [daysToShow, setDaysToShow] = useState<number>(7); // default for desktop

  // 🧠 Responsive behavior
  useEffect(() => {
    const updateDaysToShow = () => {
      if (window.innerWidth < 640) {
        setDaysToShow(4); // mobile
      } else {
        setDaysToShow(7); // desktop/tablet
      }
    };

    updateDaysToShow();
    window.addEventListener("resize", updateDaysToShow);
    return () => window.removeEventListener("resize", updateDaysToShow);
  }, []);

  const dates = useMemo(() => {
    const startOfRange = currentDate.startOf("day");
    return Array.from({ length: daysToShow }, (_, i) =>
      startOfRange.add(i, "day")
    );
  }, [currentDate, daysToShow]);

  const handlePrev = () => {
    const newDate = currentDate.subtract(1, "day");
    if (newDate.isBefore(today, "day")) return;
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = currentDate.add(1, "day");
    if (newDate.diff(today, "day") >= maxDaysAhead) return;
    setCurrentDate(newDate);
  };

  const handleSelect = (date: Dayjs) => {
    if (date.isBefore(today, "day")) return;
    setSelectedDate(date);
    onDateSelect?.(dayjs(date).toISOString());
  };

  const isPrevDisabled = currentDate.isSame(today, "day");
  const isNextDisabled = currentDate.diff(today, "day") >= maxDaysAhead;

  return (
    <div className="flex items-center justify-center gap-2 bg-[#F5F7FB] p-4 rounded-xl w-full max-w-4xl mx-auto">
      {/* Left Arrow */}
      <Button
        shape="circle"
        icon={<LeftOutlined />}
        className="flex items-center justify-center border-gray-300"
        onClick={handlePrev}
        disabled={isPrevDisabled}
      />

      {/* Date Cards */}
      <div className="flex flex-row wrap-none items-center gap-2 overflow-x-auto scrollbar-hide w-full justify-center sm:justify-start">
        {dates.map((date) => {
          const isSelected = date.isSame(selectedDate, "day");
          const isPast = date.isBefore(today, "day");

          return (
            <div
              key={date.format("YYYY-MM-DD")}
              onClick={() => handleSelect(date)}
              className={clsx(
                "flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200",
                "rounded-2xl shadow-sm hover:shadow-md py-3 sm:py-4",
                "w-20 sm:w-24 md:w-28", // responsive width
                isSelected ? "bg-black text-white" : "bg-white text-black",
                isPast && "opacity-40 cursor-not-allowed hover:shadow-none"
              )}
            >
              <span
                className={clsx(
                  "text-[10px] sm:text-xs font-semibold",
                  isSelected ? "text-white/80" : "text-gray-500"
                )}
              >
                {date.format("MMM").toUpperCase()}
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold leading-none">
                {date.format("DD")}
              </span>
              <span
                className={clsx(
                  "text-[10px] sm:text-sm",
                  isSelected ? "text-white/80" : "text-gray-600"
                )}
              >
                {date.format("ddd")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      <Button
        shape="circle"
        icon={<RightOutlined />}
        className="flex items-center justify-center border-gray-300"
        onClick={handleNext}
        disabled={isNextDisabled}
      />
    </div>
  );
};

export default DatePickerCarousel;
