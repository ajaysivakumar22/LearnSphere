import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getOrCreateUserFromClerk } from '@/lib/user-sync';
import { query } from '@/db';

export async function POST(req: Request) {
    try {
        const user = await getOrCreateUserFromClerk();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { courseId } = await req.json();

        const { rows } = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
        const course = rows[0];

        if (!course) {
            return new NextResponse("Course not found", { status: 404 });
        }

        // Check if Stripe key is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn("Stripe key missing. Using mock checkout flow.");

            // Auto-enroll for mock mode
            try {
                await query(`
                    INSERT INTO enrollments (user_id, course_id, status, enrolled_at, progress_pct, amount_paid, transaction_id)
                    VALUES ($1, $2, 'in_progress', NOW(), 0, $3, $4)
                    ON CONFLICT (user_id, course_id) DO UPDATE SET status = 'in_progress'
                `, [user.id, courseId, course.price || 0, 'mock_tx_' + Math.floor(Math.random() * 100000)]);
            } catch (e: any) {
                // If columns missing, try simpler insert
                if (e.code === '42703') {
                    await query(`
                        INSERT INTO enrollments (user_id, course_id, status, enrolled_at, progress_pct)
                        VALUES ($1, $2, 'in_progress', NOW(), 0)
                        ON CONFLICT (user_id, course_id) DO NOTHING
                     `, [user.id, courseId]);
                }
            }

            // Simulate success immediately for demo
            return NextResponse.json({
                url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/learner/courses/${courseId}/learn?success=1`
            });
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: course.currency || 'INR',
                        product_data: {
                            name: course.title,
                            description: course.description?.substring(0, 100),
                            images: course.image_url ? [course.image_url] : [],
                        },
                        unit_amount: Math.round(Number(course.price) * 100), // Convert to cents/paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/learner/courses/${courseId}/learn?success=1`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/learner/courses/${courseId}/learn?canceled=1`,
            metadata: {
                courseId: course.id,
                userId: user.id,
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("[STRIPE_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
