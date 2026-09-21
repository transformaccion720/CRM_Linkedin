export type B2BStage =
  | 'Prospecto identificado'
  | 'Contactado'
  | 'Conversación iniciada'
  | 'Discovery / reunión'
  | 'Oportunidad calificada'
  | 'Propuesta enviada'
  | 'Negociación'
  | 'Ganada'
  | 'Perdida'
  | 'Pausada';

export type B2CStage =
  | 'Sin contactar'
  | 'En contacto'
  | 'Seguimiento'
  | 'Oportunidad'
  | 'Cliente'
  | 'Descartado'
  | 'En pausa';

export type ContactStatus =
  | B2BStage
  | B2CStage;

export type BusinessSegment = 'B2B' | 'B2C';

export type ContactSource =
  | 'BUSQUEDA_ACTIVA' // 🎯 Prospectos detectados buscando servicios / Signal Lead
  | 'PROSPECCION_DIRECTA' // 👤 Añadido manualmente
  | 'BASE_IMPORTADA' // 🗄️ Base importada desde CSV
  | 'GOOGLE_MAPS'; // 📍 Cazador B2B Exploratorio (Google Places)

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
  action_type: 'STATUS_CHANGE' | 'DATA_UPDATE' | 'PHONE_ADDED' | 'EMAIL_ADDED' | 'NOTE_ADDED' | 'CONTACTED_OUTREACH' | 'OPPORTUNITY_CREATED' | 'CLIENT_WON' | 'LEAD_PAUSED' | 'GOAL_UPDATED' | 'MEETING_SCHEDULED' | 'PROPOSAL_SENT';
  description: string;
  performed_by: string;
  is_read?: boolean;
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
  business_segment?: BusinessSegment | 'ALL';
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
  deal_value?: number | null; // Valor del negocio en USD
  next_step?: string | null; // Próximo paso de seguimiento comercial
  notes?: string | null;
  priority?: number; // 1, 2, 3 stars
  follow_up_date?: string | null;
  tags?: string[];
  assigned_to?: string | null;
  shared_with?: string[];
  source?: ContactSource; // Origen del lead
  b2b_subsegment?: 'CORPORATIVO' | 'EXPLORATORIO' | null; // Sub-cartera B2B: Corporativo (LinkedIn) vs Exploratorio (Google/Web)
  google_place_id?: string | null;
  google_rating?: number | null;
  google_reviews_count?: number | null;
  google_maps_url?: string | null;
  website_status?: 'NONE' | 'OUTDATED' | 'ACTIVE' | null;
  post_url?: string | null; // Link de la publicación / post de búsqueda
  service_needed?: string | null; // Servicio / necesidad específica que busca
  business_segment?: BusinessSegment | null; // Segmento: B2B Corporativo vs B2C Alumnos/Programas
  last_interaction_date?: string | null;
  last_message_preview?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProspectingSettings {
  google_places_api_key?: string;
  openrouter_api_key?: string;
  openrouter_model?: string;
  has_google_key?: boolean;
  has_openrouter_key?: boolean;
}

export interface ExploredBusiness {
  place_id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  phone?: string | null;
  whatsapp_number?: string | null;
  has_whatsapp?: boolean;
  website?: string | null;
  website_status: 'NONE' | 'OUTDATED' | 'ACTIVE';
  email?: string | null;
  rating?: number;
  reviews_count?: number;
  google_maps_url?: string;
  category?: string;
  is_imported?: boolean;
  imported_id?: string;
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
  b2b_total?: number;
  b2c_total?: number;
  b2b_in_contact?: number;
  b2b_opportunity?: number;
  b2b_client?: number;
  b2c_in_contact?: number;
  b2c_opportunity?: number;
  b2c_client?: number;
}

export interface WeeklyActivityMetrics {
  new_companies_identified: number;
  new_contacts_made: number;
}

export interface WeeklyConversionMetrics {
  responses_received: number;
  meetings_scheduled: number;
  meetings_completed: number;
  qualified_opportunities: number;
  proposals_sent: number;
  deals_won: number;
}

export interface WeeklyFinancialMetrics {
  pipeline_total_value: number;
  pipeline_weighted_value: number;
}

export interface WeeklyGoal {
  daily_contacted: number;
  contacted: number;
  phones: number;
  opportunities: number;
  clients: number;
  // Nuevas métricas configurables
  new_companies?: number;
  meetings_scheduled?: number;
  meetings_completed?: number;
  proposals_sent?: number;
  pipeline_value_target?: number;
  assignee?: string;
  mode?: string;
}

export interface SegmentedWeeklyGoals {
  b2b: WeeklyGoal;
  b2c: WeeklyGoal;
  global: WeeklyGoal;
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
  weekly_pillars?: {
    activity: WeeklyActivityMetrics;
    conversion: WeeklyConversionMetrics;
    financial: {
      pipeline_total_value: number;
      deals_count: number;
    };
  };
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
  country?: string | null;
  phone?: string | null;
  linkedin_url: string | null;
  status: ContactStatus;
  priority: number;
  follow_up_date: string;
  assigned_to: string;
  notes: string | null;
  business_segment?: BusinessSegment | null;
  deal_value?: number | null;
  next_step?: string | null;
  is_overdue: boolean;
  is_today: boolean;
  days_diff: number;
  time_bucket: 'overdue' | 'today' | 'plus_1_day' | 'plus_3_days' | 'plus_1_week' | 'plus_1_month' | 'future';
  overdue_sub_bucket?: 'overdue_week_plus' | 'overdue_this_week' | 'overdue_yesterday' | 'today' | 'tomorrow' | 'this_week' | 'future';
}

export interface ContactStats {
  total: number;
  withEmail: number;
  noEmail?: number;
  withPhone?: number;
  activeSearchCount?: number; // Contador de prospectos en búsqueda activa
  companiesCount: number;
  recentCount: number;
  pendingFollowUps?: number;
  byStatus: Record<string, number>;
  b2bCount?: number;
  b2cCount?: number;
  b2bByStatus?: Record<string, number>;
  b2cByStatus?: Record<string, number>;
  b2bFollowUps?: number;
  b2cFollowUps?: number;
  b2bDealValue?: number;
  b2cDealValue?: number;
  totalDealValue?: number;
  topCompanies?: { company: string; count: string }[];
  topCountries?: { country: string; count: string }[];
  byYear?: { yr: string; count: string }[];
  topPositions?: { position: string; count: string }[];
  recentContacts?: { id: string; first_name: string; last_name: string; connected_on: string }[];
  byMember?: MemberStats[];
  weeklySprint?: WeeklySprintData;
}
