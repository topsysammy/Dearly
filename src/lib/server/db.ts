import "server-only";
import { mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Lightweight, provider-agnostic database adapter.
 *
 * - Production: any PostgreSQL-compatible database via DATABASE_URL (node-postgres).
 * - Development without DATABASE_URL: an embedded, on-disk PostgreSQL (PGlite) in ./.data,
 *   so the full share flow can be exercised locally. It is never used in production.
 */

export type QueryResult<T> = { rows: T[] };
export interface Db {
  kind: "postgres" | "pglite";
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export class SharingNotConfiguredError extends Error {
  constructor() {
    super("Sharing is not configured: set DATABASE_URL to a PostgreSQL database.");
  }
}

import { SCHEMA } from "./schema";

type GlobalWithDb = typeof globalThis & { __dearlyDb?: Promise<Db | null> };
const g = globalThis as GlobalWithDb;

async function connect(): Promise<Db | null> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: Number(process.env.DATABASE_POOL_MAX ?? 5) });
    pool.on("error", () => console.error("[dearly] idle database client error"));
    const db: Db = {
      kind: "postgres",
      query: async (sql, params) => {
        const r = await pool.query(sql, params as unknown[]);
        return { rows: r.rows };
      },
    };
    await db.query(SCHEMA);
    return db;
  }

  if (process.env.NODE_ENV !== "production" && process.env.DEARLY_DISABLE_DEV_DB !== "1") {
    const { PGlite } = await import("@electric-sql/pglite");
    const dir = process.env.DEARLY_DEV_DB_DIR ?? path.join(process.cwd(), ".data", "pglite");
    await mkdir(dir, { recursive: true });
    const lite = await PGlite.create(dir);
    const db: Db = {
      kind: "pglite",
      query: async (sql, params) => {
        if (!params?.length && sql.includes(";")) {
          await lite.exec(sql);
          return { rows: [] };
        }
        const r = await lite.query(sql, params as unknown[]);
        return { rows: r.rows as never[] };
      },
    };
    await db.query(SCHEMA);
    console.info("[dearly] DATABASE_URL not set — using embedded development database at", dir);
    return db;
  }

  return null;
}

export async function getDb(): Promise<Db> {
  g.__dearlyDb ??= connect().catch((err) => {
    g.__dearlyDb = undefined;
    throw err;
  });
  const db = await g.__dearlyDb;
  if (!db) throw new SharingNotConfiguredError();
  return db;
}

export { SCHEMA };
