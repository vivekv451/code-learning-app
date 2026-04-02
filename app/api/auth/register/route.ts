import { NextRequest } from "next/server";
import { query } from "../../../../lib/db";
import {
  hashPassword,
  generateToken,
  successResponse,
  errorResponse,
} from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      date_of_birth,
      class_level,
      school_code,
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !phone) {
      return errorResponse("All required fields must be filled", 400);
    }

    if (password.length < 8) {
      return errorResponse("Password must be at least 8 characters", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email address", 400);
    }

    // Check if user already exists
    const existingUser = await query(
      "SELECT id FROM users WHERE email = $1 OR phone = $2",
      [email.toLowerCase(), phone]
    );

    if (existingUser.rows.length > 0) {
      return errorResponse("Email or phone already registered", 409);
    }

    // Lookup school if code provided
    let schoolId = null;
    if (school_code) {
      const school = await query(
        "SELECT id FROM schools WHERE registration_code = $1",
        [school_code.toUpperCase()]
      );
      if (school.rows.length > 0) {
        schoolId = school.rows[0].id;
      }
    }

    const passwordHash = await hashPassword(password);

    // Generate roll number
    const rollNumber = `LP${Date.now().toString().slice(-6)}`;

    const result = await query(
      `INSERT INTO users 
        (first_name, last_name, email, phone, password_hash, date_of_birth, class_level, school_id, roll_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, first_name, last_name, email, phone, xp, streak, level, is_premium, roll_number, created_at`,
      [
        first_name.trim(),
        last_name.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        passwordHash,
        date_of_birth || null,
        class_level || null,
        schoolId,
        rollNumber,
      ]
    );

    const user = result.rows[0];

    const token = generateToken({
      id: user.id,
      email: user.email,
      isPremium: false,
    });

    return successResponse(
      {
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          roll_number: user.roll_number,
          xp: user.xp,
          streak: user.streak,
          level: user.level,
          is_premium: user.is_premium,
        },
      },
      201
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return errorResponse("Internal server error", 500);
  }
}