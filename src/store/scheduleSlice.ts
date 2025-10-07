"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import dayjs, { Dayjs } from "dayjs";
import { supabaseBrowser } from "@/lib/supabase/browser";

export type ClassItem = {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
};

export type ScheduleState = {
  date: string; // YYYY-MM-DD
  view: "list" | "calendar";
  items: ClassItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: ScheduleState = {
  date: dayjs().format("YYYY-MM-DD"),
  view: "list",
  items: [],
  status: "idle",
};

export const fetchClasses = createAsyncThunk<ClassItem[], { date: string }>(
  "schedule/fetchClasses",
  async ({ date }) => {
    const supabase = supabaseBrowser();
    const startOfDay = dayjs(date).startOf("day").toISOString();
    const endOfDay = dayjs(date).endOf("day").toISOString();
    const { data, error } = await supabase
      .from("class_availability")
      .select("id,title,start_time,end_time,capacity,booked_count")
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay)
      .order("start_time");
    if (error) throw new Error(error.message);
    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.title,
      start_time: r.start_time,
      end_time: r.end_time,
      capacity: r.capacity,
      booked_count: r.booked_count,
    }));
  }
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setDate(state, action: PayloadAction<string>) {
      state.date = action.payload;
    },
    setView(state, action: PayloadAction<"list" | "calendar">) {
      state.view = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => { state.status = "loading"; })
      .addCase(fetchClasses.fulfilled, (state, action) => { state.status = "succeeded"; state.items = action.payload; })
      .addCase(fetchClasses.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; });
  },
});

export const { setDate, setView } = scheduleSlice.actions;
export default scheduleSlice.reducer;
