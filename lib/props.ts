import { Dayjs } from "dayjs";

export interface CreateUserCredits {
  user_id: string;
}

export interface CreateClassProps {
  key?: string;
  id?: string;
  instructor_id?: string;
  instructor_name?: string;
  start_time?: Dayjs;
  end_time?: Dayjs;
  slots?: string;
  taken_slots?: number;
}
export interface CreateInstructorProps {
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string;
  avatar_path?: string;
}
export interface UserProps {
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
