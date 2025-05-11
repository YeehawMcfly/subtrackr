export interface Payment {
  payment_id: number;
  sub_id: number;
  amount_paid: number;
  payment_date: string; // ISO date string
  created_at?: string;
}