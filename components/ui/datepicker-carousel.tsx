import React, { useState, useMemo, useEffect, useRef } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Row } from "antd";
import dayjs, { Dayjs } from "dayjs";
import clsx from "clsx";

interface DatePickerCarouselProps {
  isAdmin: boolean;
  initialDate?: Dayjs;
  onDateSelect?: (date: Dayjs | string) => void;
  maxDaysAhead?: number;
}

const DatePickerCarousel: React.FC<DatePickerCarouselProps> = ({
  isAdmin = false,
  initialDate = dayjs(),
  onDateSelect,
  maxDaysAhead = 14,
}) => {
  const today = dayjs().startOf("day");
  const [currentDate, setCurrentDate] = useState(initialDate.startOf("day"));
  const [selectedDate, setSelectedDate] = useState(initialDate.startOf("day"));
  const [daysToShow, setDaysToShow] = useState<number>(7);

  // 🧠 Responsive behavior
  useEffect(() => {
    const updateDaysToShow = () => {
      if (window.innerWidth < 640) {
        setDaysToShow(3);
      } else {
        setDaysToShow(7);
      }
    };

    let rafId: number | null = null;
    const onResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateDaysToShow();
      });
    };

    updateDaysToShow();
    window.addEventListener("resize", onResize);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const onDateSelectRef = useRef<typeof onDateSelect>(onDateSelect);
  useEffect(() => {
    onDateSelectRef.current = onDateSelect;
  }, [onDateSelect]);

  useEffect(() => {
    onDateSelectRef.current?.(dayjs(selectedDate).toISOString());
  }, [selectedDate]);

  // 🔁 Generate range of dates to display
  const dates = useMemo(() => {
    const startOfRange = currentDate.startOf("day");
    return Array.from({ length: daysToShow }, (_, i) =>
      startOfRange.add(i, "day")
    );
  }, [currentDate, daysToShow]);

  // ⏪ Previous week
  const handlePrev = () => {
    const newDate = currentDate.subtract(daysToShow, "day"); // move back by visible range
    if (!isAdmin && newDate.isBefore(today, "day")) return;
    setCurrentDate(newDate);
    setSelectedDate(newDate.startOf("day")); // select first date in new range
  };

  // ⏩ Next week
  const handleNext = () => {
    const newDate = currentDate.add(daysToShow, "day"); // move forward by visible range
    if (newDate.diff(today, "day") >= maxDaysAhead) return;
    setCurrentDate(newDate);
    setSelectedDate(newDate.startOf("day")); // select first date in new range
  };
  const handleSelect = (date: Dayjs) => {
    if (!isAdmin && date.isBefore(today, "day")) return;
    setSelectedDate(date);
  };

  const isPrevDisabled = !isAdmin && currentDate.isSame(today, "day");
  const isNextDisabled =
    currentDate.diff(today, "day") + daysToShow >= maxDaysAhead;

  return (
    <Row
      wrap={false}
      className="flex items-center justify-center gap-[20px] bg-transparent p-4 rounded-xl w-full mx-auto"
    >
      {/* Left Arrow */}
      <Button
        shape="circle"
        icon={<LeftOutlined />}
        className="flex items-center justify-center border-gray-300"
        onClick={handlePrev}
        disabled={isPrevDisabled}
      />

      {/* Date Cards */}
      <Row
        wrap={false}
        className="flex flex-row items-center gap-2 overflow-x-auto scrollbar-hide justify-center sm:justify-start py-2"
      >
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
                "w-20 sm:w-24 md:w-28",
                isSelected ? "bg-[#36013F] text-white" : "bg-white text-black",
                !isAdmin &&
                  isPast &&
                  "opacity-40 cursor-not-allowed hover:shadow-none"
              )}
            >
              <span
                className={clsx(
                  "text-[10px] sm:text-sm",
                  isSelected ? "text-white/80" : "text-gray-600"
                )}
              >
                {date.format("ddd")}
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold leading-none">
                {date.format("DD")}
              </span>
            </div>
          );
        })}
      </Row>

      {/* Right Arrow */}
      <Button
        shape="circle"
        icon={<RightOutlined />}
        className="flex items-center justify-center border-gray-300"
        onClick={handleNext}
        disabled={isNextDisabled}
      />
    </Row>
  );
};

export default DatePickerCarousel;
