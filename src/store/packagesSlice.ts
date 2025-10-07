"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export type PackageItem = { id: string; name: string; credits: number; price_cents: number; duration_days: number | null };

export type PackagesState = {
  items: PackageItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: PackagesState = { items: [], status: "idle" };

export const fetchPackages = createAsyncThunk<PackageItem[]>("packages/fetch", async () => {
  const res = await fetch("/api/packages");
  if (!res.ok) throw new Error("Failed to load packages");
  const json = await res.json();
  return json.packages || [];
});

const packagesSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => { state.status = "loading"; })
      .addCase(fetchPackages.fulfilled, (state, action) => { state.status = "succeeded"; state.items = action.payload; })
      .addCase(fetchPackages.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; });
  },
});

export default packagesSlice.reducer;
