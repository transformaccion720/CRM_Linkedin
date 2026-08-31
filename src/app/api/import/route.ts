import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

function parseLinkedInDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  let clean = dateStr.trim().replace(/;+$/, '').replace(/["']/g, '');
  if (!clean) return null;

  const parts = clean.split(' ');
  if (parts.length === 3) {
    const day = parts[0].replace(/\D/g, '').padStart(2, '0');
    const monthStr = parts[1].toLowerCase().slice(0, 3);
    const year = parts[2].replace(/\D/g, '');

    const months: Record<string, string> = {
      jan: '01', ene: '01',
      feb: '02',
      mar: '03',
      apr: '04', abr: '04',
      may: '05',
      jun: '06',
      jul: '07',
      aug: '08', ago: '08',
      sep: '09', set: '09',
      oct: '10',
      nov: '11',
      dec: '12', dic: '12',
    };

    const month = months[monthStr] || '01';
    if (year && year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  const slashParts = clean.split('/');
  if (slashParts.length === 3) {
    const y = slashParts[2];
    const m = slashParts[1].padStart(2, '0');
    const d = slashParts[0].padStart(2, '0');
    if (y.length === 4) return `${y}-${m}-${d}`;
  }

  return null;
}

interface ParsedContact {
  firstName: string;
  lastName: string | null;
  url: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  connectedOn: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows = body.rows;
    const assignedTo = (body.assignedTo || 'Gabino').trim();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No se enviaron filas válidas' }, { status: 400 });
    }

    const validContacts: ParsedContact[] = [];
    let skipped = 0;

    for (const raw of rows) {
      let firstName = '';
      let lastName = '';
      let url = '';
      let email = '';
      let phone = '';
      let company = '';
      let position = '';
      let dateRaw = '';

      if (Array.isArray(raw)) {
        firstName = String(raw[0] || '').trim();
        lastName = String(raw[1] || '').trim();
        url = String(raw[2] || '').trim();
        email = String(raw[3] || '').trim();
        company = String(raw[4] || '').trim();
        position = String(raw[5] || '').trim();
        dateRaw = String(raw[6] || '').trim();
        phone = String(raw[7] || '').trim();
      } else if (typeof raw === 'object' && raw !== null) {
        const rowNorm: Record<string, string> = {};
        for (const [k, v] of Object.entries(raw)) {
          const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          rowNorm[cleanKey] = String(v || '').trim().replace(/;+$/, '');
        }

        firstName = rowNorm['firstname'] || rowNorm['nombre'] || rowNorm['first'] || '';
        lastName = rowNorm['lastname'] || rowNorm['apellido'] || rowNorm['last'] || '';
        url = rowNorm['url'] || rowNorm['linkedinurl'] || rowNorm['perfil'] || rowNorm['link'] || '';
        email = rowNorm['emailaddress'] || rowNorm['email'] || rowNorm['correo'] || rowNorm['correoelectronico'] || '';
        phone = rowNorm['phone'] || rowNorm['telefono'] || rowNorm['celular'] || rowNorm['whatsapp'] || rowNorm['numero'] || '';
        company = rowNorm['company'] || rowNorm['empresa'] || rowNorm['compania'] || '';
        position = rowNorm['position'] || rowNorm['cargo'] || rowNorm['puesto'] || rowNorm['headline'] || '';
        dateRaw = rowNorm['connectedon'] || rowNorm['fechadeconexion'] || rowNorm['fecha'] || rowNorm['connected'] || '';
      }

      firstName = firstName.replace(/;+$/, '').trim();
      lastName = lastName.replace(/;+$/, '').trim();
      url = url.replace(/;+$/, '').trim();
      email = email.replace(/;+$/, '').trim();
      phone = phone.replace(/;+$/, '').trim();
      company = company.replace(/;+$/, '').trim();
      position = position.replace(/;+$/, '').trim();
      dateRaw = dateRaw.replace(/;+$/, '').trim();

      if (!firstName || firstName.toLowerCase() === 'first name' || firstName.toLowerCase() === 'nombre') {
        skipped++;
        continue;
      }

      validContacts.push({
        firstName,
        lastName: lastName || null,
        url: url || null,
        email: email || null,
        phone: phone || null,
        company: company || null,
        position: position || null,
        connectedOn: parseLinkedInDate(dateRaw),
      });
    }

    if (validContacts.length === 0) {
      return NextResponse.json({
        success: true,
        newlyInserted: 0,
        existingUpdated: 0,
        skipped,
        message: 'No hubo contactos válidos para procesar.',
      });
    }

    // High Performance Batch Operation:
    // 1. Fetch all existing linkedin_urls for this member in ONE single SQL query
    const urlsWithContact = validContacts.map((c) => c.url).filter(Boolean) as string[];
    const existingUrlMap = new Set<string>();

    if (urlsWithContact.length > 0) {
      const existingRows = await sql`
        SELECT linkedin_url 
        FROM contacts 
        WHERE assigned_to = ${assignedTo} 
          AND linkedin_url = ANY(${urlsWithContact})
      `;
      existingRows.forEach((r) => {
        if (r.linkedin_url) existingUrlMap.add(r.linkedin_url);
      });
    }

    // 2. Separate into toInsert and toUpdate
    const toInsert: ParsedContact[] = [];
    const toUpdate: ParsedContact[] = [];

    for (const c of validContacts) {
      if (c.url && existingUrlMap.has(c.url)) {
        toUpdate.push(c);
      } else {
        toInsert.push(c);
      }
    }

    // 3. Batch INSERT via unnest (1 single lightning fast query for all inserts)
    let newlyInserted = 0;
    if (toInsert.length > 0) {
      const firstNames = toInsert.map((c) => c.firstName);
      const lastNames = toInsert.map((c) => c.lastName);
      const urls = toInsert.map((c) => c.url);
      const emails = toInsert.map((c) => c.email);
      const phones = toInsert.map((c) => c.phone);
      const companies = toInsert.map((c) => c.company);
      const positions = toInsert.map((c) => c.position);
      const connectedOns = toInsert.map((c) => c.connectedOn);

      const insertResult = await sql`
        INSERT INTO contacts (
          first_name, last_name, linkedin_url, email, phone, 
          company, position, connected_on, status, assigned_to
        )
        SELECT 
          fn, ln, u, em, ph, comp, pos, 
          CASE WHEN con IS NOT NULL AND con != '' THEN con::date ELSE NULL END,
          'Sin contactar',
          ${assignedTo}
        FROM UNNEST(
          ${firstNames}::text[],
          ${lastNames}::text[],
          ${urls}::text[],
          ${emails}::text[],
          ${phones}::text[],
          ${companies}::text[],
          ${positions}::text[],
          ${connectedOns}::text[]
        ) AS t(fn, ln, u, em, ph, comp, pos, con)
        ON CONFLICT DO NOTHING
        RETURNING id;
      `;
      newlyInserted = insertResult.length;
    }

    // 4. Batch UPDATE via UNNEST (1 single fast query for all updates, preserving status and notes)
    let existingUpdated = toUpdate.length;
    if (toUpdate.length > 0) {
      const firstNames = toUpdate.map((c) => c.firstName);
      const lastNames = toUpdate.map((c) => c.lastName);
      const urls = toUpdate.map((c) => c.url);
      const emails = toUpdate.map((c) => c.email);
      const phones = toUpdate.map((c) => c.phone);
      const companies = toUpdate.map((c) => c.company);
      const positions = toUpdate.map((c) => c.position);
      const connectedOns = toUpdate.map((c) => c.connectedOn);

      await sql`
        UPDATE contacts c
        SET
          first_name = COALESCE(NULLIF(t.fn, ''), c.first_name),
          last_name = COALESCE(NULLIF(t.ln, ''), c.last_name),
          email = COALESCE(NULLIF(t.em, ''), c.email),
          phone = COALESCE(NULLIF(t.ph, ''), c.phone),
          company = COALESCE(NULLIF(t.comp, ''), c.company),
          position = COALESCE(NULLIF(t.pos, ''), c.position),
          connected_on = CASE 
            WHEN t.con IS NOT NULL AND t.con != '' THEN t.con::date 
            ELSE c.connected_on 
          END,
          updated_at = NOW()
        FROM (
          SELECT 
            fn, ln, u, em, ph, comp, pos, con
          FROM UNNEST(
            ${firstNames}::text[],
            ${lastNames}::text[],
            ${urls}::text[],
            ${emails}::text[],
            ${phones}::text[],
            ${companies}::text[],
            ${positions}::text[],
            ${connectedOns}::text[]
          ) AS u(fn, ln, u, em, ph, comp, pos, con)
        ) t
        WHERE c.linkedin_url = t.u 
          AND c.assigned_to = ${assignedTo};
      `;
    }

    return NextResponse.json({
      success: true,
      newlyInserted,
      existingUpdated,
      skipped,
      message: `Procesamiento ultra-rápido para ${assignedTo}: ${newlyInserted} nuevos agregados, ${existingUpdated} omitidos/actualizados sin alterar notas.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
