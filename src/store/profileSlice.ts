"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabaseBrowser } from "@/lib/supabase/browser";

export type ProfileState = {
  balance: number;
  bookings: Array<{ id: string; title: string; date: string; status: string }>;
  purchases: Array<{ id: string; title: string; date: string; status: string }>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: ProfileState = { balance: 0, bookings: [], purchases: [], status: "idle" };

export const fetchProfileData = createAsyncThunk("profile/fetchData", async () => {
  const supabase = supabaseBrowser();
  const { data: balanceRows } = await supabase.from("user_packages").select("credits_remaining").eq("status", "confirmed");
  const balance = (balanceRows || []).reduce((sum, r) => sum + (r.credits_remaining || 0), 0);

  const { data: bookingRows } = await supabase
    .from("bookings")
    .select("id,status,created_at, schedule_id, class_schedules:start_time")
    .order("created_at", { ascending: false });
  const bookings = (bookingRows || []).map((r: any) => ({ id: r.id, title: "Lagree Class", date: new Date(r.class_schedules?.start_time || r.created_at).toLocaleString(), status: r.status }));

  const { data: purchaseRows } = await supabase
    .from("user_packages")
    .select("id,status,purchased_at,packages(name)")
    .order("purchased_at", { ascending: false });
  const purchases = (purchaseRows || []).map((r: any) => ({ id: r.id, title: r.packages?.name || "Package", date: new Date(r.purchased_at).toLocaleDateString(), status: r.status }));

  return { balance, bookings, purchases };
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileData.pending, (state) => { state.status = "loading"; })
      .addCase(fetchProfileData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.balance = action.payload.balance;
        state.bookings = action.payload.bookings;
        state.purchases = action.payload.purchases;
      })
      .addCase(fetchProfileData.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; });
  },
});

export default profileSlice.reducer;
