import { drizzle } from "drizzle-orm/node-postgres";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export function createDb(env: DatabaseConfig) {
  return drizzle(env.DATABASE_URL, { relations });
}

export type Database = ReturnType<typeof createDb>;

export * from "./schema";
export * from "./relations";
export * from "./config";
export * from "drizzle-orm";
