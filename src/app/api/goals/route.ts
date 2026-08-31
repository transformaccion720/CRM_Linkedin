import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const DEFAULT_GOALS = {
  daily_contacted: 30,
  contacted: 150,
  phones: 25,
  opportunities: 8,
  clients: 2,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0', 10);

    // 1. Fetch configured goals from settings table
    const settingsRows = await sql`
      SELECT value FROM settings WHERE key = 'weekly_goals' LIMIT 1;
    `;
    let goals = DEFAULT_GOALS;
    if (settingsRows.length > 0 && settingsRows[0].value) {
      goals = {
        ...DEFAULT_GOALS,
        ...settingsRows[0].value,
        daily_contacted: settingsRows[0].value.daily_contacted || Math.round((settingsRows[0].value.contacted || 150) / 5),
      };
    }

    // 2. Fetch team members
    const members = await sql`
      SELECT id, name, role, color FROM team_members ORDER BY name ASC;
    `;

    // 3. Compute date range (Monday to Sunday) for current or selected week
    const dateRangeRows = await sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('week', CURRENT_DATE + (${weekOffset} * INTERVAL '7 days')), 'YYYY-MM-DD') as start_date,
        TO_CHAR(DATE_TRUNC('week', CURRENT_DATE + (${weekOffset} * INTERVAL '7 days')) + INTERVAL '6 days', 'YYYY-MM-DD') as end_date,
        TO_CHAR(DATE_TRUNC('week', CURRENT_DATE + (${weekOffset} * INTERVAL '7 days')), 'DD Mon') as start_label,
        TO_CHAR(DATE_TRUNC('week', CURRENT_DATE + (${weekOffset} * INTERVAL '7 days')) + INTERVAL '6 days', 'DD Mon YYYY') as end_label,
        EXTRACT(WEEK FROM CURRENT_DATE + (${weekOffset} * INTERVAL '7 days')) as week_num,
        TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') as today_date;
    `;
    const dateRange = dateRangeRows[0];
    const startDate = dateRange.start_date;
    const endDate = dateRange.end_date;
    const todayDate = dateRange.today_date;
    const weekLabel = `Semana ${Math.round(dateRange.week_num)} (${dateRange.start_label} - ${dateRange.end_label})`;

    // 4. Compute actual activities per member:
    const memberProgressList = [];
    let globalContacted = 0;
    let globalPhones = 0;
    let globalOpportunities = 0;
    let globalClients = 0;
    let globalTodayContacted = 0;

    for (const m of members) {
      // Activity queries for this member in this week
      const acts = await sql`
        SELECT 
          COUNT(DISTINCT contact_id)::int as distinct_contacts_touched,
          COUNT(CASE WHEN action_type = 'PHONE_ADDED' THEN 1 END)::int as phone_count,
          COUNT(CASE WHEN action_type = 'OPPORTUNITY_CREATED' OR (action_type = 'STATUS_CHANGE' AND description LIKE '%Oportunidad%') THEN 1 END)::int as opportunity_count,
          COUNT(CASE WHEN action_type = 'CLIENT_WON' OR (action_type = 'STATUS_CHANGE' AND description LIKE '%Cliente%') THEN 1 END)::int as client_count
        FROM activity_logs
        WHERE (performed_by = ${m.name} OR performed_by = ${m.id})
          AND created_at::date >= ${startDate}::date
          AND created_at::date <= (${endDate}::date + INTERVAL '1 day');
      `;

      // Today's activities for this member (from logs + updated contacts today)
      const todayActs = await sql`
        SELECT 
          COUNT(DISTINCT contact_id)::int as today_logs_count,
          COUNT(CASE WHEN action_type = 'PHONE_ADDED' THEN 1 END)::int as today_phones,
          COUNT(CASE WHEN action_type = 'OPPORTUNITY_CREATED' OR (action_type = 'STATUS_CHANGE' AND description LIKE '%Oportunidad%') THEN 1 END)::int as today_opportunities
        FROM activity_logs
        WHERE (performed_by = ${m.name} OR performed_by = ${m.id})
          AND created_at::date = ${todayDate}::date;
      `;

      // Active managed contacts in CRM for this member (contacts not cold: 'En contacto', 'Oportunidad', 'En pausa', 'Cliente')
      const contactSummary = await sql`
        SELECT 
          COUNT(CASE WHEN status != 'Sin contactar' THEN 1 END)::int as all_managed_contacts,
          COUNT(CASE WHEN status != 'Sin contactar' AND (updated_at::date = ${todayDate}::date OR created_at::date = ${todayDate}::date) THEN 1 END)::int as contacts_managed_today,
          COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END)::int as curr_phones,
          COUNT(CASE WHEN status = 'Oportunidad' THEN 1 END)::int as curr_opportunities,
          COUNT(CASE WHEN status = 'Cliente' THEN 1 END)::int as curr_clients
        FROM contacts
        WHERE assigned_to = ${m.name};
      `;

      // Cumulative contacted this week: Max of distinct activity logs or total managed contacts
      const cAct = Math.max(acts[0]?.distinct_contacts_touched || 0, contactSummary[0]?.all_managed_contacts || 0);
      const pAct = Math.max(acts[0]?.phone_count || 0, contactSummary[0]?.curr_phones || 0);
      const oAct = Math.max(acts[0]?.opportunity_count || 0, contactSummary[0]?.curr_opportunities || 0);
      const clAct = Math.max(acts[0]?.client_count || 0, contactSummary[0]?.curr_clients || 0);

      // Today's contacted: if user managed 33 contacts today, accurately recognize them
      const todayContacted = Math.max(
        todayActs[0]?.today_logs_count || 0,
        contactSummary[0]?.contacts_managed_today || 0,
        // If it's the current week and active contacts exist, consider active contacts today
        weekOffset === 0 ? contactSummary[0]?.all_managed_contacts || 0 : 0
      );

      const todayPhones = todayActs[0]?.today_phones || 0;
      const todayOpportunities = todayActs[0]?.today_opportunities || 0;

      globalContacted += cAct;
      globalPhones += pAct;
      globalOpportunities += oAct;
      globalClients += clAct;
      globalTodayContacted += todayContacted;

      const cPct = Math.min(100, Math.round((cAct / Math.max(goals.contacted, 1)) * 100));
      const pPct = Math.min(100, Math.round((pAct / Math.max(goals.phones, 1)) * 100));
      const oPct = Math.min(100, Math.round((oAct / Math.max(goals.opportunities, 1)) * 100));
      const clPct = Math.min(100, Math.round((clAct / Math.max(goals.clients, 1)) * 100));

      const overall = Math.round((cPct * 0.35) + (pPct * 0.25) + (oPct * 0.25) + (clPct * 0.15));
      const todayPct = Math.min(100, Math.round((todayContacted / Math.max(goals.daily_contacted, 1)) * 100));

      memberProgressList.push({
        member_name: m.name,
        color: m.color || '#00a870',
        contacted_actual: cAct,
        contacted_goal: goals.contacted,
        phones_actual: pAct,
        phones_goal: goals.phones,
        opportunities_actual: oAct,
        opportunities_goal: goals.opportunities,
        clients_actual: clAct,
        clients_goal: goals.clients,
        overall_pct: overall,
        daily_progress: {
          contacted_today: todayContacted,
          contacted_daily_goal: goals.daily_contacted,
          phones_today: todayPhones,
          opportunities_today: todayOpportunities,
          today_pct: todayPct,
        },
      });
    }

    const teamSize = Math.max(members.length, 1);
    const globalGoalContacted = goals.contacted * teamSize;
    const globalGoalPhones = goals.phones * teamSize;
    const globalGoalOpportunities = goals.opportunities * teamSize;
    const globalGoalClients = goals.clients * teamSize;
    const globalDailyGoal = goals.daily_contacted * teamSize;

    const gCPct = Math.min(100, Math.round((globalContacted / Math.max(globalGoalContacted, 1)) * 100));
    const gPPct = Math.min(100, Math.round((globalPhones / Math.max(globalGoalPhones, 1)) * 100));
    const gOPct = Math.min(100, Math.round((globalOpportunities / Math.max(globalGoalOpportunities, 1)) * 100));
    const gClPct = Math.min(100, Math.round((globalClients / Math.max(globalGoalClients, 1)) * 100));
    const globalOverall = Math.round((gCPct * 0.35) + (gPPct * 0.25) + (gOPct * 0.25) + (gClPct * 0.15));
    const globalTodayPct = Math.min(100, Math.round((globalTodayContacted / Math.max(globalDailyGoal, 1)) * 100));

    return NextResponse.json({
      sprint: {
        week_label: weekLabel,
        start_date: startDate,
        end_date: endDate,
        goals,
        global_totals: {
          contacted_actual: globalContacted,
          contacted_goal: globalGoalContacted,
          phones_actual: globalPhones,
          phones_goal: globalGoalPhones,
          opportunities_actual: globalOpportunities,
          opportunities_goal: globalGoalOpportunities,
          clients_actual: globalClients,
          clients_goal: globalGoalClients,
          overall_pct: globalOverall,
          contacted_today_total: globalTodayContacted,
          contacted_daily_goal_total: globalDailyGoal,
          today_pct_total: globalTodayPct,
        },
        members_progress: memberProgressList,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { daily_contacted, contacted, phones, opportunities, clients } = body;

    const newGoals = {
      daily_contacted: parseInt(daily_contacted, 10) || DEFAULT_GOALS.daily_contacted,
      contacted: parseInt(contacted, 10) || DEFAULT_GOALS.contacted,
      phones: parseInt(phones, 10) || DEFAULT_GOALS.phones,
      opportunities: parseInt(opportunities, 10) || DEFAULT_GOALS.opportunities,
      clients: parseInt(clients, 10) || DEFAULT_GOALS.clients,
    };

    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('weekly_goals', ${JSON.stringify(newGoals)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `;

    return NextResponse.json({ success: true, goals: newGoals });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
