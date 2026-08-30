import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

function parseLinkedInDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  let clean = dateStr.trim().replace(/;+$/, '').replace(/["']/g, '');
  if (!clean) return null;

  // Format: "09 Mar 2026" or "9 Mar 2026"
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

  // Format: "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // Format: "DD/MM/YYYY" or "MM/DD/YYYY"
  const slashParts = clean.split('/');
  if (slashParts.length === 3) {
    const y = slashParts[2];
    const m = slashParts[1].padStart(2, '0');
    const d = slashParts[0].padStart(2, '0');
    if (y.length === 4) return `${y}-${m}-${d}`;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No se enviaron filas válidas' }, { status: 400 });
    }

    let newlyInserted = 0;
    let existingUpdated = 0;
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

      const connectedOn = parseLinkedInDate(dateRaw);

      try {
        if (url) {
          // Check if contact already exists by linkedin_url
          const existing = await sql`SELECT id, status, notes FROM contacts WHERE linkedin_url = ${url} LIMIT 1`;

          if (existing.length > 0) {
            // Already exists -> update only missing fields, NEVER overwrite status or notes
            await sql`
              UPDATE contacts
              SET
                first_name = COALESCE(NULLIF(${firstName}, ''), first_name),
                last_name = COALESCE(NULLIF(${lastName}, ''), last_name),
                email = COALESCE(NULLIF(${email}, ''), email),
                phone = COALESCE(NULLIF(${phone}, ''), phone),
                company = COALESCE(NULLIF(${company}, ''), company),
                position = COALESCE(NULLIF(${position}, ''), position),
                connected_on = COALESCE(${connectedOn}, connected_on),
                updated_at = NOW()
              WHERE linkedin_url = ${url}
            `;
            existingUpdated++;
          } else {
            // New record
            await sql`
              INSERT INTO contacts (first_name, last_name, linkedin_url, email, phone, company, position, connected_on, status, assigned_to)
              VALUES (${firstName}, ${lastName || null}, ${url}, ${email || null}, ${phone || null}, ${company || null}, ${position || null}, ${connectedOn || null}, 'Sin contactar', 'Gabino')
            `;
            newlyInserted++;
          }
        } else {
          // No URL -> Insert if email not exists
          if (email) {
            const existingEmail = await sql`SELECT id FROM contacts WHERE email = ${email} LIMIT 1`;
            if (existingEmail.length > 0) {
              existingUpdated++;
              continue;
            }
          }

          await sql`
            INSERT INTO contacts (first_name, last_name, linkedin_url, email, phone, company, position, connected_on, status, assigned_to)
            VALUES (${firstName}, ${lastName || null}, null, ${email || null}, ${phone || null}, ${company || null}, ${position || null}, ${connectedOn || null}, 'Sin contactar', 'Gabino')
          `;
          newlyInserted++;
        }
      } catch (err: unknown) {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      newlyInserted,
      existingUpdated,
      skipped,
      message: `Procesamiento completado: ${newlyInserted} nuevos prospectos agregados, ${existingUpdated} ya existentes omitidos/actualizados sin alterar sus estados.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
