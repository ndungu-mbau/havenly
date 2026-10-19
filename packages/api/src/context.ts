import type { Session } from "@havenly/auth";
import type { Database } from "@havenly/db";

export type Context = {
  session: Session | null;
  db: Database;
};
