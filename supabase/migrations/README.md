# Supabase Migrations

All schema changes must go through numbered migration files. **No manual SQL in production.**

## Rules

1. **Always create a new file** — never edit an existing migration
2. **Number sequentially** — 003_description.sql, 004_description.sql, etc.
3. **Make migrations idempotent** — use IF NOT EXISTS, DO $$ BEGIN ... EXCEPTION ... END $$
4. **Test first** — run against staging before production
5. **Document** — add a comment header with date and description

## Running Migrations

Open Supabase → SQL Editor → paste migration SQL → run.

## Migration Log

| # | File | Date | Description | Applied |
|---|------|------|-------------|---------|
| 001 | 001_feature_flags.sql | 2026-02-25 | Feature flags table + seed data | ✅ |
| 002 | 002_database_indexes.sql | 2026-02-25 | Performance indexes on hot columns | ✅ |
