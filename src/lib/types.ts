export type ContactStatus =
  | 'Sin contactar'
  | 'En contacto'
  | 'Oportunidad'
  | 'Cliente'
  | 'Descartado'
  | 'En pausa';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string | null;
  linkedin_url: string | null;
  email: string | null;
  company: string | null;
  position: string | null;
  connected_on: string | null;
  status: ContactStatus;
  notes?: string | null;
  priority?: number; // 1, 2, 3 stars
  follow_up_date?: string | null;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ContactStats {
  total: number;
  withEmail: number;
  noEmail?: number;
  companiesCount: number;
  recentCount: number;
  pendingFollowUps?: number;
  byStatus: Record<string, number>;
  topCompanies?: { company: string; count: string }[];
  byYear?: { yr: string; count: string }[];
  topPositions?: { position: string; count: string }[];
  recentContacts?: { id: string; first_name: string; last_name: string; connected_on: string }[];
}
