import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CurrentPackageProps {
  id: string;
  status: string;
  user_id: string;
  packages: {
    id: string;
    price: number;
    title: string;
    created_at: string;
    package_type: string;
    package_credits: number;
    validity_period: number;
  };
  created_at: string;
  package_id: string;
  purchase_date: string;
  payment_method: string;
  expiration_date: string;
  package_credits: number;
  validity_period: number;
}

export interface UserProfile {
  id?: string;
  email?: string;
  contact_number?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  birthday?: string;
  location?: string;
  is_user?: boolean;
  created_at?: string;
  updated_at?: string;
  credits?: number;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  currentPackage?: CurrentPackageProps;
}

export interface UpdateUserProfile {
  email?: string;
  contact_number?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  birthday?: string;
  location?: string;
  credits?: number;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
}
