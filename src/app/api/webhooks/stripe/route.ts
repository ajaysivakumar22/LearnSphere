
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { query } from "@/db";
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session?.metadata?.userId;
    const courseId = session?.metadata?.courseId;

    if (event.type === "checkout.session.completed") {
        if (!userId || !courseId) {
            return new NextResponse(`Webhook Error: Missing metadata`, { status: 400 });
        }

        try {
            // Enroll the user
            await query(`
        INSERT INTO enrollments (user_id, course_id, status, enrolled_at, progress_pct, transaction_id, amount_paid)
        VALUES ($1, $2, 'in_progress', NOW(), 0, $3, $4)
        ON CONFLICT (user_id, course_id) DO UPDATE 
        SET status = 'in_progress', transaction_id = $3, amount_paid = $4
      `, [
                userId,
                courseId,
                session.payment_intent as string,
                (session.amount_total || 0) / 100 // Convert back to currency unit
            ]);
        } catch (error: any) {
            // Gracefully handle missing columns if schema not fully migrated
            // Fallback to basic enrollment without transaction details
            if (error.code === '42703') {
                await query(`
            INSERT INTO enrollments (user_id, course_id, status, enrolled_at, progress_pct)
            VALUES ($1, $2, 'in_progress', NOW(), 0)
            ON CONFLICT (user_id, course_id) DO NOTHING
          `, [userId, courseId]);
            } else {
                console.error("[STRIPE_WEBHOOK]", error);
                return new NextResponse('Database Error', { status: 500 });
            }
        }
    }

    return new NextResponse(null, { status: 200 });
}
