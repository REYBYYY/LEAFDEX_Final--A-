import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoginForm } from './components/LoginForm.jsx';
import { RegisterForm } from './components/RegisterForm.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { LandingPage } from './components/LandingPage.jsx';
import { PasswordResetModal } from './components/PasswordResetModal.jsx';
import { ThemeSwitcher } from './components/ThemeSwitcher.jsx';
import { AutoLogoutWarning } from './components/AutoLogoutWarning.jsx';

const INACTIVITY_TIMEOUT_SECONDS = 60;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register'
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'dashboard', 'users', 'audit'
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [flashMessage, setFlashMessage] = useState(null);
  const [isTimeoutRedirect, setIsTimeoutRedirect] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ldx_theme');
    return saved === 'forest' || saved === 'dark' ? saved : 'dark';
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('ldx_theme', newTheme);
  };

  // Inactivity tracking state
  const [secondsRemaining, setSecondsRemaining] = useState(INACTIVITY_TIMEOUT_SECONDS);
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Reset inactivity timer on user events
  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  const handleLogout = useCallback(async (isTimeout = false) => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        // Ignore logout network errors
      }
    }
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('ldx_token');
    setView('login');
    if (isTimeout) {
      setIsTimeoutRedirect(true);
      setFlashMessage(null);
    } else {
      setIsTimeoutRedirect(false);
    }
  }, [token]);

  // Inactivity timer interval
  useEffect(() => {
    if (!currentUser) return;

    // Attach user activity event listeners
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, INACTIVITY_TIMEOUT_SECONDS - elapsed);
      setSecondsRemaining(remaining);

      if (remaining === 0) {
        // Trigger automatic session invalidation and redirect to /login?timeout=true
        handleLogout(true);
      }
    }, 1000);

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentUser, handleUserActivity, handleLogout]);

  // Check stored token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('ldx_token');
    if (storedToken) {
      fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setToken(storedToken);
            lastActivityRef.current = Date.now();
            setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
          } else {
            localStorage.removeItem('ldx_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('ldx_token');
        });
    }
  }, []);

  const handleLoginSuccess = (data) => {
    if (data.user && data.token) {
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('ldx_token', data.token);
      lastActivityRef.current = Date.now();
      setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
      setFlashMessage(null);
      setIsTimeoutRedirect(false);
      setActiveTab('scanner'); // Direct to AI Scanner by default
    }
  };

  const handleRegisterSuccess = (msg) => {
    // Post-Registration Flow: Route user back to Log In screen with flash banner
    setFlashMessage(msg);
    setIsTimeoutRedirect(false);
    setView('login');
  };

  const handlePasswordResetSuccess = (msg) => {
    setFlashMessage(msg);
    setIsTimeoutRedirect(false);
  };

  const getThemeBackground = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gradient-to-br from-[#090d16] via-[#0d131f] to-[#04060a] text-slate-100 selection:bg-emerald-500 selection:text-slate-950';
      case 'forest':
        return 'bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#01140e] text-slate-100 selection:bg-emerald-500 selection:text-slate-950';
      default:
        return 'bg-gradient-to-br from-[#090d16] via-[#0d131f] to-[#04060a] text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeBackground()} flex flex-col font-sans relative overflow-x-hidden transition-colors duration-500`}>
      {/* Frosted Ambient Glowing Backdrops */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {theme === 'dark' && (
          <>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/15 via-transparent to-black/60" />
          </>
        )}
        {theme === 'forest' && (
          <>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-32 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/10 via-transparent to-black/40" />
          </>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {currentUser ? (
            /* Logged in Dashboard (Defaults to AI Plant Scanner) */
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
            >
              <Dashboard
                currentUser={currentUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                token={token}
                onRefreshUser={(updated) => setCurrentUser(updated)}
                onLogout={() => {
                  handleLogout(false);
                  setView('landing');
                }}
                secondsRemaining={secondsRemaining}
              />
            </motion.div>
          ) : view === 'landing' ? (
            /* Dynamic Front Page Landing Overview */
            <motion.div
              key="landing-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full"
            >
              <LandingPage
                onOpenLogin={() => {
                  setFlashMessage(null);
                  setIsTimeoutRedirect(false);
                  setView('login');
                }}
                onOpenRegister={() => {
                  setFlashMessage(null);
                  setIsTimeoutRedirect(false);
                  setView('register');
                }}
                currentUser={currentUser}
                onOpenDashboard={() => {
                  setActiveTab('scanner');
                }}
              />
            </motion.div>
          ) : (
            /* Auth Container (Login & Registration) */
            <motion.div
              key="auth-container"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center w-full"
            >
              {/* Back to Home Button */}
              <div className="mb-6 w-full max-w-md flex justify-between items-center">
                <button
                  onClick={() => setView('landing')}
                  className="text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 backdrop-blur-md transition-all cursor-pointer"
                >
                  <span>&larr;</span>
                  <span>Back to LeafDex Overview</span>
                </button>
                <span className="text-[11px] font-mono text-emerald-200/60">
                  LeafDex Deep Learning
                </span>
              </div>

              <AnimatePresence mode="wait">
                {view === 'login' ? (
                  <motion.div
                    key="login-page"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="w-full flex justify-center"
                  >
                    <LoginForm
                      onSuccess={handleLoginSuccess}
                      onNavigateRegister={() => {
                        setFlashMessage(null);
                        setIsTimeoutRedirect(false);
                        setView('register');
                      }}
                      onOpenResetPassword={() => setIsResetModalOpen(true)}
                      flashMessage={flashMessage}
                      isTimeoutRedirect={isTimeoutRedirect}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="register-page"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="w-full flex justify-center"
                  >
                    <RegisterForm
                      onSuccess={handleRegisterSuccess}
                      onNavigateLogin={() => {
                        setFlashMessage(null);
                        setIsTimeoutRedirect(false);
                        setView('login');
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimalist Auto Logout Warning Notification Pop-up */}
      <AutoLogoutWarning
        isOpen={Boolean(currentUser && secondsRemaining <= 15 && secondsRemaining > 0)}
        secondsRemaining={secondsRemaining}
        onStayLoggedIn={handleUserActivity}
        onLogout={() => handleLogout(false)}
      />

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccessNotice={handlePasswordResetSuccess}
      />

      {/* Theme Switcher pinned at Bottom Left Corner */}
      <ThemeSwitcher
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />
    </div>
  );
}
