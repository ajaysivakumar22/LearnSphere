/**
 * GET /api/auth/me — Returns the current user's DB record (role, name, etc.)
 *
 * Called by the frontend AuthProvider after Clerk confirms sign-in,
 * so that userRole reflects the ACTUAL DB value instead of being hardcoded.
 */

import { NextResponse } from 'next/server';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

export const runtime = 'nodejs'; // 🔑 REQUIRED for Clerk server auth

export async function GET() {
  try {
    const user = await getOrCreateUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error('[GET /api/auth/me]', err);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}
