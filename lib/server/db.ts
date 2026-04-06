/**
 * lib/server/db.ts
 * Cliente postgres.js singleton para Supabase.
 * Solo se instancia en el servidor (Node.js runtime).
 */

import postgres from "postgres";

let client: postgres.Sql | null = null;

export function getDb(): postgres.Sql {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not configured.");
    client = postgres(url, {
      ssl: "require",
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return client;
}
