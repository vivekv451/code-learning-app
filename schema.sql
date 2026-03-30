-- LearnPro Backend Database Schema

-- Schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  registration_code VARCHAR(50) UNIQUE NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  class_level VARCHAR(20),
  school_id UUID REFERENCES schools(id),
  roll_number VARCHAR(50),
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP,
  last_active_date DATE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  difficulty VARCHAR(20) DEFAULT 'beginner',
  is_premium BOOLEAN DEFAULT FALSE,
  total_chapters INTEGER DEFAULT 0,
  rating DECIMAL(2,1),
  total_students INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chapters
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_text TEXT,
  code_example TEXT,
  code_language VARCHAR(30),
  tip TEXT,
  practical_title VARCHAR(255),
  practical_task TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, chapter_number)
);

-- User Course Progress
CREATE TABLE user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  chapters_completed INTEGER DEFAULT 0,
  total_chapters INTEGER DEFAULT 0,
  percentage INTEGER DEFAULT 0,
  last_chapter_id UUID REFERENCES chapters(id),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- User Chapter Completions
CREATE TABLE user_chapter_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, chapter_id)
);

-- Quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100),
  month VARCHAR(20),
  year INTEGER,
  quiz_date DATE,
  duration_minutes INTEGER DEFAULT 60,
  total_questions INTEGER DEFAULT 50,
  prize_pool VARCHAR(100),
  status VARCHAR(20) DEFAULT 'upcoming',
  total_registered INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Registrations
CREATE TABLE quiz_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  score INTEGER,
  rank_school INTEGER,
  rank_national INTEGER,
  prize_won_amount INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  UNIQUE(user_id, quiz_id)
);

-- Leaderboard
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id),
  score INTEGER DEFAULT 0,
  rank_school INTEGER,
  rank_national INTEGER,
  xp_earned INTEGER DEFAULT 0,
  prize_won VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Premium Subscriptions
CREATE TABLE premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(20),
  amount INTEGER,
  currency VARCHAR(5) DEFAULT 'INR',
  payment_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  starts_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL,
  certificate_type VARCHAR(30),
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_url VARCHAR(500)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_chapters_course ON chapters(course_id);
CREATE INDEX idx_progress_user ON user_course_progress(user_id);
CREATE INDEX idx_completions_user ON user_chapter_completions(user_id);
CREATE INDEX idx_quiz_reg_user ON quiz_registrations(user_id);
CREATE INDEX idx_leaderboard_quiz ON leaderboard(quiz_id);

-- Seed Schools
INSERT INTO schools (name, registration_code, city, state, country) VALUES
  ('Delhi Public School', 'DPS-DEL-0042', 'Delhi', 'Delhi', 'India'),
  ('Kendriya Vidyalaya', 'KV-CHD-0011', 'Chandigarh', 'Chandigarh', 'India'),
  ('Sunflower School', 'SXS-MUM-0099', 'Mumbai', 'Maharashtra', 'India'),
  ('DAV College', 'DAV-HYD-0033', 'Hyderabad', 'Telangana', 'India');

-- Seed Courses
INSERT INTO courses (slug, title, icon, description, difficulty, is_premium, total_chapters) VALUES
  ('java', 'Java Programming', '☕', 'Learn Java from basics to advanced', 'intermediate', FALSE, 12),
  ('html-css', 'HTML & CSS', '🎨', 'Master web design with HTML and CSS', 'beginner', FALSE, 10),
  ('javascript', 'JavaScript Essentials', '⚡', 'Complete JavaScript course', 'intermediate', FALSE, 15),
  ('jquery', 'jQuery Masterclass', '✨', 'jQuery for interactive web development', 'intermediate', TRUE, 8),
  ('python', 'Python for Everyone', '🐍', 'Python programming from scratch', 'beginner', FALSE, 20),
  ('react', 'React Advanced', '⚛️', 'Advanced React patterns and hooks', 'advanced', TRUE, 18);
