/**
 * DATABASE LAYER — LearnSphere
 *
 * PostgreSQL connection pool using `pg`.
 *
 * - Reads DATABASE_URL from process.env
 * - Creates a single Pool instance (module-level singleton)
 * - Exports a `query(text, params?)` helper for reuse in API routes
 * - NO queries are executed on import — the pool connects lazily on first use
 * - Safe to import from any server-side module
 *
 * Tables (6): users, courses, lessons, enrollments, quiz_questions, quiz_attempts
 * Enums (3): user_role, lesson_type, enrollment_status
 */

import { Pool, type QueryResultRow } from 'pg';

// Singleton pool — created once per Node.js process.
// `pg.Pool` manages a set of reusable connections internally.
// Connections are acquired on demand and released after each query.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Sensible defaults for a serverless-friendly Next.js deployment:
  max: 10,              // max connections in the pool
  idleTimeoutMillis: 30_000,   // close idle connections after 30s
  connectionTimeoutMillis: 5_000, // fail fast if DB is unreachable
});

/**
 * Execute a parameterised SQL query against the connection pool.
 *
 * @param text  - SQL string with $1, $2, … placeholders
 * @param params - Values bound to the placeholders (prevents SQL injection)
 * @returns      The full pg QueryResult (rows, rowCount, fields, etc.)
 *
 * Usage:
 *   const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return pool.query<T>(text, params);
}

/**
 * Expose the pool directly for advanced use cases (transactions, etc.).
 * Prefer the `query()` helper for simple single-statement operations.
 */
export { pool };
