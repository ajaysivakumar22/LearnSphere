import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, userId } = body;

    const enrollment = {
      id: String(Date.now()),
      courseId,
      userId,
      status: 'enrolled',
      progressPct: 0,
      enrolledAt: new Date().toISOString(),
    };

    return NextResponse.json(enrollment, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
