# LearnPro - Deployment Guide

## Quick Start - Render Deployment (Recommended for Production)

### Step 1: Prepare Your PostgreSQL Database

1. Go to [render.com](https://render.com)
2. Create a free PostgreSQL database
3. Copy the **Internal Database URL** (for same-service connections)
4. Create the tables:
   ```bash
   psql <your_database_url> < schema.sql
   ```

### Step 2: Deploy to Render (WebService)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Fill in:
   - **Name**: `learnpro-app`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Paid
6. Add Environment Variables:
   - `DATABASE_URL`: (from your PostgreSQL service)
   - `JWT_SECRET`: (generate a random string, e.g., `openssl rand -hex 32`)
   - `NODE_ENV`: `production`
7. Deploy!

### Alternative: Use render.yaml

Simply push to GitHub and Render will automatically use the `render.yaml` config to deploy both the web service and PostgreSQL database together.

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env.local (copy from .env.example)
cp .env.example .env.local

# Update DATABASE_URL and JWT_SECRET in .env.local
# Example:
# DATABASE_URL=postgresql://user:password@localhost:5432/learnpro
# JWT_SECRET=dev-secret-key-change-in-production

# Create database and run schema
psql -U postgres
CREATE DATABASE learnpro;
\c learnpro
\i schema.sql

# Start development server
npm run dev

# Visit http://localhost:3000
```

### API Endpoints

**Auth:**
- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Login (returns JWT + sets cookie)
- POST `/api/auth/logout` - Logout

**User:**
- GET `/api/user/profile` - Get user profile & stats
- PUT `/api/user/profile` - Update profile fields
- GET `/api/user/xp` - Get XP/level/streak
- POST `/api/user/xp` - Add XP

**Courses:**
- GET `/api/courses` - List courses (filters: difficulty, is_premium)
- POST `/api/courses` - Create course
- GET `/api/courses/[id]` - Get course details
- PUT `/api/courses/[id]` - Update course
- DELETE `/api/courses/[id]` - Delete course

**Chapters:**
- GET `/api/courses/[courseId]/chapters` - List chapters
- POST `/api/courses/[courseId]/chapters` - Create chapter
- GET `/api/courses/[courseId]/chapters/[chapterId]` - Get chapter details
- POST `/api/courses/[courseId]/chapters/[chapterId]` - Mark complete (awards XP)

**Quiz:**
- GET `/api/quiz` - List quizzes (filters: month, year)
- POST `/api/quiz` - Create quiz
- GET `/api/quiz/[id]` - Get quiz details
- POST `/api/quiz/[id]/register` - Register for quiz
- GET `/api/quiz/leaderboard` - Get leaderboard (type: school/national)

**Other:**
- GET `/api/schools/lookup?code=XX-YY-NNNN` - Find school (public)
- GET `/api/premium` - Get premium status & plans
- POST `/api/premium` - Purchase premium

---

## Database Schema

11 Tables:
1. **schools** - Institution data with registration codes
2. **users** - Student accounts with XP, level, streak
3. **courses** - Programming courses (free/premium)
4. **chapters** - Course chapters with content & code
5. **user_course_progress** - Enrollment & progress tracking
6. **user_chapter_completions** - Chapter completion records
7. **quizzes** - Monthly quiz contests
8. **quiz_registrations** - User quiz participation
9. **leaderboard** - Quiz scores & ranks
10. **premium_subscriptions** - Paid plans (30-day, 365-day)
11. **certificates** - Generated certificates

---

## Features

✅ **Authentication**
- JWT-based auth with 7-day expiration
- HTTP-only secure cookies
- Email/password + school registration

✅ **Gamification**
- XP system (level = floor(xp/2000) + 1)
- Daily streaks with gap logic
- Level-up notifications

✅ **Courses & Learning**
- Free & premium courses
- Chapter-based structure
- Code examples & practical tasks
- Auto-certificate generation at 100%

✅ **Quiz System**
- Monthly contests (April 2026, May 2026, etc.)
- School-wide & national leaderboards
- Quiz registration & scoring

✅ **Premium Subscription**
- 30-day plan (₹49 INR)
- 365-day plan (₹399 INR)
- Unlock exclusive content

✅ **School Integration**
- Multi-school support
- School-based leaderboards
- Registration code authentication

---

## Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL format:
postgresql://username:password@host:port/database

# Test connection:
psql postgresql://username:password@host:port/database -c "SELECT 1;"
```

### JWT Error on Production
Ensure `JWT_SECRET` is set as an environment variable (20+ chars recommended).

### Build Fails on Render
- Check `npm run build` works locally
- Verify all TypeScript errors: `npx tsc --noEmit`
- Check `package.json` has all dependencies

### CORS Issues
The API and frontend are on the same Next.js app, so CORS is not an issue. All API calls use `/api/*` relative paths.

---

## Production Checklist

- [ ] Database created on Render PostgreSQL
- [ ] Schema imported (`schema.sql`)
- [ ] JWT_SECRET set (strong, random)
- [ ] Database backups enabled
- [ ] Custom domain configured (optional)
- [ ] Environment variables verified
- [ ] App deployed & tested
- [ ] All API endpoints working
- [ ] Authentication flow tested

---

## Support & Documentation

- **API Docs**: Visit `http://localhost:3000` for homepage with API overview
- **Schema**: See `schema.sql` for database structure
- **Code**: `/app/api` contains all endpoint implementations
- **Frontend**: `/app/app/page.tsx` is the main React component

