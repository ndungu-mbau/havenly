import { createAuth } from "@havenly/auth";
import { createDb } from "@havenly/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
