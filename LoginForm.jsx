import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { OtpVerificationModal } from './OtpVerificationModal.jsx';
import { HumanVerificationWidget } from './HumanVerificationWidget.jsx';

const REMEMBER_EMAIL_KEY = 'ldx_remember_email';
const REMEMBER_PWD_KEY   = 'ldx_remember_pwd';
const REMEMBER_ME_KEY    = 'ldx_remember_me';

// Simple obfuscation — NOT true encryption, just avoids plain-text storage
const obfuscate   = (str) => btoa(encodeURIComponent(str));
const deobfuscate = (str) => { try { return decodeURIComponent(atob(str)); } catch { return ''; } };

export const LoginForm = ({
  onSuccess,
  onNavigateRegister,
  onOpenResetPassword,
  flashMessage,
  isTimeoutRedirect,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [humanVerifyError, setHumanVerifyError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedRemember = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    if (savedRemember) {
      const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
      const savedPwd   = deobfuscate(localStorage.getItem(REMEMBER_PWD_KEY) || '');
      setRememberMe(true);
      setEmail(savedEmail);
      setPassword(savedPwd);
    }
  }, []);


  const isCredentialsEntered = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAccountBlocked) return;

    if (!isCredentialsEntered) {
      setErrorMessage('Please enter both your email and password first.');
      return;
    }

    if (!isHumanVerified) {
      setHumanVerifyError(true);
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isBlocked || (data.failedAttempts && data.failedAttempts >= 3)) {
          setIsAccountBlocked(true);
          setFailedAttempts(data.failedAttempts || 3);
          setErrorMessage('Account Blocked: You have entered incorrect credentials 3 times. Your account is now blocked.');
        } else {
          setFailedAttempts(data.failedAttempts || 0);
          setErrorMessage(data.message || 'Invalid email or password.');
        }
      } else {
        // Save or clear Remember Me credentials
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY,    'true');
          localStorage.setItem(REMEMBER_EMAIL_KEY,  email.trim());
          localStorage.setItem(REMEMBER_PWD_KEY,    obfuscate(password));
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
          localStorage.removeItem(REMEMBER_PWD_KEY);
        }
        // Success
        setFailedAttempts(0);
        setIsAccountBlocked(false);
        onSuccess(data);
      }
    } catch (err) {
      setErrorMessage('Network connection error or server unavailable.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="w-full max-w-md mx-auto">
      {/* Flash Banner for Registration Success */}
      {flashMessage && (
        <div
          id="flash-registration-banner"
          className="mb-4 p-4 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl text-emerald-200 text-xs flex items-center gap-3 shadow-[0_4px_20px_rgba(16,185,129,0.25)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-white">{flashMessage}</p>
            <p className="text-[11px] text-emerald-200/80 mt-0.5">
              Please enter your registered email and password to log in.
            </p>
          </div>
        </div>
      )}

      {/* Timeout Alert Banner */}
      {isTimeoutRedirect && (
        <div
          id="timeout-alert-banner"
          className="mb-4 p-4 bg-amber-500/20 border border-amber-400/50 rounded-2xl text-amber-200 text-xs flex items-center gap-3 shadow-[0_4px_20px_rgba(245,158,11,0.25)] backdrop-blur-xl"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-amber-100">Session Expired</p>
            <p className="text-[11px] text-amber-200/80 mt-0.5">
              You were logged out automatically after 60 seconds of inactivity.
            </p>
          </div>
        </div>
      )}

      {/* Account Blocked Notice */}
      {isAccountBlocked && (
        <div
          id="account-blocked-notice"
          className="mb-4 p-4 bg-rose-500/20 border border-rose-500/60 rounded-2xl text-rose-200 text-xs flex items-start gap-3 shadow-[0_4px_20px_rgba(244,63,94,0.3)] backdrop-blur-xl"
        >
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-100 text-sm">Account Blocked</h4>
            <p className="mt-1 text-rose-200/90 text-xs leading-relaxed">
              Further login attempts are disabled due to 3 consecutive failed attempts. Please contact a Super Admin or reset your password.
            </p>
            <button
              onClick={onOpenResetPassword}
              className="mt-2.5 inline-flex items-center text-xs font-semibold text-rose-100 underline hover:text-white"
            >
              Reset your password to unblock &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="bg-white/[0.08] backdrop-blur-2xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-emerald-300 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.25)] backdrop-blur-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
            Sign In
          </h2>
          <p className="text-xs text-emerald-100/70 mt-1 font-normal">
            Enter your email and password to access your account
          </p>
        </div>

        {errorMessage && !isAccountBlocked && (
          <div
            id="login-error-alert"
            className="mb-4 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 backdrop-blur-md"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium">{errorMessage}</span>
              {failedAttempts > 0 && failedAttempts < 3 && (
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-amber-200">
                  <span>Failed Attempts: {failedAttempts} of 3</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full ${
                          step <= failedAttempts ? 'bg-rose-400' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field (Username) */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-emerald-100/90 mb-1.5">
              Email Address (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-200/50">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                disabled={isAccountBlocked || loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@leafdex.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.05] border border-white/15 rounded-xl text-sm text-white placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 focus:bg-white/[0.09] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-emerald-100/90">
                Password
              </label>
              <button
                type="button"
                onClick={onOpenResetPassword}
                className="text-xs text-emerald-300 hover:text-white hover:underline transition-colors"
              >
                Forgot / Reset?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-200/50">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isAccountBlocked || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white/[0.05] border border-white/15 rounded-xl text-sm text-white placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 focus:bg-white/[0.09] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                id="toggle-login-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-200/60 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <button
              id="remember-me-toggle"
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe((prev) => !prev)}
              disabled={isAccountBlocked || loading}
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                rememberMe ? 'bg-emerald-500' : 'bg-white/15 border border-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  rememberMe ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <label
              htmlFor="remember-me-toggle"
              onClick={() => !isAccountBlocked && !loading && setRememberMe((prev) => !prev)}
              className="text-xs text-emerald-100/80 select-none cursor-pointer"
            >
              Remember my email &amp; password
            </label>
          </div>

          {/* Bot Defense Check */}
          {isCredentialsEntered && (
            <div className="pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <HumanVerificationWidget
                isVerified={isHumanVerified}
                onVerify={(verified) => {
                  setIsHumanVerified(verified);
                  if (verified) setHumanVerifyError(false);
                }}
                hasError={humanVerifyError}
                idPrefix="login-human-verify"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={isAccountBlocked || loading}
            className="w-full min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-300/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Switch to Registration */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-emerald-100/70">
          Don't have an account yet?{' '}
          <button
            id="link-go-to-register"
            onClick={onNavigateRegister}
            className="text-emerald-300 font-semibold hover:text-white hover:underline ml-1"
          >
            Create Account &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
