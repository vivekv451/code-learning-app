'use client';

import { useState, useEffect } from 'react';

// Types
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_premium: boolean;
  xp: number;
  level: number;
  streak: number;
  school_id?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  icon?: string;
}

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  code_example: string;
  tips: string;
  practical_tasks: string;
  xp_reward: number;
  is_free: boolean;
}

export default function LearnProApp() {
  // State Management
  const [activeScreen, setActiveScreen] = useState('auth');
  const [activeNav, setActiveNav] = useState('nav-home');
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regSchoolData, setRegSchoolData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('login');

  // Load courses on mount
  useEffect(() => {
    if (user && courses.length === 0) {
      loadCourses();
    }
  }, [user]);

  // API Helper
  const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const options: any = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(`/api${endpoint}`, options);
      const data = await res.json();
      
      if (!res.ok) {
        const errorMsg = data.error || data.message || 'API Error';
        throw new Error(errorMsg);
      }
      return data;
    } catch (error: any) {
      showToast(error.message);
      throw error;
    }
  };

  // Login
  const doLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showToast('Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      const data = await apiCall('/auth/login', 'POST', {
        email: loginEmail,
        password: loginPassword,
      });
      
      setUser(data.user);
      setActiveScreen('home');
      setActiveNav('nav-home');
      showToast(`Welcome back, ${data.user.first_name}!`);
      loadCourses();
    } finally {
      setLoading(false);
    }
  };

  // Register
  const doRegister = async () => {
    if (!regFirstName || !regLastName || !regEmail || !regPassword || !regPhone || !regSchool) {
      showToast('Please fill all fields');
      return;
    }
    
    if (regPassword.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await apiCall('/auth/register', 'POST', {
        first_name: regFirstName,
        last_name: regLastName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        registration_code: regSchool,
      });
      
      setUser(data.user);
      setActiveScreen('home');
      setActiveNav('nav-home');
      showToast(`Welcome to LearnPro, ${data.user.first_name}!`);
      loadCourses();
    } finally {
      setLoading(false);
    }
  };

  // Load Courses
  const loadCourses = async () => {
    try {
      const data = await apiCall('/courses');
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Failed to load courses');
    }
  };

  // Load Chapter
  const loadChapters = async (courseId: string) => {
    try {
      const data = await apiCall(`/courses/${courseId}/chapters`);
      setChapters(data.chapters || []);
    } catch (error) {
      console.error('Failed to load chapters');
    }
  };

  // School Lookup
  const lookupSchool = async (code: string) => {
    if (!code) return;
    try {
      const data = await apiCall(`/schools/lookup?code=${code}`);
      setRegSchoolData(data);
    } catch (error) {
      setRegSchoolData(null);
    }
  };

  // Navigation
  const goScreen = (screen: string) => setActiveScreen(screen);
  const goCourse = (course: Course) => {
    setSelectedCourse(course);
    loadChapters(course.id);
    goScreen('screen-course');
  };
  const goChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    goScreen('screen-chapter');
  };
  const logout = async () => {
    try {
      await apiCall('/auth/logout', 'POST');
      setUser(null);
      setActiveScreen('auth');
      showToast('Logged out successfully');
    } catch (error) {
      console.error('Logout failed');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Main Render
  return (
    <div className="bg-gray-100 max-w-md mx-auto min-h-screen overflow-x-hidden font-sans">
      {/* Toast */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-navy text-white text-sm font-bold px-5 py-3 rounded-xl shadow-xl z-50 transition-all duration-300 whitespace-nowrap ${toast ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {toast}
      </div>

      {/* AUTH SCREEN */}
      {activeScreen === 'auth' && (
        <div className="bg-navy min-h-screen flex flex-col relative overflow-hidden">
          <div className="absolute w-80 h-80 rounded-full -top-28 -right-28" style={{background: 'radial-gradient(circle,rgba(37,99,235,.2),transparent 70%)'}}></div>
          <div className="p-7 pt-14 relative z-10">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">LP</div>
              <span className="text-white font-black text-2xl">Learn<span className="text-blue-400">Pro</span></span>
            </div>
            <h1 className="text-white font-black text-3xl leading-tight mb-3">Your coding<br/>journey starts here</h1>
            <p className="text-white/50 text-sm leading-relaxed">Learn Java, HTML, CSS, JS & more. Compete in monthly quizzes. Win rewards.</p>
          </div>
          <div className="flex-1 bg-gray-100 rounded-t-3xl p-6 pb-16 relative z-10">
            <div className="flex bg-gray-200 rounded-xl p-1 mb-6">
              <button onClick={() => setActiveTab('login')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${activeTab === 'login' ? 'bg-white text-navy shadow' : 'text-gray-400'}`}>Student Login</button>
              <button onClick={() => setActiveTab('register')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold ${activeTab === 'register' ? 'bg-white text-navy shadow' : 'text-gray-400'}`}>New Registration</button>
            </div>

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <div>
                <div className="mb-4">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Email / Phone</label>
                  <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition" type="text" placeholder="you@school.edu" />
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                  <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition" type="password" placeholder="Enter your password" />
                </div>
                <button onClick={doLogin} disabled={loading} className="w-full py-3.5 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition text-sm disabled:opacity-50">{loading ? 'Logging in...' : 'Login to LearnPro →'}</button>
              </div>
            )}

            {/* REGISTER FORM */}
            {activeTab === 'register' && (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">First Name</label>
                    <input value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" type="text" placeholder="First" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Last Name</label>
                    <input value={regLastName} onChange={(e) => setRegLastName(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" type="text" placeholder="Last" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                  <input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" type="tel" placeholder="+91 98765 43210" />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 mt-4">School / Institution</p>
                <div className="mb-3">
                  <input value={regSchool} onChange={(e) => { setRegSchool(e.target.value); lookupSchool(e.target.value); }} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" type="text" placeholder="School Code (DPS-DEL-0042)" />
                  {regSchoolData && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-2 rounded text-sm text-blue-800">
                      ✓ {regSchoolData.name}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                  <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" type="email" placeholder="student@email.com" />
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                  <input value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" type="password" placeholder="Min. 8 characters" />
                </div>
                <button onClick={doRegister} disabled={loading} className="w-full py-3.5 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition text-sm disabled:opacity-50">{loading ? 'Creating account...' : 'Create My Account →'}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HOME SCREEN */}
      {activeScreen === 'home' && user && (
        <div className="pb-20">
          <div className="bg-navy px-5 pt-5 pb-7 relative overflow-hidden">
            <div className="absolute w-56 h-56 rounded-full -top-20 -right-20" style={{background: 'rgba(37,99,235,.12)'}}></div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-white/50 text-xs font-bold">Welcome back</p>
                <h2 className="text-white font-black text-2xl">{user.first_name} {user.last_name}</h2>
              </div>
              <div onClick={() => goScreen('screen-profile')} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-xl cursor-pointer border-2 border-white/20 shadow-lg">{user.first_name[0]}</div>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/60 text-xs font-bold">Level {user.level} - {user.xp.toLocaleString()} XP</span>
                <span className="text-blue-300 text-xs font-bold">58%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400" style={{width: '58%'}}></div>
              </div>
              <div className="flex gap-5 mt-3">
                <div className="text-center"><div className="text-white font-black text-lg">🔥{user.streak}</div><div className="text-white/40 text-xs">Streak</div></div>
                <div className="text-center"><div className="text-white font-black text-lg">{courses.length}</div><div className="text-white/40 text-xs">Courses</div></div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3"><h3 className="font-black text-navy text-base">Continue Learning</h3><span className="text-blue-600 text-xs font-bold cursor-pointer">See all</span></div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 mb-5 scroll-hide">
              {courses.slice(0, 3).map(course => (
                <div key={course.id} onClick={() => goCourse(course)} className="min-w-[158px] bg-white rounded-2xl border-2 border-gray-100 cursor-pointer overflow-hidden flex-shrink-0 shadow-sm hover:shadow-md hover:border-blue-300 transition">
                  <div className="h-20 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl">{course.icon || '📚'}</div>
                  <div className="p-3"><h4 className="font-bold text-sm text-navy">{course.title}</h4></div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mb-3"><h3 className="font-black text-navy text-base">All Courses</h3></div>
            <div className="grid grid-cols-2 gap-3">
              {courses.map(course => (
                <div key={course.id} onClick={() => goCourse(course)} className="bg-white rounded-2xl border-2 border-gray-100 cursor-pointer overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition">
                  <div className="h-16 bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-2xl">{course.icon || '💻'}</div>
                  <div className="p-2"><h4 className="font-bold text-xs text-navy mb-1">{course.title}</h4><p className="text-xs text-gray-400">{course.difficulty}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COURSE DETAIL SCREEN */}
      {activeScreen === 'screen-course' && selectedCourse && (
        <div className="pb-20">
          <div className="bg-navy px-5 py-5">
            <button onClick={() => goScreen('home')} className="text-blue-300 text-sm font-bold mb-4 flex items-center gap-1">← Back</button>
            <div className="text-5xl mb-3">{selectedCourse.icon || '📚'}</div>
            <h2 className="text-white font-black text-2xl mb-2">{selectedCourse.title}</h2>
            <p className="text-white/50 text-xs leading-relaxed mb-4">{selectedCourse.description}</p>
          </div>
          <div className="p-4">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Chapters</p>
            <div className="space-y-2">
              {chapters.map(chapter => (
                <div key={chapter.id} onClick={() => goChapter(chapter)} className="flex items-center gap-3 p-3 bg-white border-2 border-gray-100 rounded-xl cursor-pointer hover:border-blue-300 transition">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg font-bold text-sm">{chapter.chapter_number}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-navy">{chapter.title}</h4>
                    <p className="text-xs text-gray-400 font-semibold">+{chapter.xp_reward} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER READER SCREEN */}
      {activeScreen === 'screen-chapter' && selectedChapter && (
        <div className="bg-gray-50 pb-20">
          <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
            <button onClick={() => goScreen('screen-course')} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold">←</button>
            <span className="font-black text-navy text-sm flex-1 truncate">{selectedChapter.title}</span>
            <span className="text-xs font-black bg-green-100 text-green-700 px-2 py-1 rounded-lg">{selectedChapter.xp_reward}XP</span>
          </div>
          <div className="p-4">
            <h2 className="font-black text-navy text-xl mb-3">{selectedChapter.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{selectedChapter.content}</p>
            {selectedChapter.code_example && (
              <div className="bg-navy rounded-xl overflow-hidden mb-4 p-4 shadow-md">
                <pre className="text-xs text-blue-300 overflow-x-auto font-mono">{selectedChapter.code_example}</pre>
              </div>
            )}
            {selectedChapter.tips && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-3 text-sm text-blue-800 leading-relaxed mb-4">
                💡 {selectedChapter.tips}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => goScreen('screen-course')} className="flex-1 py-3 border-2 border-gray-200 bg-white rounded-xl text-sm font-bold hover:border-blue-400 transition">← Chapters</button>
              <button className="flex-[2] py-3 bg-blue-600 text-white font-black text-sm rounded-xl shadow-md hover:bg-blue-700 transition">Complete Chapter →</button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE SCREEN */}
      {activeScreen === 'screen-profile' && user && (
        <div className="pb-20">
          <div className="text-center px-5 py-7 bg-navy">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4">{user.first_name[0]}{user.last_name[0]}</div>
            <h2 className="text-white font-black text-2xl">{user.first_name} {user.last_name}</h2>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mt-3 text-xs font-bold text-white/75">🏫 Your School</div>
          </div>
          <div className="grid grid-cols-4 gap-px bg-gray-200 mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-white py-4 text-center"><div className="font-black text-xl text-navy">🔥{user.streak}</div><div className="text-xs text-gray-400 font-bold mt-1">Streak</div></div>
            <div className="bg-white py-4 text-center"><div className="font-black text-xl text-navy">{(user.xp/1000).toFixed(1)}K</div><div className="text-xs text-gray-400 font-bold mt-1">XP</div></div>
            <div className="bg-white py-4 text-center"><div className="font-black text-xl text-navy">•</div><div className="text-xs text-gray-400 font-bold mt-1">Courses</div></div>
            <div className="bg-white py-4 text-center"><div className="font-black text-xl text-navy">•</div><div className="text-xs text-gray-400 font-bold mt-1">Wins</div></div>
          </div>
          <div className="px-4 mt-4 space-y-2">
            {!user.is_premium && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-800 cursor-pointer hover:shadow-lg transition">
                <div className="flex items-center gap-3"><span className="text-3xl">👑</span><div className="flex-1"><div className="text-white font-black">Upgrade to Premium</div><div className="text-white/60 text-xs">Unlock all courses, certificates & more</div></div></div>
              </div>
            )}
            <div className="flex items-center gap-3 bg-white border-2 border-gray-100 rounded-xl p-3.5 cursor-pointer hover:border-blue-300 transition">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-lg">📚</div>
              <div className="flex-1"><div className="font-bold text-sm text-navy">My Courses</div><div className="text-xs text-gray-400 font-semibold">{courses.length} enrolled</div></div>
            </div>
            <div className="flex items-center gap-3 bg-white border-2 border-gray-100 rounded-xl p-3.5 cursor-pointer hover:border-blue-300 transition"><div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-lg">🚪</div><div className="flex-1"><div className="font-bold text-sm text-navy">Logout</div><div className="text-xs text-gray-400 font-semibold">See you again!</div></div></div>
            <button onClick={logout} className="w-full mt-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition">Sign Out</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      {user && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50 shadow-xl">
          <div className="flex py-1.5">
            <div onClick={() => { goScreen('home'); setActiveNav('nav-home'); }} className={`ni flex-1 flex flex-col items-center gap-0.5 cursor-pointer py-1.5`}>
              <div className={`ni-iw w-9 h-9 rounded-xl flex items-center justify-center text-xl ${activeNav === 'nav-home' ? 'bg-blue-100' : ''}`}>🏠</div>
              <span className={`text-xs font-black ${activeNav === 'nav-home' ? 'text-blue-600' : 'text-gray-400'}`}>Home</span>
            </div>
            <div onClick={() => { goScreen('home'); setActiveNav('nav-courses'); }} className={`ni flex-1 flex flex-col items-center gap-0.5 cursor-pointer py-1.5`}>
              <div className={`ni-iw w-9 h-9 rounded-xl flex items-center justify-center text-xl ${activeNav === 'nav-courses' ? 'bg-blue-100' : ''}`}>📚</div>
              <span className={`text-xs font-black ${activeNav === 'nav-courses' ? 'text-blue-600' : 'text-gray-400'}`}>Courses</span>
            </div>
            <div onClick={() => { goScreen('home'); setActiveNav('nav-quiz'); }} className={`ni flex-1 flex flex-col items-center gap-0.5 cursor-pointer py-1.5 relative`}>
              <div className={`ni-iw w-9 h-9 rounded-xl flex items-center justify-center text-xl ${activeNav === 'nav-quiz' ? 'bg-blue-100' : ''}`}>🏆</div>
              <span className={`text-xs font-black ${activeNav === 'nav-quiz' ? 'text-blue-600' : 'text-gray-400'}`}>Quiz</span>
            </div>
            <div onClick={() => { goScreen('screen-profile'); setActiveNav('nav-profile'); }} className={`ni flex-1 flex flex-col items-center gap-0.5 cursor-pointer py-1.5`}>
              <div className={`ni-iw w-9 h-9 rounded-xl flex items-center justify-center text-xl ${activeNav === 'nav-profile' ? 'bg-blue-100' : ''}`}>👤</div>
              <span className={`text-xs font-black ${activeNav === 'nav-profile' ? 'text-blue-600' : 'text-gray-400'}`}>Profile</span>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
