import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña requeridos' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user by email
    const users = await sql`
      SELECT id, name, email, role, color, password
      FROM team_members
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1;
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'No existe una cuenta registrada con este correo electrónico.' }, { status: 401 });
    }

    const user = users[0];

    // Check password (fallback to 123456 if none set)
    const validPassword = user.password || '123456';
    if (password !== validPassword) {
      return NextResponse.json({ error: 'Contraseña incorrecta. Verifica tus credenciales.' }, { status: 401 });
    }

    // Return sanitized user object
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        color: user.color,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
