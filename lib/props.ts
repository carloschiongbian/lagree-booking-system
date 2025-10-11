import { Dayjs } from "dayjs";

export interface CreateClassProps {
  key: string;
  instructor: string;
  start_time: Dayjs;
  end_time: Dayjs;
  slots: string;
}

export interface CreatePackageProps {
  key: string;
  name: string;
  price: number;
  promo: boolean;
  validity_period: number;
}
