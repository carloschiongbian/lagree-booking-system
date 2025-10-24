import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
