/**
 * AUTH → USER SYNC — LearnSphere
 *
 * Bridges Clerk authentication with the PostgreSQL `users` table.
 *
 * getOrCreateUserFromClerk():
 *   - MUST be called ONLY inside authenticated backend requests (API routes)
 *   - Uses Clerk's `currentUser()` to obtain email + name
 *   - Checks if a row with that email already exists in `users`
 *   - If not, inserts a new learner row with default points/badge
 *   - Returns the internal `users.id` (UUID) for downstream operations
 *
 * Safety guarantees:
 *   - Guests NEVER trigger this (returns null if no Clerk session)
 *   - Only creates 'learner' role — never admin/instructor
 *   - Does NOT store Clerk's userId in the database
 *   - Does NOT modify the schema — uses existing columns only
 *   - Uses parameterised queries — no SQL injection risk
 */

import { currentUser } from '@clerk/nextjs/server';
import { query } from '@/db';

export interface SyncedUser {
  id: string;           // users.id  (UUID)
  email: string;        // users.email
  name: string;         // users.name
  role: string;         // users.role (user_role enum)
  totalPoints: number;  // users.total_points
  badgeLevel: string;   // users.badge_level
}

/**
 * Resolve the current Clerk user to an internal `users` row.
 *
 * @returns The synced user record, or `null` if not authenticated.
 *
 * Typical usage inside an API route handler:
 *
 *   const user = await getOrCreateUserFromClerk();
 *   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   // user.id is the UUID from the users table
 */
export async function getOrCreateUserFromClerk(): Promise<SyncedUser | null> {
  // 1. Get the current Clerk user (server-side)
  const clerkUser = await currentUser();

  // No Clerk session → guest or unauthenticated. Return null immediately.
  if (!clerkUser) return null;

  // 2. Extract email (required) and name (optional, with fallback)
  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    // Clerk user with no email — should not happen in practice.
    // Treat as unauthenticated rather than crashing.
    return null;
  }

  const name =
    clerkUser.fullName ||
    clerkUser.firstName ||
    email.split('@')[0] ||
    'User';

  // 3. Check if user already exists
  const { rows: existing } = await query<SyncedUser>(
    `SELECT id, email, name, role, 
            total_points AS "totalPoints", 
            badge_level AS "badgeLevel" 
     FROM users WHERE email = $1`,
    [email],
  );

  if (existing.length > 0) {
    return existing[0];
  }

  // 4. User does not exist — insert as learner with defaults
  //    Schema defaults applied: total_points=0, badge_level='Newbie',
  //    role='learner', created_at=now(), updated_at=now()
  const { rows: inserted } = await query<SyncedUser>(
    `INSERT INTO users (email, name, role, total_points, badge_level)
     VALUES ($1, $2, 'learner', 0, 'Newbie')
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email, name, role, 
               total_points AS "totalPoints", 
               badge_level AS "badgeLevel"`,
    [email, name],
  );

  if (inserted.length > 0) {
    return inserted[0];
  }

  // 5. Fallback: If INSERT failed due to conflict (race condition), fetch the record again
  const { rows: retry } = await query<SyncedUser>(
    `SELECT id, email, name, role, 
            total_points AS "totalPoints", 
            badge_level AS "badgeLevel" 
     FROM users WHERE email = $1`,
    [email],
  );

  return retry[0] || null;
}
