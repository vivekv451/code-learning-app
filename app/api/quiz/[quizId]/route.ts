import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { errorResponse, successResponse } from '../../../../lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const userId = req.headers.get('x-user-id');
    const { quizId } = params;

    // Fetch quiz details
    const quizRes = await query(
      `SELECT id, title, description, total_questions, max_score, difficulty, month, year, is_active 
       FROM quizzes WHERE id = $1`,
      [quizId]
    );

    if (quizRes.rows.length === 0) {
      return errorResponse('Quiz not found', 404);
    }

    const quiz = quizRes.rows[0];

    // Check registration status
    const regRes = await query(
      `SELECT score, rank FROM quiz_registrations 
       WHERE user_id = $1 AND quiz_id = $2`,
      [userId, quizId]
    );

    const isRegistered = regRes.rows.length > 0;
    const registration = isRegistered ? regRes.rows[0] : null;

    // Get leaderboard stats
    const statsRes = await query(
      `SELECT COUNT(*) as total_registered FROM quiz_registrations 
       WHERE quiz_id = $1`,
      [quizId]
    );

    return successResponse({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      total_questions: quiz.total_questions,
      max_score: quiz.max_score,
      difficulty: quiz.difficulty,
      month: quiz.month,
      year: quiz.year,
      is_active: quiz.is_active,
      is_registered: isRegistered,
      registration: registration,
      total_registered: statsRes.rows[0].total_registered,
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return errorResponse('Failed to fetch quiz', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const { quizId } = params;
    const body = await req.json();
    const { title, description, total_questions, max_score, difficulty, is_active } = body;

    if (!title || !description) {
      return errorResponse('Title and description are required', 400);
    }

    // Update quiz
    const updateRes = await query(
      `UPDATE quizzes 
       SET title = $1, description = $2, total_questions = $3, max_score = $4, difficulty = $5, is_active = $6
       WHERE id = $7
       RETURNING id, title, description, total_questions, max_score, difficulty, month, year, is_active`,
      [title, description, total_questions || null, max_score || null, difficulty || 'medium', is_active !== undefined ? is_active : true, quizId]
    );

    if (updateRes.rows.length === 0) {
      return errorResponse('Quiz not found', 404);
    }

    return successResponse(updateRes.rows[0]);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return errorResponse('Failed to update quiz', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const { quizId } = params;

    // Delete quiz (cascades to quiz_registrations and leaderboard entries)
    const result = await query(
      `DELETE FROM quizzes WHERE id = $1 RETURNING id`,
      [quizId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Quiz not found', 404);
    }

    return successResponse({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return errorResponse('Failed to delete quiz', 500);
  }
}
