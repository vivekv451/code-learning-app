import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, successResponse, errorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get('difficulty');
    const isPremium = searchParams.get('is_premium');

    let whereClause = '1=1';
    const params: any[] = [user.id];

    if (difficulty) {
      params.push(difficulty);
      whereClause += ` AND c.difficulty = $${params.length}`;
    }
    if (isPremium === 'true') {
      params.push(true);
      whereClause += ` AND c.is_premium = $${params.length}`;
    } else if (isPremium === 'false') {
      params.push(false);
      whereClause += ` AND c.is_premium = $${params.length}`;
    }

    const result = await query(
      `SELECT c.*, COALESCE(p.percentage, 0) as progress_percentage, 
              COALESCE(p.chapters_completed, 0) as chapters_completed
       FROM courses c
       LEFT JOIN user_course_progress p ON c.id = p.course_id AND p.user_id = $1
       WHERE ${whereClause}
       ORDER BY c.created_at DESC`,
      params
    );

    return successResponse({ courses: result.rows });
  } catch (error) {
    console.error('Courses error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { slug, title, icon, description, difficulty, is_premium, total_chapters } = body;

    if (!slug || !title) return errorResponse('Slug and title are required', 400);

    const result = await query(
      `INSERT INTO courses (slug, title, icon, description, difficulty, is_premium, total_chapters)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [slug, title, icon, description, difficulty || 'beginner', is_premium || false, total_chapters || 0]
    );

    return successResponse({ course: result.rows[0] }, 201);
  } catch (error) {
    console.error('Create course error:', error);
    return errorResponse('Internal server error', 500);
  }
}
