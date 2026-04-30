/**
 * lib/server/db.ts
 * Cliente postgres.js singleton para Supabase.
 * Usa globalThis para evitar agotar conexiones en desarrollo (Next.js HMR).
 */

import postgres from "postgres";

const globalForDb = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
};

function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getDb(): postgres.Sql {
  if (!globalForDb.postgresClient) {
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!url) {
      throw new Error("DATABASE_URL (or POSTGRES_URL) is not configured.");
    }

    const connectTimeoutSeconds = readPositiveIntEnv("DB_CONNECT_TIMEOUT_SECONDS", 20);
    const idleTimeoutSeconds = readPositiveIntEnv("DB_IDLE_TIMEOUT_SECONDS", 30);
    const maxConnections = readPositiveIntEnv("DB_MAX_CONNECTIONS", 10);

    globalForDb.postgresClient = postgres(url, {
      ssl: "require",
      max: maxConnections,
      idle_timeout: idleTimeoutSeconds,
      connect_timeout: connectTimeoutSeconds,
    });
  }
  return globalForDb.postgresClient;
}
