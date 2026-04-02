import { NextRequest } from 'next/server';
import { query } from '../../../../lib/db';
import { getAuthUser, successResponse, errorResponse } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.date_of_birth, 
              u.class_level, u.xp, u.level, u.streak, u.is_premium, u.roll_number, 
              u.created_at, s.name as school_name, s.registration_code as school_code
       FROM users u
       LEFT JOIN schools s ON u.school_id = s.id
       WHERE u.id = $1`,
      [user.id]
    );

    if (result.rows.length === 0) return errorResponse('User not found', 404);

    const userData = result.rows[0];

    const statsResult = await query(
      `SELECT 
        COUNT(DISTINCT course_id) as enrolled_courses,
        (SELECT COUNT(*) FROM quiz_registrations WHERE user_id = $1) as quizzes_attempted,
        (SELECT COUNT(*) FROM quiz_registrations WHERE user_id = $1 AND score IS NOT NULL) as quizzes_completed,
        (SELECT COUNT(*) FROM certificates WHERE user_id = $1) as certificates
       FROM user_course_progress WHERE user_id = $1`,
      [user.id]
    );

    const stats = statsResult.rows[0] || {};

    const coursesResult = await query(
      `SELECT c.id, c.slug, c.title, c.icon, c.is_premium, 
              p.percentage as progress_percentage, p.chapters_completed
       FROM user_course_progress p
       JOIN courses c ON p.course_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.updated_at DESC`,
      [user.id]
    );

    return successResponse({
      user: userData,
      stats,
      enrolledCourses: coursesResult.rows,
    });
  } catch (error) {
    console.error('Profile error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { first_name, last_name, phone, date_of_birth, class_level } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (first_name) {
      updates.push(`first_name = $${paramCount}`);
      values.push(first_name.trim());
      paramCount++;
    }
    if (last_name) {
      updates.push(`last_name = $${paramCount}`);
      values.push(last_name.trim());
      paramCount++;
    }
    if (phone) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone.trim());
      paramCount++;
    }
    if (date_of_birth) {
      updates.push(`date_of_birth = $${paramCount}`);
      values.push(date_of_birth);
      paramCount++;
    }
    if (class_level) {
      updates.push(`class_level = $${paramCount}`);
      values.push(class_level);
      paramCount++;
    }

    if (updates.length === 0) return errorResponse('No fields to update', 400);

    values.push(user.id);
    const updateQuery = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(updateQuery, values);
    return successResponse({ message: 'Profile updated', user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Internal server error', 500);
  }
}
