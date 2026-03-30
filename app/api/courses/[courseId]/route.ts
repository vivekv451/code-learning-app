import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, successResponse, errorResponse } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const { courseId } = params;

    const courseResult = await query(
      'SELECT * FROM courses WHERE id = $1 OR slug = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) return errorResponse('Course not found', 404);

    const course = courseResult.rows[0];

    if (course.is_premium) {
      const userResult = await query('SELECT is_premium FROM users WHERE id = $1', [user.id]);
      if (!userResult.rows[0].is_premium) {
        return successResponse({ ...course, locked: true });
      }
    }

    const progressResult = await query(
      'SELECT * FROM user_course_progress WHERE user_id = $1 AND course_id = $2',
      [user.id, course.id]
    );

    const chaptersResult = await query(
      `SELECT c.*, 
              EXISTS(SELECT 1 FROM user_chapter_completions WHERE user_id = $1 AND chapter_id = c.id) as completed
       FROM chapters c
       WHERE c.course_id = $2
       ORDER BY c.chapter_number ASC`,
      [user.id, course.id]
    );

    return successResponse({
      course,
      progress: progressResult.rows[0] || null,
      chapters: chaptersResult.rows,
      locked: course.is_premium && !(user.isPremium),
    });
  } catch (error) {
    console.error('Get course error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const body = await req.json();
    const { title, description, difficulty, is_premium, total_chapters } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    if (description) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (difficulty) {
      updates.push(`difficulty = $${paramCount}`);
      values.push(difficulty);
      paramCount++;
    }
    if (is_premium !== undefined) {
      updates.push(`is_premium = $${paramCount}`);
      values.push(is_premium);
      paramCount++;
    }
    if (total_chapters !== undefined) {
      updates.push(`total_chapters = $${paramCount}`);
      values.push(total_chapters);
      paramCount++;
    }

    if (updates.length === 0) return errorResponse('No fields to update', 400);

    values.push(courseId);
    const result = await query(
      `UPDATE courses SET ${updates.join(', ')} WHERE id = $${paramCount} OR slug = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return errorResponse('Course not found', 404);
    return successResponse({ course: result.rows[0] });
  } catch (error) {
    console.error('Update course error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;

    const result = await query(
      'DELETE FROM courses WHERE id = $1 OR slug = $1 RETURNING id',
      [courseId]
    );

    if (result.rows.length === 0) return errorResponse('Course not found', 404);
    return successResponse({ message: 'Course deleted' });
  } catch (error) {
    console.error('Delete course error:', error);
    return errorResponse('Internal server error', 500);
  }
}
