"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabaseBrowser } from "@/lib/supabase/browser";

export type SessionState = {
  user: any | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
};

const initialState: SessionState = { user: null, status: "idle" };

export const fetchSession = createAsyncThunk("session/fetch", async () => {
  const supabase = supabaseBrowser();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    clearSession(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSession.pending, (state) => { state.status = "loading"; })
      .addCase(fetchSession.fulfilled, (state, action) => { state.status = "succeeded"; state.user = action.payload; })
      .addCase(fetchSession.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; });
  },
});

export const { clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
