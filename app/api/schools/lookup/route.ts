import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { errorResponse, successResponse } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return errorResponse('code query parameter is required', 400);
    }

    // Case-insensitive lookup by registration_code
    const schoolRes = await query(
      `SELECT id, name, registration_code, city, state FROM schools 
       WHERE LOWER(registration_code) = LOWER($1)`,
      [code]
    );

    if (schoolRes.rows.length === 0) {
      return errorResponse('School not found', 404);
    }

    const school = schoolRes.rows[0];

    return successResponse({
      id: school.id,
      name: school.name,
      registration_code: school.registration_code,
      city: school.city,
      state: school.state,
    });
  } catch (error) {
    console.error('Error looking up school:', error);
    return errorResponse('Failed to lookup school', 500);
  }
}
