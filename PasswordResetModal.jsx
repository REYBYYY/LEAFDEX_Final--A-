import React, { useState } from 'react';
import { X, KeyRound, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter.jsx';
import { evaluatePassword } from '../utils/security.js';

export const PasswordResetModal = ({
  isOpen,
  onClose,
  initialEmail = '',
  onSuccessNotice,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isOpen) return null;

  const passwordEval = evaluatePassword(newPassword);
  const isMismatch = confirmNewPassword.length > 0 && newPassword !== confirmNewPassword;
  const isMatch = newPassword.length > 0 && confirmNewPassword.length > 0 && newPassword === confirmNewPassword;

  const handleBlockedClipboard = (e) => {
    e.preventDefault();
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (passwordEval.score < 5) {
      setErrorMessage('New password must satisfy all 5 password complexity rules.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Password reset rejected.');
      } else {
        setSuccessMessage(data.message || 'Password reset successful!');
        setTimeout(() => {
          onSuccessNotice('Password reset successful! You can now log in with your new password.');
          onClose();
        }, 1500);
      }
    } catch (err) {
      setErrorMessage('Network error during password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="modal-password-reset"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in"
    >
      <div className="bg-[#03261e]/90 border border-white/20 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-2xl relative">
        {/* Close Button */}
        <button
          id="btn-close-reset-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-emerald-200/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.25)] backdrop-blur-md">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white drop-shadow-sm">Reset Password</h3>
            <p className="text-xs text-emerald-100/70">
              Enter your registered email and new secure password
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            id="reset-error-alert"
            className="mb-4 p-3.5 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 backdrop-blur-md"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-white">{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div
            id="reset-success-alert"
            className="mb-4 p-3.5 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2.5 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-3.5 text-xs">
          {/* Email */}
          <div>
            <label htmlFor="reset-email" className="block font-semibold text-emerald-100/90 mb-1">
              Account Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              required
              placeholder="name@leafdex.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/15 rounded-xl text-white text-xs placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 focus:bg-white/[0.09] transition-all"
            />
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="reset-new-password" className="block font-semibold text-emerald-100/90 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="reset-new-password"
                type={showPass ? 'text' : 'password'}
                required
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 bg-white/[0.05] border border-white/15 rounded-xl text-white text-xs placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 focus:bg-white/[0.09] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-200/60 hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthMeter password={newPassword} showRules={false} />
          </div>

          {/* Confirm New Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="reset-confirm-password" className="block font-semibold text-emerald-100/90">
                Confirm New Password
              </label>
              <span className="text-[10px] text-amber-300 font-mono">[No paste]</span>
            </div>
            <div className="relative">
              <input
                id="reset-confirm-password"
                type={showConfirmPass ? 'text' : 'password'}
                required
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                onPaste={handleBlockedClipboard}
                onCopy={handleBlockedClipboard}
                onCut={handleBlockedClipboard}
                className={`w-full px-3.5 py-2.5 pr-10 bg-white/[0.05] border rounded-xl text-white text-xs placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:bg-white/[0.09] transition-all ${
                  isMismatch ? 'border-rose-400/80 bg-rose-500/10' : isMatch ? 'border-emerald-400/80' : 'border-white/15 focus:border-emerald-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-200/60 hover:text-white"
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Mismatch Warning */}
            {isMismatch && (
              <div className="mt-2 p-2.5 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200 text-[11px] flex items-center gap-2 backdrop-blur-md">
                <span>⚠️</span>
                <span>Passwords do not match.</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[40px] py-2.5 px-3 bg-white/10 hover:bg-white/20 text-emerald-100 font-semibold rounded-xl text-xs border border-white/15 backdrop-blur-sm transition-colors cursor-pointer shrink-0"
            >
              Cancel
            </button>
            <button
              id="btn-submit-password-reset"
              type="submit"
              disabled={loading}
              className="flex-1 min-h-[40px] py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl text-xs transition-colors shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-300/30 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
