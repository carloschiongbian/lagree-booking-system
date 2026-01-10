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

export interface Class {
  id: string;
  name: string;
  description: string;
  intensity_level: string;
  order: number;
  created_at: string;
}

export interface Trainer {
  id?: string;
  full_name: string;
  certifications?: string[];
  approach?: string;
  image_url?: string;
  order?: number;
  created_at?: string;
  instructors: any;
  avatar_path?: string;
}

export interface Schedule {
  id: string;
  instructors?: any;
  avatar_path?: string;
  class_name?: string;
  taken_slots?: string;
  available_slots?: string;
  class_id: string;
  trainer_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  created_at: string;
  classes?: Class;
  trainers?: Trainer;
}

export interface Testimonial {
  id: string;
  client_name: string;
  quote: string;
  is_active: boolean;
  created_at: string;
}
export type Address = {
  line1: string;
  city: string;
  state: string;
  zipCode: string;
  countryCode: string;
};

type ShippingAddress = Address & {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  customerPhone?: string;
  customerEmail?: string;
};

export type PurchaseFormData = {
  productName: string;
  productPrice: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  customerEmail?: string;
  customerPhone?: string;
  quantity: number;
  billingAddress: Address;
  shippingAddress: ShippingAddress;
};
