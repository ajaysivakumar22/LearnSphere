
import { NextResponse } from 'next/server';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';

export const runtime = 'nodejs';

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
            totalPoints: user.totalPoints,
            badgeLevel: user.badgeLevel,
        });
    } catch (err) {
        console.error('[GET /api/user/me]', err);
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
}
