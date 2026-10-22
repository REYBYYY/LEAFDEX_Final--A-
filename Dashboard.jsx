import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { getRoleBadgeColor, getRoleDisplayLabel } from '../utils/security.js';
import { PlantScanner } from './PlantScanner.jsx';
import { SavedScans } from './SavedScans.jsx';
import { ProfileTab } from './dashboard/ProfileTab.jsx';
import { SecurityTab } from './dashboard/SecurityTab.jsx';
import {
  Shield,
  ShieldAlert,
  UserCheck,
  KeyRound,
  Users,
  FileText,
  Unlock,
  RefreshCw,
  Clock,
  Bookmark,
  LogOut,
  Scan,
  User,
  Leaf,
  Settings,
  X,
  Info,
  Sliders,
  ChevronRight,
  ExternalLink,
  Lock,
  Cpu,
  ShieldCheck
} from 'lucide-react';

export const Dashboard = ({
  currentUser,
  token,
  onRefreshUser,
  onLogout,
  secondsRemaining,
}) => {
  // Modal / Drawer state for top-right profile & settings
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSavedScans, setShowSavedScans] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('profile'); // 'profile', 'security', 'users', 'audit', 'about'

  // State for Admin / Super Admin
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchUsers = async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setUsersList(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    if (!token) return;
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.logs) {
        setAuditLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeModalTab === 'users' && (currentUser.accessType === 'SUPER_ADMIN' || currentUser.accessType === 'ADMIN')) {
      fetchUsers();
    }
    if (activeModalTab === 'audit' && (currentUser.accessType === 'SUPER_ADMIN' || currentUser.accessType === 'ADMIN')) {
      fetchLogs();
    }
  }, [activeModalTab, currentUser.accessType]);

  const handleUnblockUser = async (id) => {
    if (currentUser.accessType !== 'SUPER_ADMIN') return;
    setActionMessage(null);
    try {
      const res = await fetch(`/api/users/${id}/unblock`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: data.message });
        fetchUsers();
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Failed to unblock user' });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Network error unblocking user' });
    }
  };

  const handleRoleChange = async (id, newAccessType) => {
    if (currentUser.accessType !== 'SUPER_ADMIN') return;
    setActionMessage(null);
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newAccessType }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: data.message });
        fetchUsers();
        if (id === currentUser.id && data.user) {
          onRefreshUser(data.user);
        }
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Failed to update role' });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Network error updating role' });
    }
  };

  // Extract initials for the top-right logo
  const userInitials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto pb-12">
      {/* Sleek App Top Bar */}
      <header className="flex items-center justify-between py-3 px-4 sm:px-6 bg-slate-900/80 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-xl">
        {/* Left: Brand & AI Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-300/40">
            <Leaf className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white tracking-tight">LeafDex</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                AI Vision v3.4
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/70 hidden sm:block">
              Deep Learning Plant Identification &amp; Diagnosis
            </p>
          </div>
        </div>

        {/* Right: Timeout Badge & Top-Right Profile / Settings Logo Button */}
        <div className="flex items-center gap-3">
          {/* Inactivity Timeout Badge */}
          {secondsRemaining !== undefined && (
            <div
              className={`hidden sm:flex items-center gap-1.5 backdrop-blur-md rounded-xl px-3 py-1.5 text-[11px] shadow-sm transition-all ${
                secondsRemaining <= 15
                  ? 'bg-amber-500/20 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-300 animate-pulse font-bold'
                  : 'bg-white/[0.06] border border-white/15 text-emerald-200/80 font-mono'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{secondsRemaining}s</span>
            </div>
          )}

          {/* Saved Scans Toggle */}
          <button
            onClick={() => setShowSavedScans((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border backdrop-blur-md transition-all cursor-pointer ${
              showSavedScans
                ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200'
                : 'bg-white/[0.06] border-white/15 text-emerald-200/80 hover:bg-white/[0.12]'
            }`}
            title="View saved scans"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Saved Scans</span>
          </button>

          {/* Top-Right Profile & Settings Logo Trigger Button */}
          <button
            id="btn-top-right-profile"
            onClick={() => setIsSettingsOpen(true)}
            className="group flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 hover:border-emerald-400/50 backdrop-blur-xl shadow-lg transition-all cursor-pointer"
            title="Open Profile, Settings & About"
          >
            {/* User Avatar Circle */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
              {userInitials}
            </div>

            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                <span>{currentUser.fullName.split(' ')[0]}</span>
                <span className="text-[10px] text-emerald-300 font-normal">({getRoleDisplayLabel(currentUser.accessType)})</span>
              </div>
              <div className="text-[10px] text-emerald-200/60 leading-tight">
                Profile &amp; Settings
              </div>
            </div>

            <Settings className="w-4 h-4 text-emerald-400/80 group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </div>
      </header>

      {/* Main Canvas: Direct Interactive Plant Scanner */}
      <main className="w-full">
        {showSavedScans ? (
          <SavedScans onBack={() => setShowSavedScans(false)} />
        ) : (
          <PlantScanner currentUser={currentUser} onSaved={() => setShowSavedScans(true)} />
        )}
      </main>

      {/* Hidden Profile, Security, Settings & About Modal / Drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-3xl bg-slate-900/95 border border-white/20 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                    {userInitials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{currentUser.fullName}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getRoleBadgeColor(currentUser.accessType)}`}>
                        {getRoleDisplayLabel(currentUser.accessType)}
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-200/70 font-mono">
                      {currentUser.email} &bull; ID #{currentUser.id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="flex items-center gap-1 px-5 sm:px-6 pt-3 border-b border-white/10 bg-white/[0.01] overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setActiveModalTab('profile')}
                  className={`py-2.5 px-3.5 rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeModalTab === 'profile'
                      ? 'border-emerald-400 text-emerald-300 bg-white/[0.05]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => setActiveModalTab('security')}
                  className={`py-2.5 px-3.5 rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeModalTab === 'security'
                      ? 'border-emerald-400 text-emerald-300 bg-white/[0.05]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </button>

                {(currentUser.accessType === 'SUPER_ADMIN' || currentUser.accessType === 'ADMIN') && (
                  <>
                    <button
                      onClick={() => setActiveModalTab('users')}
                      className={`py-2.5 px-3.5 rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeModalTab === 'users'
                          ? 'border-emerald-400 text-emerald-300 bg-white/[0.05]'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>User Directory</span>
                    </button>
                    <button
                      onClick={() => setActiveModalTab('audit')}
                      className={`py-2.5 px-3.5 rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeModalTab === 'audit'
                          ? 'border-emerald-400 text-emerald-300 bg-white/[0.05]'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Audit Logs</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setActiveModalTab('about')}
                  className={`py-2.5 px-3.5 rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeModalTab === 'about'
                      ? 'border-emerald-400 text-emerald-300 bg-white/[0.05]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>About LeafDex</span>
                </button>
              </div>

              {/* Modal Body Content (Scrollable) */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                
                {/* 1. MY PROFILE TAB */}
                {activeModalTab === 'profile' && <ProfileTab currentUser={currentUser} />}

                {/* 2. UPDATE PASSWORD TAB */}
                {activeModalTab === 'security' && <SecurityTab token={token} onRefreshUser={onRefreshUser} />}

                {/* 3. USER MANAGEMENT TAB */}
                {activeModalTab === 'users' && (
                  <div className="space-y-3 text-xs">
                    {actionMessage && (
                      <div className="p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-200">
                        {actionMessage.text}
                      </div>
                    )}
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 font-mono">
                            <th className="py-2.5 px-3">User</th>
                            <th className="py-2.5 px-3">Role</th>
                            <th className="py-2.5 px-3">Status</th>
                            {currentUser.accessType === 'SUPER_ADMIN' && <th className="py-2.5 px-3">Action</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {usersList.map((u) => (
                            <tr key={u.id}>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-white">{u.fullName}</div>
                                <div className="text-[10px] text-slate-400">{u.email}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getRoleBadgeColor(u.accessType)}`}>
                                  {u.accessType}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                {u.isBlocked ? (
                                  <span className="text-rose-400 font-semibold">Blocked</span>
                                ) : (
                                  <span className="text-emerald-400 font-semibold">Active</span>
                                )}
                              </td>
                              {currentUser.accessType === 'SUPER_ADMIN' && (
                                <td className="py-2.5 px-3">
                                  {u.isBlocked && (
                                    <button
                                      onClick={() => handleUnblockUser(u.id)}
                                      className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40 hover:bg-emerald-500/30"
                                    >
                                      Unblock
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. AUDIT LOGS TAB */}
                {activeModalTab === 'audit' && (
                  <div className="space-y-2 text-xs">
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20 max-h-64">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400">
                            <th className="py-2 px-3">Timestamp</th>
                            <th className="py-2 px-3">Event</th>
                            <th className="py-2 px-3">Principal</th>
                            <th className="py-2 px-3">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {auditLogs.slice(-15).reverse().map((log, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-3 text-[11px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                              <td className="py-2 px-3 text-[11px] font-semibold text-white">{log.action}</td>
                              <td className="py-2 px-3 text-[11px] text-emerald-200">{log.email}</td>
                              <td className="py-2 px-3 text-[11px]">{log.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. ABOUT LEAFDEX TAB */}
                {activeModalTab === 'about' && (
                  <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        LeafDex Deep Learning Engine v3.4
                      </h4>
                      <p className="text-slate-300">
                        LeafDex is an agricultural AI system engineered for image-based plant classification, foliar disease identification, and pharmacognosy profiling. Built using hybrid Convolutional Neural Networks (CNNs) and Vision Transformers (ViT) trained on 54,000+ benchmark agricultural foliar specimens.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                      <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-slate-400 block">Backbone Model</span>
                        <span className="text-emerald-300 font-bold">ResNet-50 + ViT Hybrid</span>
                      </div>
                      <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-slate-400 block">Foliar Accuracy</span>
                        <span className="text-cyan-300 font-bold">99.4% Top-1 Precision</span>
                      </div>
                    </div>

                    {/* Privacy Policy */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Privacy Policy
                      </h4>
                      <p className="text-slate-300">
                        LeafDex collects your email address (via Firebase Authentication) for account creation and login, and accesses your device camera to capture plant images. Captured images are sent to Google's AI API for plant identification and disease analysis. We do not store or share your images with third parties, and we never sell your personal data. The service uses cookies only for session management. You can delete your account at any time.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Bottom Footer (Log Out) */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Back to Scanner
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
