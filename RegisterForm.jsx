import React, { useState, useRef } from 'react';
import { Eye, EyeOff, UserPlus, Calendar, AlertTriangle, CheckCircle2, Key, Lock, ShieldCheck, Mail } from 'lucide-react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter.jsx';
import { BirthdayPickerPopover } from './BirthdayPickerPopover.jsx';
import { HumanVerificationModal } from './HumanVerificationModal.jsx';
import { OtpVerificationModal } from './OtpVerificationModal.jsx';
import { validateFullName, validateBirthday, validateMobilePhone, evaluatePassword, validateAccessTypePassword } from '../utils/security.js';

export const RegisterForm = ({
  onSuccess,
  onNavigateLogin,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    birthday: '2000-01-01',
    address: '',
    email: '',
    mobilePhone: '',
    accessType: 'USER',
    password: '',
    confirmPassword: '',
    accessTypePassword: '',
  });

  const [birthMonth, setBirthMonth] = useState('01');
  const [birthDay, setBirthDay] = useState('01');
  const [birthYear, setBirthYear] = useState('2000');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isHumanModalOpen, setIsHumanModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const monthInputRef = useRef(null);
  const dayInputRef = useRef(null);
  const yearInputRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRolePassword, setShowRolePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Field validations
  const nameValidation = validateFullName(formData.fullName);
  const birthdayValidation = validateBirthday(formData.birthday);
  const phoneValidation = validateMobilePhone(formData.mobilePhone);
  const passwordEval = evaluatePassword(formData.password);
  const rolePassValidation = validateAccessTypePassword(formData.accessType, formData.accessTypePassword);

  const isNameDirty = formData.fullName.length > 0;
  const isBirthdayDirty = birthMonth.length > 0 || birthDay.length > 0 || birthYear.length > 0;
  const isPhoneDirty = formData.mobilePhone.length > 0;
  const isRolePassDirty = (formData.accessTypePassword || '').length > 0;

  const passwordsMatch = formData.password.length > 0 && formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  // Synchronization helper between segmented inputs and formData.birthday (YYYY-MM-DD)
  const syncBirthdayToForm = (m, d, y) => {
    if (m && d && y && y.length === 4) {
      setFormData((prev) => ({
        ...prev,
        birthday: `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`,
      }));
    } else if (!m && !d && !y) {
      setFormData((prev) => ({ ...prev, birthday: '' }));
    } else {
      setFormData((prev) => ({
        ...prev,
        birthday: `${(y || '0000').padStart(4, '0')}-${(m || '00').padStart(2, '0')}-${(d || '00').padStart(2, '0')}`,
      }));
    }
  };

  const handleMonthChange = (e) => {
    const rawVal = e.target.value;
    // Support pasting formatted dates (e.g. MM/DD/YYYY or MM-DD-YYYY)
    if (rawVal.includes('/') || rawVal.includes('-') || rawVal.length > 2) {
      const parts = rawVal.replace(/[^0-9/-]/g, '').split(/[/|-]/);
      if (parts.length >= 3) {
        const m = parts[0].slice(0, 2);
        const d = parts[1].slice(0, 2);
        const y = parts[2].slice(0, 4);
        setBirthMonth(m);
        setBirthDay(d);
        setBirthYear(y);
        syncBirthdayToForm(m, d, y);
        if (y.length === 4) {
          yearInputRef.current?.focus();
        }
        return;
      }
    }

    const digits = rawVal.replace(/\D/g, '').slice(0, 2);
    setBirthMonth(digits);
    syncBirthdayToForm(digits, birthDay, birthYear);

    if (digits.length === 2) {
      dayInputRef.current?.focus();
      dayInputRef.current?.select();
    }
  };

  const handleMonthKeyDown = (e) => {
    if (e.key === '/' || e.key === 'Enter' || e.key === 'ArrowRight') {
      if (birthMonth.length > 0) {
        e.preventDefault();
        dayInputRef.current?.focus();
        dayInputRef.current?.select();
      }
    }
  };

  const handleDayChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
    setBirthDay(digits);
    syncBirthdayToForm(birthMonth, digits, birthYear);

    if (digits.length === 2) {
      yearInputRef.current?.focus();
      yearInputRef.current?.select();
    }
  };

  const handleDayKeyDown = (e) => {
    if (e.key === 'Backspace' && (!birthDay || birthDay.length === 0)) {
      monthInputRef.current?.focus();
    } else if (e.key === '/' || e.key === 'Enter' || e.key === 'ArrowRight') {
      if (birthDay.length > 0) {
        e.preventDefault();
        yearInputRef.current?.focus();
        yearInputRef.current?.select();
      }
    } else if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
      monthInputRef.current?.focus();
    }
  };

  const handleYearChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    setBirthYear(digits);
    syncBirthdayToForm(birthMonth, birthDay, digits);
  };

  const handleYearKeyDown = (e) => {
    if (e.key === 'Backspace' && (!birthYear || birthYear.length === 0)) {
      dayInputRef.current?.focus();
    } else if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
      dayInputRef.current?.focus();
    }
  };

  const handleSelectDateFromCalendar = (m, d, y) => {
    setBirthMonth(m);
    setBirthDay(d);
    setBirthYear(y);
    syncBirthdayToForm(m, d, y);
  };

  const handleBlockedClipboard = (e) => {
    e.preventDefault();
  };

  const handleNameChange = (e) => {
    const rawVal = e.target.value;
    const sanitized = rawVal
      .replace(/[^a-zA-Z .\-]/g, '')  // strip anything that isn't a letter, space, dot, or dash
      .replace(/^\s/, '');              // no leading space
    setFormData({ ...formData, fullName: sanitized });
  };

  const handleMobileChange = (e) => {
    const rawVal = e.target.value;

    // Allow + anywhere in user input and place it as leading +
    const hasPlus = rawVal.includes('+');
    const digitsOnly = rawVal.replace(/\D/g, '');

    // Determine max digits based on prefix
    // +63... or 63... → 12 digits | 09... → 11 digits
    let maxDigits = 12;
    if (digitsOnly.startsWith('09')) {
      maxDigits = 11;
    }

    const capped = (hasPlus ? '+' : '') + digitsOnly.slice(0, maxDigits);
    setFormData({ ...formData, mobilePhone: capped });
  };

  const handleAccessTypeChange = (e) => {
    const newAccessType = e.target.value;
    setFormData({
      ...formData,
      accessType: newAccessType,
      accessTypePassword: newAccessType === 'USER' ? '' : formData.accessTypePassword || '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError(null);

    // Client-side validations
    if (!nameValidation.valid) {
      setServerError(nameValidation.error || 'Invalid Full Name: Only alphabetical letters and spaces are allowed.');
      return;
    }
    if (!birthdayValidation.valid) {
      setServerError(birthdayValidation.error || 'Invalid Birthday: Must enforce 18+ age restriction (2007 or earlier).');
      return;
    }
    if (!formData.address.trim()) {
      setServerError('Address is required.');
      return;
    }
    if (!phoneValidation.valid) {
      setServerError(phoneValidation.error || 'Invalid Phone Number: Must enter a 10-digit mobile number with (+63) country prefix.');
      return;
    }
    if (formData.accessType !== 'USER' && !rolePassValidation.valid) {
      setServerError(rolePassValidation.error || 'Invalid Access Type Passcode.');
      return;
    }
    if (passwordEval.score < 5) {
      setServerError('Password must satisfy all 5 password complexity requirements.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setServerError('Passwords do not match.');
      return;
    }

    setIsHumanModalOpen(true);
  };

  const handleSecurityCheckPassed = async () => {
    setLoading(true);
    setServerError(null);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsHumanModalOpen(false);
        setServerError(data.message || 'Failed to send OTP verification code.');
      } else {
        setIsHumanModalOpen(false);
        setIsOtpModalOpen(true);
      }
    } catch (err) {
      setIsHumanModalOpen(false);
      setServerError('Network error while requesting OTP code. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        fullName: formData.fullName,
      }),
    });
    const data = await response.json();
    return data;
  };

  const executeRegistrationWithOtp = async (otpCode) => {
    setLoading(true);
    setServerError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || 'Registration failed.');
        return;
      }

      setIsOtpModalOpen(false);
      onSuccess(data.message || 'Account Created! Please log in.');
    } catch (err) {
      setServerError('Network error. Failed to reach the registration service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white/[0.08] backdrop-blur-2xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-emerald-300 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.25)] backdrop-blur-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
            Create Account
          </h2>
          <p className="text-xs text-emerald-100/70 mt-1 font-normal">
            Fill in your details to register for LeafDex
          </p>
        </div>

        {serverError && (
          <div
            id="register-error-alert"
            className="mb-4 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 backdrop-blur-md"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-white">Registration Error</p>
              <p className="mt-0.5 text-rose-200/90">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Full Name & Access Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="reg-fullname" className="block font-semibold text-emerald-100/90">
                  Full Name <span className="text-rose-400">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={handleNameChange}
                  className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/15 rounded-xl text-white text-xs placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 focus:bg-white/[0.09] transition-all"
                />
              </div>
            </div>

            {/* Access Type Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="reg-accesstype" className="block font-semibold text-emerald-100/90">
                  Access Type (Role) <span className="text-rose-400">*</span>
                </label>
                {formData.accessType !== 'USER' && (
                  <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" /> Passcode Protected
                  </span>
                )}
              </div>
              <select
                id="reg-accesstype"
                value={formData.accessType}
                onChange={handleAccessTypeChange}
                className="w-full px-3.5 py-2.5 bg-[#03261e] border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 backdrop-blur-md transition-all"
              >
                <option value="USER" className="bg-[#03261e] text-white">USER (Standard Role)</option>
                <option value="ADMIN" className="bg-[#03261e] text-white">ADMIN (Passcode Required)</option>
                <option value="SUPER_ADMIN" className="bg-[#03261e] text-white">SUPER_ADMIN (Passcode Required)</option>
              </select>
              <p className="text-[10px] text-emerald-100/60 mt-1">
                Role will be mapped to GrantedAuthority
              </p>
            </div>
          </div>

          {/* Conditional Access Type Passcode Input (ADMIN / SUPER_ADMIN) */}
          {formData.accessType !== 'USER' && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-400/30 rounded-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="reg-accesstype-password" className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {formData.accessType === 'ADMIN' ? 'Admin Access Passcode' : 'Super Admin Access Passcode'}{' '}
                    <span className="text-rose-400">*</span>
                  </span>
                </label>
                {isRolePassDirty && (
                  <span className={`text-[10px] font-mono font-medium ${rolePassValidation.valid ? 'text-emerald-300' : 'text-rose-400'}`}>
                    {rolePassValidation.valid ? '✓ Passcode Accepted' : '✗ Invalid Passcode'}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  id="reg-accesstype-password"
                  type={showRolePassword ? 'text' : 'password'}
                  required
                  placeholder="Enter security passcode for this role"
                  value={formData.accessTypePassword || ''}
                  onChange={(e) => setFormData({ ...formData, accessTypePassword: e.target.value })}
                  className={`w-full px-3.5 py-2.5 pr-10 bg-white/[0.05] border rounded-xl text-white text-xs placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all ${
                    isRolePassDirty && !rolePassValidation.valid
                      ? 'border-rose-400/80 bg-rose-500/10'
                      : isRolePassDirty && rolePassValidation.valid
                      ? 'border-emerald-400/80 bg-emerald-500/10'
                      : 'border-white/20 focus:border-emerald-400'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-role-password"
                  onClick={() => setShowRolePassword(!showRolePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/60 hover:text-white transition-colors"
                  aria-label="Toggle role password visibility"
                >
                  {showRolePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between mt-1.5 text-[10px]">
                <span className="text-emerald-200/60">
                  Elevated role requires verification
                </span>
                {isRolePassDirty && rolePassValidation.valid && (
                  <span className="text-emerald-300 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Authorized for {formData.accessType}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Row 2: Birthday & Mobile Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Birthday formatted as MM/DD/YYYY with auto-advancing focus & Calendar picker */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="reg-birthday-month" className="block font-semibold text-emerald-100/90">
                  Date of Birth (MM/DD/YYYY) <span className="text-rose-400">*</span>
                </label>
              </div>

              <div className="relative">
                <div
                  className={`relative flex items-center justify-between px-3.5 py-2.5 bg-white/[0.05] border rounded-xl text-white text-xs backdrop-blur-md focus-within:ring-2 focus-within:ring-emerald-400/40 focus-within:bg-white/[0.09] transition-all ${
                    isBirthdayDirty && !birthdayValidation.valid
                      ? 'border-rose-400/80 bg-rose-500/10'
                      : isBirthdayDirty && birthdayValidation.valid
                      ? 'border-emerald-400/80'
                      : 'border-white/15 focus-within:border-emerald-400'
                  }`}
                >
                  {/* MM / DD / YYYY segmented inputs */}
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <input
                      id="reg-birthday-month"
                      ref={monthInputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      placeholder="MM"
                      aria-label="Birth Month (MM)"
                      value={birthMonth}
                      onChange={handleMonthChange}
                      onKeyDown={handleMonthKeyDown}
                      className="w-7 text-center bg-transparent text-white font-medium placeholder-emerald-100/30 focus:outline-none focus:text-emerald-300 transition-colors"
                    />
                    <span className="text-emerald-200/40 select-none">/</span>
                    <input
                      id="reg-birthday-day"
                      ref={dayInputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      placeholder="DD"
                      aria-label="Birth Day (DD)"
                      value={birthDay}
                      onChange={handleDayChange}
                      onKeyDown={handleDayKeyDown}
                      className="w-7 text-center bg-transparent text-white font-medium placeholder-emerald-100/30 focus:outline-none focus:text-emerald-300 transition-colors"
                    />
                    <span className="text-emerald-200/40 select-none">/</span>
                    <input
                      id="reg-birthday-year"
                      ref={yearInputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="YYYY"
                      aria-label="Birth Year (YYYY)"
                      value={birthYear}
                      onChange={handleYearChange}
                      onKeyDown={handleYearKeyDown}
                      className="w-12 text-center bg-transparent text-white font-medium placeholder-emerald-100/30 focus:outline-none focus:text-emerald-300 transition-colors"
                    />
                  </div>

                  {/* Calendar Popover Trigger Button */}
                  <button
                    id="reg-birthday"
                    type="button"
                    onClick={() => setIsCalendarOpen((prev) => !prev)}
                    className={`relative flex items-center justify-center pl-2.5 py-0.5 border-l border-white/15 transition-all group ${
                      isCalendarOpen ? 'text-emerald-300 scale-110' : 'text-emerald-300/80 hover:text-emerald-200'
                    }`}
                    title="Open Interactive Calendar Picker"
                    aria-label="Open Interactive Calendar Picker"
                    aria-expanded={isCalendarOpen}
                  >
                    <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Popover Calendar */}
                <BirthdayPickerPopover
                  isOpen={isCalendarOpen}
                  onClose={() => setIsCalendarOpen(false)}
                  selectedMonth={birthMonth}
                  selectedDay={birthDay}
                  selectedYear={birthYear}
                  onSelectDate={handleSelectDateFromCalendar}
                />
              </div>

              <p className="text-[10px] text-emerald-100/60 mt-1">
                Enter as <code className="text-emerald-300 font-mono">MM/DD/YYYY</code> or use the calendar.
              </p>
              {isBirthdayDirty && !birthdayValidation.valid && (
                <div className="mt-1.5 p-2 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-200 text-[11px] flex items-center gap-1.5 backdrop-blur-md animate-in fade-in">
                  <span>⚠️</span>
                  <span>{birthdayValidation.error}</span>
                </div>
              )}
            </div>

            {/* Mobile Phone */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="reg-mobile" className="block font-semibold text-emerald-100/90">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-200/70">
                  {(() => {
                    const p = formData.mobilePhone;
                    const digits = p.replace(/\D/g, '');
                    const maxDigits = digits.startsWith('09') ? 11 : 12;
                    const maxLen = p.startsWith('+') ? maxDigits + 1 : maxDigits;
                    return `${p.length} / ${maxLen} chars`;
                  })()}
                </span>
              </div>
              <div className="relative">
                <input
                  id="reg-mobile"
                  type="text"
                  inputMode="tel"
                  required
                  placeholder="e.g. 09123456789 or +639123456789"
                  value={formData.mobilePhone}
                  onChange={handleMobileChange}
                  className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/15 rounded-xl text-white text-xs placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 focus:bg-white/[0.09] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Email & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email (Username) */}
            <div>
              <label htmlFor="reg-email" className="block font-semibold text-emerald-100/90 mb-1">
                Email Address (Username) <span className="text-rose-400">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                required
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/15 rounded-xl text-white text-xs placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 focus:bg-white/[0.09] transition-all"
              />
              <p className="text-[10px] text-emerald-100/60 mt-1">
                Serves as primary security principal / unique username
              </p>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="reg-address" className="block font-semibold text-emerald-100/90 mb-1">
                Home Address <span className="text-rose-400">*</span>
              </label>
              <input
                id="reg-address"
                type="text"
                required
                placeholder="123 Green Ave, City"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/15 rounded-xl text-white text-xs placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 focus:bg-white/[0.09] transition-all"
              />
            </div>
          </div>

          {/* Row 4: Password with 3-tier meter */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="reg-password" className="block font-semibold text-emerald-100/90">
                Password <span className="text-rose-400">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter strong password (8-16 chars)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 pr-10 bg-white/[0.05] border border-white/15 rounded-xl text-white text-xs placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 focus:bg-white/[0.09] transition-all"
              />
              <button
                type="button"
                id="toggle-reg-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-200/60 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Visual 3-Tier Password Strength Meter */}
            <PasswordStrengthMeter password={formData.password} showRules={true} />
          </div>

          {/* Row 5: Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="reg-confirm-password" className="block font-semibold text-emerald-100/90">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-amber-300/90 font-mono">
                [Clipboard paste/copy disabled]
              </span>
            </div>
            <div className="relative">
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password manually"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                onPaste={handleBlockedClipboard}
                onCopy={handleBlockedClipboard}
                onCut={handleBlockedClipboard}
                className={`w-full px-3.5 py-2.5 pr-10 bg-white/[0.05] border rounded-xl text-white text-xs placeholder-emerald-100/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:bg-white/[0.09] transition-all ${
                  passwordsMismatch ? 'border-rose-400/80 bg-rose-500/10' : passwordsMatch ? 'border-emerald-400/80' : 'border-white/15 focus:border-emerald-400'
                }`}
              />
              <button
                type="button"
                id="toggle-reg-confirm-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-200/60 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Real-time Password Match Warning */}
            {passwordsMismatch && (
              <div
                id="password-mismatch-warning"
                className="mt-2 p-2.5 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2 backdrop-blur-md animate-in fade-in"
              >
                <span className="text-base">⚠️</span>
                <span className="font-semibold text-rose-100">
                  Passwords do not match!
                </span>
              </div>
            )}

            {passwordsMatch && (
              <div className="mt-2 text-[11px] text-emerald-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Passwords match!</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:from-emerald-600 active:to-teal-600 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-300/30 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0 select-none"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-semibold">Create Account</span>
              )}
            </button>
          </div>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-emerald-100/70">
          Already have an account?{' '}
          <button
            id="link-go-to-login"
            onClick={onNavigateLogin}
            className="text-emerald-300 font-semibold hover:text-white hover:underline ml-1"
          >
            &larr; Return to Sign In
          </button>
        </div>
      </div>

      {/* Human Verification Modal after filling register form */}
      <HumanVerificationModal
        isOpen={isHumanModalOpen}
        onClose={() => setIsHumanModalOpen(false)}
        onConfirm={handleSecurityCheckPassed}
        isLoading={loading}
        userFullName={formData.fullName}
      />

      {/* OTP Verification Modal (Pops up onscreen with 'Check email for the OTP') */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={formData.email}
        fullName={formData.fullName}
        onVerifyAndRegister={executeRegistrationWithOtp}
        onResendOtp={handleResendOtp}
        isLoading={loading}
      />
    </div>
  );
};
