export type ContactStatus =
  | 'Sin contactar'
  | 'En contacto'
  | 'Oportunidad'
  | 'Cliente'
  | 'Descartado'
  | 'En pausa';

export interface TeamMember {
  id: string;
  name: string;
  email?: string | null;
  role: string;
  color: string;
  password?: string | null;
  contact_count?: number;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  contact_id?: string | null;
  contact_name: string;
  action_type: 'STATUS_CHANGE' | 'DATA_UPDATE' | 'PHONE_ADDED' | 'EMAIL_ADDED' | 'NOTE_ADDED';
  description: string;
  performed_by: string;
  created_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string | null;
  linkedin_url: string | null;
  email: string | null;
  phone?: string | null;
  company: string | null;
  position: string | null;
  country?: string | null;
  connected_on: string | null;
  status: ContactStatus;
  notes?: string | null;
  priority?: number; // 1, 2, 3 stars
  follow_up_date?: string | null;
  tags?: string[];
  assigned_to?: string | null;
  shared_with?: string[]; // Array of other team members who have this same contact
  created_at?: string;
  updated_at?: string;
}

export interface MemberStats {
  member_name: string;
  total: number;
  withEmail: number;
  withPhone: number;
  inContact: number;
  opportunity: number;
  client: number;
  paused: number;
}

export interface WeeklyGoal {
  contacted: number;
  phones: number;
  opportunities: number;
  clients: number;
}

export interface DailyGoalProgress {
  contacted_today: number;
  contacted_daily_goal: number;
  phones_today: number;
  opportunities_today: number;
  today_pct: number;
}

export interface WeeklySprintProgress {
  member_name: string;
  color: string;
  contacted_actual: number;
  contacted_goal: number;
  phones_actual: number;
  phones_goal: number;
  opportunities_actual: number;
  opportunities_goal: number;
  clients_actual: number;
  clients_goal: number;
  overall_pct: number;
  daily_progress: DailyGoalProgress;
}

export interface WeeklySprintData {
  week_label: string;
  start_date: string;
  end_date: string;
  goals: WeeklyGoal;
  daily_goal_target: number;
  global_totals: {
    contacted_actual: number;
    contacted_goal: number;
    phones_actual: number;
    phones_goal: number;
    opportunities_actual: number;
    opportunities_goal: number;
    clients_actual: number;
    clients_goal: number;
    overall_pct: number;
    contacted_today_total: number;
    contacted_daily_goal_total: number;
    today_pct_total: number;
  };
  members_progress: WeeklySprintProgress[];
}

export interface ContactStats {
  total: number;
  withEmail: number;
  noEmail?: number;
  withPhone?: number;
  companiesCount: number;
  recentCount: number;
  pendingFollowUps?: number;
  byStatus: Record<string, number>;
  topCompanies?: { company: string; count: string }[];
  topCountries?: { country: string; count: string }[];
  byYear?: { yr: string; count: string }[];
  topPositions?: { position: string; count: string }[];
  recentContacts?: { id: string; first_name: string; last_name: string; connected_on: string }[];
  byMember?: MemberStats[];
  weeklySprint?: WeeklySprintData;
}
