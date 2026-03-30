export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">🚀 LearnPro Backend API</h1>
          <p className="text-gray-600 text-lg mb-8">Student Learning Platform - Next.js 15 with PostgreSQL</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 API Endpoints</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-semibold text-indigo-600">🔐 Authentication</h3>
                  <ul className="text-gray-600 space-y-1 ml-4 text-xs">
                    <li>POST /api/auth/register - Create account</li>
                    <li>POST /api/auth/login - Login user</li>
                    <li>POST /api/auth/logout - Logout</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-600">👤 User Profile</h3>
                  <ul className="text-gray-600 space-y-1 ml-4 text-xs">
                    <li>GET /api/user/profile - Get profile</li>
                    <li>PUT /api/user/profile - Update profile</li>
                    <li>GET /api/user/xp - XP stats</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-600">📖 Courses</h3>
                  <ul className="text-gray-600 space-y-1 ml-4 text-xs">
                    <li>GET /api/courses - List courses</li>
                    <li>GET /api/courses/[id] - Course details</li>
                    <li>GET /api/courses/[id]/chapters - Chapters</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-600">🎯 Quiz</h3>
                  <ul className="text-gray-600 space-y-1 ml-4 text-xs">
                    <li>GET /api/quiz - All quizzes</li>
                    <li>POST /api/quiz/[id]/register - Register</li>
                    <li>GET /api/quiz/leaderboard - Leaderboard</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-600">🏫 Other</h3>
                  <ul className="text-gray-600 space-y-1 ml-4 text-xs">
                    <li>GET /api/schools/lookup - Find school</li>
                    <li>GET/POST /api/premium - Premium</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-blue-900 mb-2">⚙️ Setup Steps</h3>
                <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                  <li>Create PostgreSQL database</li>
                  <li>Run schema.sql file</li>
                  <li>Configure .env.local:</li>
                  <li className="text-xs ml-4">DATABASE_URL=postgres://...</li>
                  <li className="text-xs ml-4">JWT_SECRET=your-secret</li>
                  <li>npm install</li>
                  <li>npm run dev</li>
                </ol>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-bold text-green-900 mb-2">🔒 Authentication</h3>
                <p className="text-sm text-green-800 mb-2">Send JWT token in header:</p>
                <code className="text-xs bg-white p-2 rounded block text-green-700 font-mono">
                  Authorization: Bearer token_here
                </code>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-2">🛠️ Tech Stack</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ Next.js 15 (App Router)</li>
                  <li>✓ TypeScript</li>
                  <li>✓ PostgreSQL (pg)</li>
                  <li>✓ JWT (jsonwebtoken)</li>
                  <li>✓ Password Hashing (bcryptjs)</li>
                  <li>✓ Ready for Render deployment</li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">🎮 Features</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>✓ Gamified Learning</li>
                <li>✓ XP & Levels System</li>
                <li>✓ Streak Tracking</li>
                <li>✓ Free & Premium Content</li>
              </ul>
            </div>
            <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
              <h4 className="font-semibold text-pink-900 mb-2">📊 Advanced</h4>
              <ul className="text-sm text-pink-800 space-y-1">
                <li>✓ Quiz Management</li>
                <li>✓ Leaderboard</li>
                <li>✓ Certificates</li>
                <li>✓ School Integration</li>
              </ul>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-lg">
              <h4 className="font-semibold text-cyan-900 mb-2">🚀 Ready</h4>
              <ul className="text-sm text-cyan-800 space-y-1">
                <li>✓ Fully Typed (TS)</li>
                <li>✓ Error Handling</li>
                <li>✓ Database Indexes</li>
                <li>✓ Seed Data</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-lg text-center">
            <p className="text-lg font-semibold text-gray-800">🎓 LearnPro Platform</p>
            <p className="text-sm text-gray-700 mt-1">Empowering students through gamified, personalized learning experiences</p>
            <p className="text-xs text-gray-600 mt-2">PostgreSQL • JWT Authentication • Production Ready • Render Compatible</p>
          </div>
        </div>
      </div>
    </main>
  );
}
