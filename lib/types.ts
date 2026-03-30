export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  class_level: string;
  school_id: string;
  roll_number: string;
  xp: number;
  streak: number;
  level: number;
  is_premium: boolean;
  premium_expires_at: string | null;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  registration_code: string;
  city: string;
  state: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  icon: string;
  description: string;
  difficulty: string;
  is_premium: boolean;
  total_chapters: number;
  rating: number;
  total_students: number;
}

export interface Chapter {
  id: string;
  course_id: string;
  chapter_number: number;
  title: string;
  content_text: string;
  code_example: string;
  code_language: string;
  tip: string;
  practical_title: string;
  practical_task: string;
  is_free: boolean;
  xp_reward: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  month: string;
  year: number;
  quiz_date: string;
  duration_minutes: number;
  total_questions: number;
  prize_pool: string;
  status: string;
  total_registered: number;
}

export interface JWTPayload {
  id: string;
  email: string;
  isPremium: boolean;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}