import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from .env.local.");
}

const rows =
  await neon(process.env.DATABASE_URL)`SELECT current_database() AS database, current_schema() AS schema`;

console.log(`Connected to database "${rows[0].database}" in schema "${rows[0].schema}".`);
