
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  comparePassword,
  generateToken,
  errorResponse,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    // Find user by email
    const userResult = await query(
      "SELECT id, first_name, last_name, email, password_hash, xp, level, streak, is_premium, roll_number FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (userResult.rows.length === 0) {
      return errorResponse("Invalid email or password", 401);
    }

    const user = userResult.rows[0];

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      isPremium: user.is_premium,
    });

    // Update last login
    await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      is_premium: user.is_premium,
      roll_number: user.roll_number,
    };

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        user: userData,
        token,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
