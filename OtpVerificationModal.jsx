import React, { useState, useEffect, useRef } from 'react';
import { Mail, Clock, RotateCw, CheckCircle2, AlertCircle, X, Shield, ArrowRight } from 'lucide-react';

export const OtpVerificationModal = ({
  isOpen,
  onClose,
  email,
  fullName,
  onVerifyAndRegister,
  onResendOtp,
  isLoading = false,
}) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); 
  const [resendCooldown, setResendCooldown] = useState(30); 
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setTimeLeft(300);
      setResendCooldown(30);
      setErrorMsg(null);

      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  useEffect(() => {
    if (!isOpen || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, resendCooldown]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index, e) => {
    const val = e.target.value;
    setErrorMsg(null);

  
    if (val.length > 1) {
      const numbersOnly = val.replace(/\D/g, '').slice(0, 6);
      if (numbersOnly) {
        const newDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = numbersOnly[i] || '';
        }
        setDigits(newDigits);
        const nextFocus = Math.min(numbersOnly.length, 5);
        inputRefs.current[nextFocus]?.focus();
      }
      return;
    }

    const cleanChar = val.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);

    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      const fullOtp = digits.join('');
      if (fullOtp.length === 6) {
        handleSubmit();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setDigits(newDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setErrorMsg(null);

    try {
      const result = await onResendOtp();
      if (result?.success) {
        setTimeLeft(300);
        setResendCooldown(30);
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setErrorMsg(result?.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setErrorMsg('Network error while resending OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const fullOtp = digits.join('');

    if (fullOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMsg('This OTP code has expired. Please click "Resend Code".');
      return;
    }

    setErrorMsg(null);
    onVerifyAndRegister(fullOtp);
  };

  const otpComplete = digits.every((d) => d.length === 1);

  return (
    <div
      id="otp-verification-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="otp-verification-modal-dialog"
        className="w-full max-w-md bg-slate-900/95 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-white relative animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
          aria-label="Close OTP Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Mail Icon & Prompt */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
            <Mail className="w-7 h-7 text-emerald-400" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Check email for the OTP
          </h3>
          
          <p className="text-xs text-emerald-100/70 mt-2 max-w-xs mx-auto leading-relaxed">
            We sent a 6-digit one-time passcode to{' '}
            <strong className="text-white font-semibold underline decoration-emerald-500/50">
              {email}
            </strong>
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            id="otp-error-banner"
            className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start gap-2 backdrop-blur-md"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        {/* 6-Digit Segmented Input Boxes */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-emerald-200/80 text-center mb-3 tracking-wide">
            ENTER 6-DIGIT VERIFICATION CODE
          </label>
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isLoading}
                autoComplete="one-time-code"
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border bg-white/[0.07] text-white shadow-inner transition-all outline-none ${
                  digit
                    ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'border-white/20 focus:border-emerald-400 focus:bg-emerald-500/10 focus:shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timer & Resend Controls */}
        <div className="flex items-center justify-between text-xs text-emerald-200/80 mb-6 bg-white/[0.04] p-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className={`w-3.5 h-3.5 ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className={timeLeft < 60 ? 'text-rose-300 font-semibold' : ''}>
              Expires in: <strong className="font-mono text-white">{formatTime(timeLeft)}</strong>
            </span>
          </div>

          <button
            type="button"
            id="otp-resend-btn"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending || isLoading}
            className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
              resendCooldown > 0 || resending || isLoading
                ? 'text-white/40 cursor-not-allowed'
                : 'text-emerald-300 hover:text-emerald-200 underline decoration-emerald-400/40 hover:decoration-emerald-300'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
            {resending
              ? 'Sending...'
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend OTP'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            id="otp-verify-submit-btn"
            onClick={handleSubmit}
            disabled={!otpComplete || isLoading || timeLeft <= 0}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              !otpComplete || isLoading || timeLeft <= 0
                ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-[0_0_25px_rgba(16,185,129,0.4)] transform active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Verifying Code & Creating Account...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Verify & Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2.5 text-xs text-emerald-200/70 hover:text-white transition-colors cursor-pointer text-center"
          >
            Cancel / Edit Registration Details
          </button>
        </div>
      </div>
    </div>
  );
};
