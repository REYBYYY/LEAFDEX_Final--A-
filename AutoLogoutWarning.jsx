import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

export const AutoLogoutWarning = ({
  secondsRemaining,
  isOpen,
  onStayLoggedIn,
  onLogout,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="auto-logout-warning-toast"
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto"
        >
          <div className="bg-slate-950/90 border border-amber-500/50 rounded-2xl p-4 shadow-[0_10px_35px_rgba(245,158,11,0.25)] backdrop-blur-xl text-white">
            <div className="flex items-start gap-3.5">
              {/* Minimalist Warning Sign Icon */}
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>

              {/* Text Info & Countdown */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Auto Logout Warning</span>
                  </h4>
                  <span className="font-mono text-xs font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/40 tabular-nums">
                    {secondsRemaining}s
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  You will be automatically signed out in <strong className="text-amber-300 font-bold">{secondsRemaining} seconds</strong> due to inactivity.
                </p>

                {/* Quick Action Buttons */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-stay-logged-in"
                    onClick={onStayLoggedIn}
                    className="flex-1 py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl text-xs shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Stay Logged In</span>
                  </button>
                  <button
                    type="button"
                    id="btn-logout-early"
                    onClick={onLogout}
                    className="py-1.5 px-3 bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 border border-white/15 hover:border-rose-400/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
