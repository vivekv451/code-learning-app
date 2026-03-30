import { NextRequest } from 'next/server';
import { query } from 'lib/db';
import { getAuthUser, successResponse, errorResponse } from 'lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const result = await query(
      'SELECT xp, level, streak FROM users WHERE id = $1',
      [user.id]
    );

    if (result.rows.length === 0) return errorResponse('User not found', 404);

    const userData = result.rows[0];

    const chaptersResult = await query(
      'SELECT COUNT(*) as completed FROM user_chapter_completions WHERE user_id = $1',
      [user.id]
    );

    const chaptersCompleted = parseInt(chaptersResult.rows[0].completed) || 0;

    return successResponse({
      xp: userData.xp,
      level: userData.level,
      streak: userData.streak,
      chaptersCompleted,
    });
  } catch (error) {
    console.error('Get XP error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { xp_to_add, reason } = body;

    if (!xp_to_add || typeof xp_to_add !== 'number' || xp_to_add < 0) {
      return errorResponse('Invalid xp_to_add value', 400);
    }

    const currentResult = await query(
      'SELECT xp, level FROM users WHERE id = $1',
      [user.id]
    );

    const currentUser = currentResult.rows[0];
    const newXp = currentUser.xp + xp_to_add;
    const newLevel = Math.floor(newXp / 2000) + 1;
    const leveledUp = newLevel > currentUser.level;

    await query(
      'UPDATE users SET xp = $1, level = $2, updated_at = NOW() WHERE id = $3',
      [newXp, newLevel, user.id]
    );

    return successResponse({
      xp_added: xp_to_add,
      new_xp: newXp,
      new_level: newLevel,
      reason,
      leveled_up: leveledUp,
    });
  } catch (error) {
    console.error('Add XP error:', error);
    return errorResponse('Internal server error', 500);
  }
}
