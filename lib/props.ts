export interface CreateClassProps {
  key: string;
  instructor: string;
  start_time: string;
  end_time: string;
  slots: string;
}

export interface CreatePackageProps {
  key: string;
  name: string;
  price: number;
  promo: boolean;
  validity_period: number;
}
