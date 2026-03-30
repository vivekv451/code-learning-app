# 🚀 LearnPro - Student Learning Platform

A **gamified programming learning platform** built with Next.js 15, TypeScript, PostgreSQL, and Tailwind CSS. Students learn coding through interactive chapters, compete in monthly quizzes, earn XP, and unlock certificates.

**Live Demo**: https://learnpro.onrender.com *(deploy first)*

---

## ✨ Features

### 🎓 Learning System
- **Structured Courses**: Java, HTML, CSS, JavaScript & more
- **Interactive Chapters**: Content, code examples, tips, practical tasks
- **Auto-Certificates**: Generated when course completion reaches 100%
- **Premium Courses**: Free & paid tier access control

### 🎮 Gamification
- **XP System**: Earn XP per chapter (Level = floor(XP/2000) + 1)
- **Streaks**: Daily login streaks with gap tolerance
- **Leaderboards**: School-wide & national rankings
- **Achievements**: Unlock badges and certificates

### 🏫 School Integration
- **Multi-School Support**: DPS, KV, SXS, DAV, etc.
- **Registration Codes**: School-based enrollment
- **School Leaderboards**: Compete within your school
- **Batch Tracking**: Class level & roll numbers

### 💳 Premium Subscriptions
- **30-Day Plan**: ₹49 INR
- **365-Day Plan**: ₹399 INR
- **Unlock**: All courses, advanced quizzes, priority support

### 🏆 Quiz System
- **Monthly Contests**: April 2026, May 2026, etc.
- **Quiz Registration**: Join and compete
- **Scoring**: Track your performance
- **Dual Leaderboards**: School vs. National rankings

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 19, Next.js 15 (App Router) |
| **Styling** | Tailwind CSS 3 + custom gradients |
| **Backend** | Node.js with Next.js API Routes |
| **Database** | PostgreSQL 12+ |
| **Auth** | JWT (7-day expiration) + HTTP-only cookies |
| **Language** | TypeScript |
| **Deployment** | Render.com (single WebService) |

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your database credentials & JWT secret

# 3. Create PostgreSQL database
createdb learnpro
psql learnpro < schema.sql

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

### Deploy to Render (5 minutes)

1. **Push code to GitHub**
2. **Go to Render Dashboard** → New Web Service
3. **Connect repository** + select branch
4. **Set build command**: `npm install && npm run build`
5. **Set start command**: `npm start`
6. **Add env variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Random string (e.g., `openssl rand -hex 32`)
   - `NODE_ENV`: `production`
7. **Deploy!** ✨

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.**

---

## 📁 Project Structure

```
learnpro/
├── app/
│   ├── api/                          # API Routes
│   │   ├── auth/[login, register, logout]
│   │   ├── courses/[courseId]/chapters/[chapterId]
│   │   ├── user/[profile, xp]
│   │   ├── quiz/[quizId]/[register, leaderboard]
│   │   ├── schools/lookup
│   │   └── premium/
│   ├── app/
│   │   └── page.tsx                 # Main app (7 screens)
│   ├── page.tsx                     # Homepage with API docs
│   └── layout.tsx                   # Root layout
├── lib/
│   ├── db.ts                        # PostgreSQL pool
│   ├── auth.ts                      # Auth utilities (JWT, bcrypt)
│   └── types.ts                     # TypeScript interfaces
├── middleware.ts                     # JWT verification
├── schema.sql                        # Database schema + seed data
├── render.yaml                       # Render deployment config
├── tsconfig.json                     # TypeScript config
└── package.json
```

---

## 📡 API Endpoints

### Auth (Public)
```
POST   /api/auth/register     # Create account
POST   /api/auth/login        # Login (JWT + cookie)
POST   /api/auth/logout       # Logout
```

### User (Protected)
```
GET    /api/user/profile      # User data + stats
PUT    /api/user/profile      # Update profile
GET    /api/user/xp           # XP, level, streak
POST   /api/user/xp           # Add XP
```

### Courses (Protected)
```
GET    /api/courses                              # List courses
POST   /api/courses                              # Create course
GET    /api/courses/[id]                         # Course details
PUT    /api/courses/[id]                         # Update course
DELETE /api/courses/[id]                         # Delete course
GET    /api/courses/[courseId]/chapters          # List chapters
POST   /api/courses/[courseId]/chapters          # Create chapter
GET    /api/courses/[courseId]/chapters/[id]     # Chapter details
POST   /api/courses/[courseId]/chapters/[id]     # Mark complete (awards XP)
```

### Quiz (Protected)
```
GET    /api/quiz                 # List quizzes
POST   /api/quiz                 # Create quiz
GET    /api/quiz/[id]            # Quiz details
POST   /api/quiz/[id]/register    # Register for quiz
GET    /api/quiz/leaderboard      # Leaderboard (school/national)
```

### Other
```
GET    /api/schools/lookup?code=XX-YY-NNNN  # Find school (public)
GET    /api/premium                         # Premium status (protected)
POST   /api/premium                         # Buy premium (protected)
```

---

## 🎯 User Flows

### 1️⃣ Registration
- Student enters: name, phone, email, password, school code
- System validates school exists
- User gets JWT token + HTTP-only cookie
- Auto-enrolled in free courses

### 2️⃣ Learning
- Browse courses by difficulty (Beginner, Intermediate, Advanced)
- Read chapters with code examples
- Complete practical tasks
- Earn XP (added to level)
- At 100% course completion → certificate issued ✅

### 3️⃣ Quizzes
- Monthly contests announced
- Register for quiz
- Take quiz (submit answers)
- See rank on leaderboard (school + national)
- Compare with friends and classmates

### 4️⃣ Premium
- View premium plans
- "Upgrade to Premium" button
- Subscribe (IAP or manual payment)
- Unlock premium courses instantly

---

## 📊 Database Schema

**11 Tables**:
1. `schools` - Institution records (DPS, KV, etc.)
2. `users` - Student accounts (email, XP, level, streak)
3. `courses` - Programming courses
4. `chapters` - Course content
5. `user_course_progress` - Enrollment & progress %
6. `user_chapter_completions` - Completed chapters
7. `quizzes` - Monthly contests
8. `quiz_registrations` - Quiz participation
9. `leaderboard` - Quiz scores & ranks
10. `premium_subscriptions` - Active plans
11. `certificates` - Earned certificates

**See [schema.sql](./schema.sql) for full schema with seed data.**

---

## 🔐 Security

✅ **Passwords**: Hashed with bcryptjs (salt 12)
✅ **JWT**: Signed with HS256, 7-day expiration
✅ **Cookies**: HTTP-only, Secure, SameSite=Strict
✅ **Protected Routes**: Middleware validates JWT
✅ **Public Routes**: Auth & school lookup only

---

## 🧪 Testing

```bash
# Run TypeScript check
npx tsc --noEmit

# Build
npm run build

# Start production mode
npm start
```

---

## 📈 Next Steps

- [ ] Add payment gateway (Razorpay/Stripe)
- [ ] Email notifications (signup, achievement)
- [ ] Mobile app (React Native)
- [ ] Live coding editor (Monaco)
- [ ] Discussion forums
- [ ] Mentor matching

---

## 📞 Support

- **Issues**: GitHub Issues
- **Docs**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Docs**: Visit `/` (homepage)

---

## 📄 License

MIT License - Feel free to use for educational purposes!

---

**Built with ❤️ for students who love to code.**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
