import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = {
    id,
    title: 'Sample Course',
    description: 'Course details will be loaded from the database.',
    tags: [],
    isPublished: false,
    visibility: 'everyone',
    accessRule: 'open',
    price: null,
    viewsCount: 0,
    adminId: 'admin-1',
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(course);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json({ id, ...body });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ success: true, id });
}
