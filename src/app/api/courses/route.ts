import { NextResponse } from 'next/server';

// Sample courses data (in production, this would come from the database)
const courses = [
  {
    id: '1',
    title: 'Basics of Odoo CRM',
    description: 'Learn the fundamentals of customer relationship management with Odoo.',
    tags: ['CRM', 'Odoo', 'Sales'],
    isPublished: true,
    visibility: 'everyone',
    accessRule: 'open',
    price: null,
    viewsCount: 234,
    adminId: 'admin-1',
    createdAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Advanced Python Programming',
    description: 'Deep dive into Python with advanced concepts and real-world projects.',
    tags: ['Python', 'Programming'],
    isPublished: true,
    visibility: 'everyone',
    accessRule: 'open',
    price: null,
    viewsCount: 456,
    adminId: 'admin-1',
    createdAt: '2025-11-15T00:00:00Z',
  },
  {
    id: '3',
    title: 'Web Development Masterclass',
    description: 'Complete web development course covering HTML, CSS, JavaScript, and React.',
    tags: ['Web', 'React', 'JavaScript'],
    isPublished: false,
    visibility: 'everyone',
    accessRule: 'open',
    price: null,
    viewsCount: 0,
    adminId: 'admin-1',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: '4',
    title: 'Data Science Essentials',
    description: 'Introduction to data science, machine learning, and analytics.',
    tags: ['Data Science', 'ML'],
    isPublished: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 499,
    viewsCount: 189,
    adminId: 'admin-1',
    createdAt: '2025-10-20T00:00:00Z',
  },
];

export async function GET() {
  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCourse = {
      id: String(Date.now()),
      ...body,
      isPublished: false,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(newCourse, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
