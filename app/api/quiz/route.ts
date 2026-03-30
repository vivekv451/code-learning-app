import { NextRequest } from 'next/server';
import { query } from '../../../lib/db';
import { getAuthUser, successResponse, errorResponse } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let whereClause = '1=1';
    const params: any[] = [user.id];

    if (month) {
      params.push(month);
      whereClause += ` AND month = $${params.length}`;
    }
    if (year) {
      params.push(parseInt(year));
      whereClause += ` AND year = $${params.length}`;
    }

    const quizQuery = `SELECT q.*, 
              CASE WHEN qr.user_id IS NOT NULL THEN true ELSE false END as is_registered,
              qr.score, qr.rank_school, qr.rank_national
       FROM quizzes q
       LEFT JOIN quiz_registrations qr ON q.id = qr.quiz_id AND qr.user_id = $1
       WHERE ${whereClause}
       ORDER BY q.quiz_date DESC`;

    const result = await query(quizQuery, params);
    return successResponse({ quizzes: result.rows });
  } catch (error) {
    console.error('Get quizzes error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, month, year, quiz_date, duration_minutes, total_questions, prize_pool, status } = body;

    if (!title || !subject) return errorResponse('Title and subject required', 400);

    const result = await query(
      `INSERT INTO quizzes (title, subject, month, year, quiz_date, duration_minutes, total_questions, prize_pool, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, subject, month, year, quiz_date, duration_minutes || 60, total_questions || 50, prize_pool, status || 'upcoming']
    );

    return successResponse({ quiz: result.rows[0] }, 201);
  } catch (error) {
    console.error('Create quiz error:', error);
    return errorResponse('Internal server error', 500);
  }
}
