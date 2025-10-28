import { Dayjs } from "dayjs";

export interface CreateClassProps {
  key: string;
  instructor_id: string;
  instructor_name: string;
  start_time: Dayjs;
  end_time: Dayjs;
  slots: string;
}
export interface CreateInstructorProps {
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface CreatePackageProps {
  key: string;
  name: string;
  price: number;
  promo: boolean;
  validity_period: number;
}
