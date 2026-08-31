import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, currentPassword, newPassword, name, role, color } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    const users = await sql`
      SELECT id, name, email, role, color, password
      FROM team_members
      WHERE id = ${userId}
      LIMIT 1;
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = users[0];

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Debes ingresar tu contraseña actual para cambiarla' }, { status: 400 });
      }

      const validPassword = user.password || '123456';
      if (currentPassword !== validPassword) {
        return NextResponse.json({ error: 'La contraseña actual no es correcta' }, { status: 401 });
      }

      if (newPassword.length < 4) {
        return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 4 caracteres' }, { status: 400 });
      }

      await sql`
        UPDATE team_members
        SET password = ${newPassword}
        WHERE id = ${userId};
      `;
    }

    // If changing name, role or color
    const updatedName = name ? name.trim() : user.name;
    const updatedRole = role ? role.trim() : user.role;
    const updatedColor = color ? color : user.color;

    const result = await sql`
      UPDATE team_members
      SET
        name = ${updatedName},
        role = ${updatedRole},
        color = ${updatedColor}
      WHERE id = ${userId}
      RETURNING id, name, email, role, color;
    `;

    return NextResponse.json({
      success: true,
      message: 'Perfil y seguridad actualizados con éxito.',
      user: result[0],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
