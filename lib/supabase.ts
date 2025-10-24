"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

export interface UserProfile {
  id: string;
  email: string;
  contact_number: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  birthday?: string;
  location?: string;
  is_user?: boolean;
  created_at?: string;
  updated_at?: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
}
export interface UpdateUserProfile {
  email: string;
  contact_number: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  birthday?: string;
  location?: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
}
