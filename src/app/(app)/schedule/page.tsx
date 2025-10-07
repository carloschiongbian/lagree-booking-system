"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, List, Tag, Space, Button, Modal, Typography, Segmented, DatePicker, message, Checkbox } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchClasses, setDate as setDateAction, setView as setViewAction } from "@/store/scheduleSlice";

const { Title, Text } = Typography;

// Placeholder types and fetches; will be backed by DB
type ClassItem = {
  id: string;
  name: string;
  start_time: string; // ISO
  end_time: string; // ISO
  capacity: number;
  booked_count: number;
};

export default function SchedulePage() {
  const supabase = supabaseBrowser();
  const dispatch = useAppDispatch();
  const schedule = useAppSelector((s) => s.schedule);
  const date = dayjs(schedule.date);
  const view = schedule.view;
  const classes = schedule.items;
  const loading = schedule.status === "loading";
  const [selected, setSelected] = useState<ClassItem | null>(null);
  const [waiverRequired, setWaiverRequired] = useState(false);
  const [waiverChecked, setWaiverChecked] = useState(false);

  useEffect(() => {
    dispatch(fetchClasses({ date: schedule.date }));
  }, [dispatch, schedule.date]);

  async function loadClasses() {}

  const data = useMemo(() => classes.sort((a, b) => a.start_time.localeCompare(b.start_time)), [classes]);

  function slotsLeft(item: ClassItem) {
    return Math.max(0, item.capacity - item.booked_count);
  }

  function isFull(item: ClassItem) {
    return slotsLeft(item) === 0;
  }

  async function book(item: ClassItem) {
    // waiver check using user metadata for now
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    const accepted = Boolean(user.user_metadata?.waiverAccepted);
    setWaiverRequired(!accepted);
    setWaiverChecked(false);
    setSelected(item);
  }

  async function confirmBook() {
    if (!selected) return;
    if (waiverRequired && !waiverChecked) {
      message.error("Please acknowledge the waiver to continue");
      return;
    }
    if (waiverRequired && waiverChecked) {
      const { error } = await supabase.auth.updateUser({ data: { waiverAccepted: true } });
      if (error) {
        message.error(error.message);
        return;
      }
    }
    try {
      const res = await fetch("/api/rpc/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule_id: selected.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Booking failed");
      }
      message.success("Booked!");
    } catch (e: any) {
      message.error(e.message);
      return;
    }
    setSelected(null);
    await loadClasses();
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
        <Title level={3} style={{ margin: 0 }}>Class Schedule</Title>
        <Space>
          <DatePicker value={date} onChange={(d) => d && dispatch(setDateAction(d.format("YYYY-MM-DD")))} />
          <Segmented
            options={[{ label: "List", value: "list" }, { label: "Calendar", value: "calendar" }]}
            value={view}
            onChange={(v) => dispatch(setViewAction(v as any))}
          />
        </Space>
      </Space>

      <Card>
        <List
          loading={loading}
          dataSource={data}
          renderItem={(item) => {
            const left = slotsLeft(item);
            return (
              <List.Item
                actions={[
                  <Button key="book" type="primary" disabled={isFull(item)} onClick={() => book(item)}>
                    {isFull(item) ? "Class full" : "Book"}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{dayjs(item.start_time).format("ddd, MMM D • h:mma")}</Text>
                      <Tag color={left <= 2 ? "red" : left <= 4 ? "orange" : "green"}>
                        {left}/{item.capacity} slots left
                      </Tag>
                    </Space>
                  }
                  description={item.name}
                />
              </List.Item>
            );
          }}
        />
      </Card>

      <Modal
        title="Confirm booking"
        open={!!selected}
        onCancel={() => setSelected(null)}
        onOk={confirmBook}
        okText="Confirm"
      >
        {selected && (
          <Space direction="vertical">
            <Text>{selected.name}</Text>
            <Text type="secondary">{dayjs(selected.start_time).format("dddd, MMMM D, YYYY h:mma")}</Text>
            <Text>
              You will be charged 1 credit. Bookings are cancellable until 24 hours before class.
            </Text>
            {waiverRequired && (
              <Checkbox checked={waiverChecked} onChange={(e) => setWaiverChecked(e.target.checked)}>
                I have read and agree to the waiver terms
              </Checkbox>
            )}
          </Space>
        )}
      </Modal>
    </Space>
  );
}
