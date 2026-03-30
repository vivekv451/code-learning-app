import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { errorResponse, successResponse } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    // Get user's premium status
    const userRes = await query(
      `SELECT is_premium FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return errorResponse('User not found', 404);
    }

    const user = userRes.rows[0];

    // Get active subscription if any
    let subscription = null;
    const subRes = await query(
      `SELECT plan_name, amount, purchased_at, expiry_date FROM premium_subscriptions 
       WHERE user_id = $1 AND expiry_date > NOW()
       ORDER BY expiry_date DESC
       LIMIT 1`,
      [userId]
    );

    if (subRes.rows.length > 0) {
      subscription = subRes.rows[0];
    }

    // Available plans
    const plans = [
      {
        id: 'monthly',
        name: '30-Day Plan',
        amount: 49,
        duration_days: 30,
        currency: 'INR',
      },
      {
        id: 'yearly',
        name: '365-Day Plan',
        amount: 399,
        duration_days: 365,
        currency: 'INR',
      },
    ];

    return successResponse({
      is_premium: user.is_premium,
      active_subscription: subscription,
      available_plans: plans,
    });
  } catch (error) {
    console.error('Error getting premium info:', error);
    return errorResponse('Failed to get premium info', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const body = await req.json();
    const { plan_id } = body;

    if (!plan_id) {
      return errorResponse('plan_id is required', 400);
    }

    // Validate plan
    let duration_days: number;
    let amount: number;
    let plan_name: string;

    if (plan_id === 'monthly') {
      duration_days = 30;
      amount = 49;
      plan_name = '30-Day Plan';
    } else if (plan_id === 'yearly') {
      duration_days = 365;
      amount = 399;
      plan_name = '365-Day Plan';
    } else {
      return errorResponse('Invalid plan_id', 400);
    }

    // Insert subscription
    const subRes = await query(
      `INSERT INTO premium_subscriptions (user_id, plan_name, amount, purchased_at, expiry_date) 
       VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '1 day' * $4)
       RETURNING id, plan_name, amount, purchased_at, expiry_date`,
      [userId, plan_name, amount, duration_days]
    );

    // Update user is_premium flag
    await query(
      `UPDATE users SET is_premium = true WHERE id = $1`,
      [userId]
    );

    const subscription = subRes.rows[0];

    return successResponse(
      {
        subscription_id: subscription.id,
        plan_name: subscription.plan_name,
        amount: subscription.amount,
        purchased_at: subscription.purchased_at,
        expiry_date: subscription.expiry_date,
        message: 'Premium subscription activated successfully',
      },
      201
    );
  } catch (error) {
    console.error('Error processing premium purchase:', error);
    return errorResponse('Failed to process premium purchase', 500);
  }
}
