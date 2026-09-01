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
  action_type: 'STATUS_CHANGE' | 'DATA_UPDATE' | 'PHONE_ADDED' | 'EMAIL_ADDED' | 'NOTE_ADDED' | 'CONTACTED_OUTREACH' | 'OPPORTUNITY_CREATED' | 'CLIENT_WON' | 'LEAD_PAUSED' | 'GOAL_UPDATED';
  description: string;
  performed_by: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_company?: string | null;
  contact_position?: string | null;
  contact_linkedin_url?: string | null;
  sender_name: string;
  direction: 'OUTBOUND' | 'INBOUND';
  channel: 'LINKEDIN' | 'WHATSAPP' | 'EMAIL';
  message_text: string;
  template_name?: string | null;
  created_at: string;
}

export interface CommercialResource {
  id: string;
  title: string;
  description?: string | null;
  category: 'BROCHURE' | 'VIDEO' | 'FLYER' | 'PROPOSAL' | 'LINK';
  file_url?: string | null;
  file_name?: string | null;
  file_size?: string | null;
  external_link?: string | null;
  created_by: string;
  created_at: string;
  updated_at?: string;
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
  shared_with?: string[];
  last_interaction_date?: string | null;
  last_message_preview?: string | null;
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
  daily_contacted: number;
  contacted: number;
  phones: number;
  opportunities: number;
  clients: number;
}

export interface DayBreakdown {
  day_name: string;
  date_str: string;
  display_date: string;
  is_today: boolean;
  is_future: boolean;
  contacted_count: number;
  goal_count: number;
  pct: number;
  opportunities_count: number;
  phones_count: number;
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
  days_breakdown: DayBreakdown[];
}

export interface WeeklySprintData {
  week_label: string;
  start_date: string;
  end_date: string;
  goals: WeeklyGoal;
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
    global_days_breakdown: DayBreakdown[];
  };
  members_progress: WeeklySprintProgress[];
}

export interface FollowUpReminder {
  id: string;
  first_name: string;
  last_name: string | null;
  company: string | null;
  position: string | null;
  phone?: string | null;
  linkedin_url: string | null;
  status: ContactStatus;
  priority: number;
  follow_up_date: string;
  assigned_to: string;
  notes: string | null;
  is_overdue: boolean;
  is_today: boolean;
  days_diff: number; // positive = future days, negative = overdue days, 0 = today
  time_bucket: 'overdue' | 'today' | 'plus_1_day' | 'plus_3_days' | 'plus_1_week' | 'plus_1_month' | 'future';
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
