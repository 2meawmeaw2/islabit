export interface User {
  id: string; // UUID
  name: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  commited_bundles: CommittedBundle[];
  commited_habits: CommittedHabit[];
  best_days: string[];
  points: number;
}
export interface CommittedBundle {
  id: string; // UUID
  committed_time: string; // ISO timestamp
  completion_rate: number; // 0-100
  commited_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
export interface CommittedHabit {
  id: string; // UUID
  commited_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
