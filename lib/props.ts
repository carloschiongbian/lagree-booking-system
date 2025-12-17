import { Dayjs } from "dayjs";

export interface CreateUserCredits {
  user_id: string;
}

export interface CreateClassProps {
  key?: string;
  id?: string;
  instructor_id?: string;
  instructor_name?: string;
  class_name?: string;
  start_time?: Dayjs;
  end_time?: Dayjs;
  slots?: string;
  deactivated?: boolean;
  taken_slots?: number;
}
export interface CreateInstructorProps {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  deactivated?: boolean;
  avatar_url?: string;
  avatar_path?: string;
  certification?: string;
  employment_start_date?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  contact_number?: string;
  email?: string;
}
export interface UserProps {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  full_name?: string;
  contact_number?: string;
  avatar_url?: string;
  avatar_path?: string;
}

export interface CreatePackageProps {
  key?: string;
  name?: string;
  title?: string;
  price?: number;
  promo?: boolean;
  validity_period?: number;
  package_credits?: number | null;
  offered_for_clients?: boolean;
}

export interface ChartData {
  label: string;
  start: number;
  end: number;
  color: string;
}

export interface PackageProps {
  id: string;
  created_at?: string;
  price: number;
  title: string;
  packageType: string;
  packageCredits: number;
  validityPeriod: number;
}

export interface ClientPackageProps {
  id: string;
  createdAt: string;
  packageId: string;
  userId: string;
  expirationDate: string;
  status: "active" | "expired" | "inactive" | string;
  purchaseDate: string;
  paymentMethod: "debit" | "credit" | string;
  packageCredits: number;
  validityPeriod: number;
  packages: {
    id: string;
    price: number;
    title: string;
    createdAt: string;
    packageType: "regular" | "promo" | string;
    packageCredits: number;
    validityPeriod: number;
  };
}

export interface Order {
  id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_user_id?: string;
  amount: number;
  currency: string;
  product_name: string;
  product_description?: string;
  payment_intent_id?: string;
  payment_method_id?: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}
