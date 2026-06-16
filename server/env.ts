// Load .env files into process.env for the custom server process, before any
// module that reads env (Prisma client, NextAuth secret, Anthropic key).
// Imported first in server/index.ts so it runs before those modules evaluate.
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
