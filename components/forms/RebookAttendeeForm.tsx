"use client";

import { Select, Row, Typography, Divider, Button, Tooltip } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

interface RebookAttendeeProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  attendees: any[];
  classes: any[];
  clearSignal?: boolean;
}

const { Text } = Typography;

export default function RebookAttendeeForm({
  clearSignal,
  onSubmit,
  onCancel,
  loading = false,
  attendees,
  classes,
}: RebookAttendeeProps) {
  const now = dayjs();
  const [selectedOriginalSchedule, setSelectedOriginalSchedule] =
    useState<any>(null);
  const [selectedNewSchedule, setSelectedNewSchedule] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [availableAttendees, setAvailableAttendees] = useState<any[]>([]);

  useEffect(() => {
    const rebookableAttendees = attendees.map((attendee) => {
      const filtered = attendee.originalClasses.filter((oc: any) =>
        dayjs(oc.startTime).isSameOrAfter(now),
      );

      return { ...attendee, originalClasses: filtered };
    });
    setAvailableAttendees(rebookableAttendees);
  }, [attendees, classes]);

  useEffect(() => {
    handleClear();
  }, [clearSignal]);

  const handleSelect = (selected: string) => {
    const found = availableAttendees?.find((item) => item.value === selected);

    if (!found) return null;

    const availableClasses = classes
      .filter(
        (item: any) =>
          !(found.originalClasses.map((x: any) => x.value) as any[]).includes(
            item.id,
          ) && item.start_time.isSameOrAfter(now),
      )
      .map((item: any) => {
        return {
          value: item.id,
          label: `${item.instructor_name} (${dayjs(item.start_time).format(
            "hh:mm A",
          )} - ${dayjs(item.end_time).format("hh:mm A")}) (${
            item.taken_slots
          } / ${item.available_slots} slots remaining)`,
          disabled: item.taken_slots === item.available_slots,
        };
      });

    setSelectedRecord({
      bookerID: found.value,
      classID: found.classID,
      bookerName: found.label,
      originalClasses: found.originalClasses,
      availableClasses: availableClasses,
    });
  };

  const handleClear = () => {
    setSelectedRecord(null);
    setSelectedOriginalSchedule(null);
    setSelectedNewSchedule(null);
    // setAvailableAttendees([]);
  };

  const handleFinish = () => {
    onSubmit({
      bookerName: selectedRecord.bookerName,
      originalClass: selectedOriginalSchedule,
      newClassID: selectedNewSchedule,
    });

    handleClear();
  };

  const handleClose = () => {
    handleClear();
    onCancel();
  };

  return (
    <Row className="flex flex-col gap-y-[20px] pb-[20px]">
      <Row wrap={false} className="gap-x-[20px]">
        <Row className="w-full flex flex-col">
          <Text>Attendee</Text>
          <Select
            allowClear
            disabled={!availableAttendees.length}
            value={selectedRecord?.bookerName}
            onClear={handleClear}
            onSelect={(e) => handleSelect(e)}
            placeholder="Select an attendee from today"
            options={availableAttendees}
          />
          {!availableAttendees.length && (
            <span className="text-red-400">
              There are currently no attendees in classes now or later
            </span>
          )}
        </Row>
        <Tooltip
          title={
            selectedRecord &&
            !selectedRecord?.availableClasses.length &&
            "Attendee is in all available classes, or there are no other classes scheduled."
          }
        >
          <Row className="w-full flex flex-col">
            <Text>Original Schedule</Text>
            <Select
              value={selectedOriginalSchedule}
              onSelect={(e) => setSelectedOriginalSchedule(e)}
              options={selectedRecord?.originalClasses ?? []}
              disabled={
                selectedRecord === null ||
                !selectedRecord?.availableClasses.length
              }
              placeholder="Select attendee original class"
            />
          </Row>
        </Tooltip>
      </Row>
      <Divider>Rebook to</Divider>
      <Tooltip
        title={
          selectedRecord &&
          !selectedRecord?.availableClasses.length &&
          "Attendee is in all classes, or there are no other classes."
        }
      >
        <Row className="w-full flex flex-col">
          <Text>New Schedule</Text>
          <Select
            value={selectedNewSchedule}
            onSelect={(e) => setSelectedNewSchedule(e)}
            disabled={
              selectedRecord === null ||
              !selectedRecord?.availableClasses.length
            }
            placeholder="Select a new schedule"
            options={selectedRecord?.availableClasses ?? []}
          />
        </Row>
      </Tooltip>

      <Row wrap={false} justify={"end"} className="gap-x-[10px]">
        <Button
          onClick={handleClose}
          disabled={loading}
          className="font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03] h-[40px]"
        >
          Cancel
        </Button>
        <Button
          disabled={loading || !selectedRecord?.availableClasses.length}
          loading={loading}
          onClick={handleFinish}
          className={`${
            (loading || !!selectedRecord?.availableClasses.length) &&
            "bg-[#36013F] hover:!bg-[#36013F]"
          } !border-none !text-white font-medium rounded-lg px-6 shadow-sm transition-all duration-200 hover:scale-[1.03] h-[40px]`}
        >
          Rebook
        </Button>
      </Row>
    </Row>
  );
}
