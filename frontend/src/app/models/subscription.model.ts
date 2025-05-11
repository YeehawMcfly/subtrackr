export interface Subscription {
  sub_id: number;
  name: string;
  category: string;
  price: string;
  billing_cycle: string;
  next_due_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  payment_id: number;
  sub_id: number;
  amount_paid: number;
  payment_date: string;
}

export interface UsageLog {
  log_id: number;
  sub_id: number;
  usage_date: string;
  note: string;
}