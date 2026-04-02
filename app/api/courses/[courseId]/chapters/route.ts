import { NextRequest } from 'next/server';
import { query } from '../../../../../lib/db';
import { getAuthUser, successResponse, errorResponse } from '../../../../../lib/auth';

export async function GET(req: NextRequest, context: any) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const { courseId } = context.params;

    const courseResult = await query(
      'SELECT is_premium FROM courses WHERE id = $1 OR slug = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) return errorResponse('Course not found', 404);

    if (courseResult.rows[0].is_premium) {
      const userResult = await query('SELECT is_premium FROM users WHERE id = $1', [user.id]);
      if (!userResult.rows[0].is_premium) {
        return errorResponse('Course is premium. Upgrade to access', 403);
      }
    }

    const chaptersResult = await query(
      `SELECT c.*, 
              EXISTS(SELECT 1 FROM user_chapter_completions WHERE user_id = $1 AND chapter_id = c.id) as completed
       FROM chapters c
       WHERE c.course_id = (SELECT id FROM courses WHERE id = $2 OR slug = $2)
       ORDER BY c.chapter_number ASC`,
      [user.id, courseId]
    );

    return successResponse({ chapters: chaptersResult.rows });
  } catch (error) {
    console.error('Get chapters error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(req: NextRequest, context: any) {
  try {
    const { courseId } = context.params;
    const body = await req.json();
    const { chapter_number, title, content_text, code_example, code_language, tip, practical_title, practical_task, is_free, xp_reward } = body;

    if (!chapter_number || !title) return errorResponse('Chapter number and title required', 400);

    const courseResult = await query('SELECT id FROM courses WHERE id = $1 OR slug = $1', [courseId]);
    if (courseResult.rows.length === 0) return errorResponse('Course not found', 404);

    const result = await query(
      `INSERT INTO chapters (course_id, chapter_number, title, content_text, code_example, code_language, tip, practical_title, practical_task, is_free, xp_reward)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [courseResult.rows[0].id, chapter_number, title, content_text, code_example, code_language, tip, practical_title, practical_task, is_free || false, xp_reward || 10]
    );

    return successResponse({ chapter: result.rows[0] }, 201);
  } catch (error) {
    console.error('Create chapter error:', error);
    return errorResponse('Internal server error', 500);
  }
}
