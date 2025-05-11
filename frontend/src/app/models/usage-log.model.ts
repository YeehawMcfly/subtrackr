export interface UsageLog {
  log_id: number;
  sub_id: number;
  usage_date: string; // ISO date string
  note?: string;
  created_at?: string;
}