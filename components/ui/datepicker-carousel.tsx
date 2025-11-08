import React, { useState, useMemo, useEffect, useRef } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import dayjs, { Dayjs } from "dayjs";
import clsx from "clsx";

interface DatePickerCarouselProps {
  isAdmin: boolean;
  initialDate?: Dayjs;
  onDateSelect?: (date: Dayjs | string) => void;
  maxDaysAhead?: number; // limit how far ahead users can scroll
}

const DatePickerCarousel: React.FC<DatePickerCarouselProps> = ({
  isAdmin = false,
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
        setDaysToShow(3); // mobile
      } else {
        setDaysToShow(10); // desktop/tablet
      }
    };

    // rAF-throttled resize handler to avoid excessive re-renders
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

  // Keep a stable reference to the latest onDateSelect to avoid effect re-triggers
  const onDateSelectRef = useRef<typeof onDateSelect>(onDateSelect);
  useEffect(() => {
    onDateSelectRef.current = onDateSelect;
  }, [onDateSelect]);

  // Notify parent when selected date changes (once on mount and on user selection)
  useEffect(() => {
    onDateSelectRef.current?.(dayjs(selectedDate).toISOString());
  }, [selectedDate]);

  const dates = useMemo(() => {
    const startOfRange = currentDate.startOf("day");
    return Array.from({ length: daysToShow }, (_, i) =>
      startOfRange.add(i, "day")
    );
  }, [currentDate, daysToShow]);

  const handlePrev = () => {
    const newDate = currentDate.subtract(1, "day");
    if (!isAdmin && newDate.isBefore(today, "day")) return;
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = currentDate.add(1, "day");
    if (newDate.diff(today, "day") >= maxDaysAhead) return;
    setCurrentDate(newDate);
  };

  const handleSelect = (date: Dayjs) => {
    if (!isAdmin && date.isBefore(today, "day")) return;
    setSelectedDate(date);
  };

  const isPrevDisabled = currentDate.isSame(today, "day");
  const isNextDisabled = currentDate.diff(today, "day") >= maxDaysAhead;

  return (
    <div className="flex items-center justify-center gap-2 bg-transparent p-4 rounded-xl mx-auto w-full max-w-full">
      {/* Left Arrow */}
      <Button
        shape="circle"
        icon={<LeftOutlined />}
        className="flex items-center justify-center border-gray-300"
        onClick={handlePrev}
        disabled={isAdmin ? false : isPrevDisabled}
      />

      {/* Date Cards */}
      <div className="flex flex-row wrap-none items-center gap-2 overflow-x-auto scrollbar-hide w-full justify-center sm:justify-start py-2">
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

// import React, { useState, useMemo, useEffect, useRef } from "react";
// import {
//   DownOutlined,
//   LeftOutlined,
//   RightOutlined,
//   UpOutlined,
// } from "@ant-design/icons";
// import { Button } from "antd";
// import dayjs, { Dayjs } from "dayjs";
// import clsx from "clsx";

// interface DatePickerCarouselProps {
//   initialDate?: Dayjs;
//   onDateSelect?: (date: Dayjs | string) => void;
//   maxDaysAhead?: number; // limit how far ahead users can scroll
// }

// const DatePickerCarousel: React.FC<DatePickerCarouselProps> = ({
//   initialDate = dayjs(), // default to today
//   onDateSelect,
//   maxDaysAhead = 30,
// }) => {
//   const today = dayjs().startOf("day");
//   const [currentDate, setCurrentDate] = useState(initialDate.startOf("day"));
//   const [selectedDate, setSelectedDate] = useState(initialDate.startOf("day"));
//   const [daysToShow, setDaysToShow] = useState<number>(7); // default for desktop

//   // 🧠 Responsive behavior
//   useEffect(() => {
//     const updateDaysToShow = () => {
//       if (window.innerWidth < 640) {
//         setDaysToShow(3); // mobile
//       } else {
//         // setDaysToShow(10); // desktop/tablet
//         setDaysToShow(7); // desktop/tablet
//       }
//     };

//     // rAF-throttled resize handler to avoid excessive re-renders
//     let rafId: number | null = null;
//     const onResize = () => {
//       if (rafId !== null) return;
//       rafId = window.requestAnimationFrame(() => {
//         rafId = null;
//         updateDaysToShow();
//       });
//     };

//     updateDaysToShow();
//     window.addEventListener("resize", onResize);
//     return () => {
//       if (rafId !== null) cancelAnimationFrame(rafId);
//       window.removeEventListener("resize", onResize);
//     };
//   }, []);

//   // Keep a stable reference to the latest onDateSelect to avoid effect re-triggers
//   const onDateSelectRef = useRef<typeof onDateSelect>(onDateSelect);
//   useEffect(() => {
//     onDateSelectRef.current = onDateSelect;
//   }, [onDateSelect]);

//   // Notify parent when selected date changes (once on mount and on user selection)
//   useEffect(() => {
//     onDateSelectRef.current?.(dayjs(selectedDate).toISOString());
//   }, [selectedDate]);

//   const dates = useMemo(() => {
//     const startOfRange = currentDate.startOf("day");
//     return Array.from({ length: daysToShow }, (_, i) =>
//       startOfRange.add(i, "day")
//     );
//   }, [currentDate, daysToShow]);

//   const handlePrev = () => {
//     const newDate = currentDate.subtract(1, "day");
//     if (newDate.isBefore(today, "day")) return;
//     setCurrentDate(newDate);
//   };

//   const handleNext = () => {
//     const newDate = currentDate.add(1, "day");
//     if (newDate.diff(today, "day") >= maxDaysAhead) return;
//     setCurrentDate(newDate);
//   };

//   const handleSelect = (date: Dayjs) => {
//     if (date.isBefore(today, "day")) return;
//     setSelectedDate(date);
//   };

//   const isPrevDisabled = currentDate.isSame(today, "day");
//   const isNextDisabled = currentDate.diff(today, "day") >= maxDaysAhead;

//   return (
//     // <div className="flex flex-col items-center justify-center gap-2 bg-transparent pt-0 pb-4 rounded-xl w-full max-w-full">
//     <div className="flex flex-col items-center justify-center gap-2 bg-transparent rounded-xl">
//       {/* Left Arrow */}
//       <Button
//         shape="circle"
//         // icon={<LeftOutlined />}
//         icon={<UpOutlined />}
//         className="flex items-center justify-center border-gray-300"
//         onClick={handlePrev}
//         disabled={isPrevDisabled}
//       />

//       {/* Date Cards */}
//       <div className="flex flex-col-reverse wrap-none items-center gap-2 overflow-x-auto scrollbar-hide w-full justify-center sm:justify-start py-2">
//         {dates.map((date) => {
//           const isSelected = date.isSame(selectedDate, "day");
//           const isPast = date.isBefore(today, "day");

//           return (
//             <div
//               key={date.format("YYYY-MM-DD")}
//               onClick={() => handleSelect(date)}
//               className={clsx(
//                 "flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200",
//                 "rounded-2xl shadow-sm hover:shadow-md py-3 sm:py-4",
//                 "w-20 sm:w-24 md:w-28", // responsive width
//                 isSelected
//                   ? "bg-[#36013F] text-white"
//                   : "bg-white text-[#36013F]",
//                 isPast && "opacity-40 cursor-not-allowed hover:shadow-none"
//               )}
//             >
//               <span
//                 className={clsx(
//                   "text-[10px] sm:text-sm",
//                   isSelected ? "text-white/80" : "text-gray-600"
//                 )}
//               >
//                 {date.format("dddd")}
//               </span>
//               <span className="text-xl sm:text-2xl md:text-3xl font-bold leading-none">
//                 {date.format("DD")}
//               </span>
//             </div>
//           );
//         })}
//       </div>

//       {/* Right Arrow */}
//       <Button
//         shape="circle"
//         // icon={<RightOutlined />}
//         icon={<DownOutlined />}
//         className="flex items-center justify-center border-gray-300"
//         onClick={handleNext}
//         disabled={isNextDisabled}
//       />
//     </div>
//   );
// };

// export default DatePickerCarousel;
