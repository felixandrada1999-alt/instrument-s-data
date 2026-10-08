import { neon } from "@neondatabase/serverless";

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("Falta configurar DATABASE_URL con la conexión de Neon en Vercel.");
  }
  return neon(connectionString);
}

export async function ensureInstrumentTable() {
  const sql = getDatabase();
  await sql`
    CREATE TABLE IF NOT EXISTS instruments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      uploader_name VARCHAR(120) NOT NULL,
      instrument_name VARCHAR(160) NOT NULL,
      part_number VARCHAR(120) NOT NULL,
      serial_number VARCHAR(120) NOT NULL,
      photo_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return sql;
}