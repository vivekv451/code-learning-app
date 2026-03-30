import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quiz_id');
    const type = searchParams.get('type') || 'national'; // 'school' or 'national'
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!quizId) {
      return errorResponse('quiz_id is required', 400);
    }

    // Verify quiz exists
    const quizRes = await query(
      `SELECT id FROM quizzes WHERE id = $1`,
      [quizId]
    );

    if (quizRes.rows.length === 0) {
      return errorResponse('Quiz not found', 404);
    }

    let leaderboardQuery: string;
    let params: (string | number)[];

    if (type === 'school') {
      // Get user's school first
      const userRes = await query(
        `SELECT school_id FROM users WHERE id = $1`,
        [userId]
      );

      if (userRes.rows.length === 0 || !userRes.rows[0].school_id) {
        return errorResponse('User school not found', 400);
      }

      const schoolId = userRes.rows[0].school_id;

      leaderboardQuery = `
        SELECT 
          qr.rank,
          qr.score,
          qr.registered_at,
          u.id as user_id,
          u.first_name,
          u.last_name,
          u.class_level,
          s.name as school_name,
          s.registration_code
        FROM quiz_registrations qr
        JOIN users u ON qr.user_id = u.id
        LEFT JOIN schools s ON u.school_id = s.id
        WHERE qr.quiz_id = $1 AND u.school_id = $2
        ORDER BY qr.score DESC, qr.registered_at ASC
        LIMIT $3
      `;
      params = [quizId, schoolId, limit];
    } else {
      // National leaderboard
      leaderboardQuery = `
        SELECT 
          qr.rank,
          qr.score,
          qr.registered_at,
          u.id as user_id,
          u.first_name,
          u.last_name,
          u.class_level,
          s.name as school_name,
          s.registration_code
        FROM quiz_registrations qr
        JOIN users u ON qr.user_id = u.id
        LEFT JOIN schools s ON u.school_id = s.id
        WHERE qr.quiz_id = $1
        ORDER BY qr.score DESC, qr.registered_at ASC
        LIMIT $2
      `;
      params = [quizId, limit];
    }

    const leaderboardRes = await query(leaderboardQuery, params);

    // Enrich each entry with rank position
    const leaderboard = leaderboardRes.rows.map((entry, index) => ({
      rank: index + 1,
      score: entry.score,
      user: {
        id: entry.user_id,
        first_name: entry.first_name,
        last_name: entry.last_name,
        class_level: entry.class_level,
        school: {
          name: entry.school_name,
          code: entry.registration_code,
        },
      },
      registered_at: entry.registered_at,
    }));

    return successResponse({
      quiz_id: quizId,
      type: type,
      leaderboard: leaderboard,
      count: leaderboard.length,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return errorResponse('Failed to fetch leaderboard', 500);
  }
}
