/**
 * DATABASE LAYER — LearnSphere
 *
 * Target database: PostgreSQL (direct connection, no Supabase)
 *
 * STATUS: Placeholder only. No active database connection.
 * The application currently uses localStorage via CourseStoreProvider,
 * AuthProvider, and ThemeProvider (all in src/lib/).
 *
 * MIGRATION PLAN:
 * 1. Install a PostgreSQL client (e.g. pg, postgres, or prisma)
 * 2. Define the connection in this file using DATABASE_URL env var
 * 3. Import and use the schema from ./schema.ts
 * 4. Gradually replace localStorage calls with database queries
 *
 * IMPORTANT: Do not import this file until a real connection is configured.
 */

// Future: export const db = ...
export {};
