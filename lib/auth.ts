import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { JWTPayload } from "./types";

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

export const getAuthUser = (req: NextRequest): JWTPayload | null => {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("token")?.value;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;
  if (!token) return null;
  return verifyToken(token);
};

export const successResponse = (data: any, status = 200) => {
  return Response.json({ success: true, data }, { status });
};

export const errorResponse = (message: string, status = 400) => {
  return Response.json({ success: false, error: message }, { status });
};