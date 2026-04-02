import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../../lib/db';
import { getAuthUser, successResponse, errorResponse } from '../../../../../../lib/auth';

export async function GET(req: NextRequest, context: any) {
  try {
    const userId = req.headers.get('x-user-id');
    const isPremium = req.headers.get('x-user-premium') === 'true';

    const { courseId, chapterId } = context.params;

    // Resolve course by id or slug
    const courseRes = await query(
      `SELECT id, title, is_premium FROM courses 
       WHERE id = $1 OR slug = $1`,
      [courseId]
    );

    if (courseRes.rows.length === 0) {
      return errorResponse('Course not found', 404);
    }

    const course = courseRes.rows[0];

    // Fetch chapter by id or chapter_number
    const chapterRes = await query(
      `SELECT * FROM chapters 
       WHERE course_id = $1 AND (id = $2 OR chapter_number = $2)`,
      [course.id, chapterId]
    );

    if (chapterRes.rows.length === 0) {
      return errorResponse('Chapter not found', 404);
    }

    const chapter = chapterRes.rows[0];

    // Check premium access
    if (!chapter.is_free && !isPremium) {
      return errorResponse('Premium access required', 403);
    }

    // Check if chapter completed
    const completionRes = await query(
      `SELECT completed_at FROM user_chapter_completions 
       WHERE user_id = $1 AND chapter_id = $2`,
      [userId, chapter.id]
    );

    const isCompleted = completionRes.rows.length > 0;

    // Get previous chapter
    const prevRes = await query(
      `SELECT id, chapter_number, title FROM chapters 
       WHERE course_id = $1 AND chapter_number < $2 
       ORDER BY chapter_number DESC LIMIT 1`,
      [course.id, chapter.chapter_number]
    );

    // Get next chapter
    const nextRes = await query(
      `SELECT id, chapter_number, title FROM chapters 
       WHERE course_id = $1 AND chapter_number > $2 
       ORDER BY chapter_number ASC LIMIT 1`,
      [course.id, chapter.chapter_number]
    );

    return successResponse({
      id: chapter.id,
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      content: chapter.content,
      code_example: chapter.code_example,
      tips: chapter.tips,
      practical_tasks: chapter.practical_tasks,
      xp_reward: chapter.xp_reward,
      is_free: chapter.is_free,
      completed: isCompleted,
      navigation: {
        previous: prevRes.rows[0] || null,
        next: nextRes.rows[0] || null,
      },
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return errorResponse('Failed to fetch chapter', 500);
  }
}

export async function POST(req: NextRequest, context: any) {
  try {
    const userId = req.headers.get('x-user-id');
    const { courseId, chapterId } = context.params;

    // Resolve course
    const courseRes = await query(
      `SELECT id FROM courses WHERE id = $1 OR slug = $1`,
      [courseId]
    );

    if (courseRes.rows.length === 0) {
      return errorResponse('Course not found', 404);
    }

    const course = courseRes.rows[0];

    // Resolve chapter
    const chapterRes = await query(
      `SELECT xp_reward, id FROM chapters 
       WHERE course_id = $1 AND (id = $2 OR chapter_number = $2)`,
      [course.id, chapterId]
    );

    if (chapterRes.rows.length === 0) {
      return errorResponse('Chapter not found', 404);
    }

    const chapter = chapterRes.rows[0];

    // Check if already completed
    const existingRes = await query(
      `SELECT completed_at FROM user_chapter_completions 
       WHERE user_id = $1 AND chapter_id = $2`,
      [userId, chapter.id]
    );

    if (existingRes.rows.length > 0) {
      return successResponse({
        already_completed: true,
        message: 'Chapter already completed',
      });
    }

    // Insert completion record
    await query(
      `INSERT INTO user_chapter_completions (user_id, chapter_id, completed_at) 
       VALUES ($1, $2, NOW())`,
      [userId, chapter.id]
    );

    // Get total chapters in course
    const totalRes = await query(
      `SELECT COUNT(*) as count FROM chapters WHERE course_id = $1`,
      [course.id]
    );
    const totalChapters = totalRes.rows[0].count;

    // Get completed chapters
    const completedRes = await query(
      `SELECT COUNT(*) as count FROM user_chapter_completions ucc
       JOIN chapters c ON ucc.chapter_id = c.id
       WHERE ucc.user_id = $1 AND c.course_id = $2`,
      [userId, course.id]
    );
    const completedChapters = completedRes.rows[0].count;

    // Calculate new progress percentage
    const newProgressPercentage = Math.round((completedChapters / totalChapters) * 100);

    // Update user_course_progress
    await query(
      `UPDATE user_course_progress 
       SET progress_percentage = $1, updated_at = NOW()
       WHERE user_id = $2 AND course_id = $3`,
      [newProgressPercentage, userId, course.id]
    );

    // Add XP to user
    const userRes = await query(
      `SELECT xp FROM users WHERE id = $1`,
      [userId]
    );
    const currentXp = userRes.rows[0].xp;
    const newXp = currentXp + chapter.xp_reward;
    const newLevel = Math.floor(newXp / 2000) + 1;

    // Get old level
    const oldLevel = Math.floor(currentXp / 2000) + 1;
    const leveledUp = newLevel > oldLevel;

    // Update user XP
    await query(
      `UPDATE users SET xp = $1 WHERE id = $2`,
      [newXp, userId]
    );

    // Check if progress is 100%
    let certificate = null;
    if (newProgressPercentage === 100) {
      // Insert certificate
      const certRes = await query(
        `INSERT INTO certificates (user_id, course_id, issued_date) 
         VALUES ($1, $2, NOW()) 
         RETURNING id, issued_date`,
        [userId, course.id]
      );
      certificate = certRes.rows[0];
    }

    return successResponse({
      xp_earned: chapter.xp_reward,
      new_xp: newXp,
      new_level: newLevel,
      leveled_up: leveledUp,
      course_progress_percentage: newProgressPercentage,
      certificate: certificate,
    });
  } catch (error) {
    console.error('Error completing chapter:', error);
    return errorResponse('Failed to complete chapter', 500);
  }
}
