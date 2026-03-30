import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { errorResponse, successResponse } from '../../../../../lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const userId = req.headers.get('x-user-id');
    const { quizId } = params;

    // Check if quiz exists and is active
    const quizRes = await query(
      `SELECT id, title, is_active, total_registered FROM quizzes WHERE id = $1`,
      [quizId]
    );

    if (quizRes.rows.length === 0) {
      return errorResponse('Quiz not found', 404);
    }

    const quiz = quizRes.rows[0];

    if (!quiz.is_active) {
      return errorResponse('Quiz is not active', 400);
    }

    // Check if user already registered
    const existingRes = await query(
      `SELECT id FROM quiz_registrations 
       WHERE user_id = $1 AND quiz_id = $2`,
      [userId, quizId]
    );

    if (existingRes.rows.length > 0) {
      return errorResponse('User already registered for this quiz', 400);
    }

    // Insert registration
    const regRes = await query(
      `INSERT INTO quiz_registrations (user_id, quiz_id, score, rank, registered_at) 
       VALUES ($1, $2, 0, NULL, NOW())
       RETURNING id, score, registered_at`,
      [userId, quizId]
    );

    // Increment total_registered count
    await query(
      `UPDATE quizzes SET total_registered = total_registered + 1 WHERE id = $1`,
      [quizId]
    );

    return successResponse(
      {
        registration_id: regRes.rows[0].id,
        quiz_id: quizId,
        score: regRes.rows[0].score,
        registered_at: regRes.rows[0].registered_at,
        message: 'Successfully registered for quiz',
      },
      201
    );
  } catch (error) {
    console.error('Error registering for quiz:', error);
    return errorResponse('Failed to register for quiz', 500);
  }
}
