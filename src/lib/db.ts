import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ Advertencia: DATABASE_URL no está configurada en las variables de entorno.');
}

export const sql = neon(process.env.DATABASE_URL || '');
