import React from 'react';
import { evaluatePassword } from '../utils/security.js';
import { Check, X } from 'lucide-react';

export const PasswordStrengthMeter = ({
  password = '',
  showRules = true,
}) => {
  const evalResult = evaluatePassword(password);

  if (!password) {
    return null;
  }

  const { tier, label, score, rules: ruleResults } = evalResult;

  const getTierDetails = () => {
    switch (tier) {
      case 'STRONG':
        return {
          label: 'Strong',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          barColor: 'bg-emerald-500',
          width: 'w-full',
          icon: '🟢',
        };
      case 'MODERATE':
        return {
          label: 'Average',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          barColor: 'bg-amber-500',
          width: 'w-2/3',
          icon: '🟡',
        };
      case 'WEAK':
      default:
        return {
          label: 'Weak',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          barColor: 'bg-rose-500',
          width: 'w-1/3',
          icon: '🔴',
        };
    }
  };

  const currentTier = getTierDetails();

  const rules = [
    { label: '8-16 characters length', valid: ruleResults?.length },
    { label: 'At least one uppercase letter (A-Z)', valid: ruleResults?.uppercase },
    { label: 'At least one lowercase letter (a-z)', valid: ruleResults?.lowercase },
    { label: 'At least one numeric digit (0-9)', valid: ruleResults?.number },
    { label: 'At least one special character (!@#$%^&*()_...)', valid: ruleResults?.special },
  ];

  return (
    <div id="password-strength-container" className="mt-2 space-y-2 text-xs">
      {/* 3-Tier Visual Indicator Header */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-emerald-100/90 flex items-center gap-1.5">
          Password Strength:
          <span
            id="password-strength-badge"
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm shadow-sm ${currentTier.badgeClass}`}
          >
            <span>{currentTier.icon}</span>
            <span>{currentTier.label}</span>
          </span>
        </span>
        <span className="text-emerald-200/60 font-mono text-[11px]">
          {score}/5 Rules
        </span>
      </div>

      {/* Progress Bar with 3 segments */}
      <div className="grid grid-cols-3 gap-1.5 h-2 w-full bg-white/10 rounded-full p-0.5 overflow-hidden backdrop-blur-sm border border-white/10">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 1
              ? tier === 'WEAK'
                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                : tier === 'MODERATE'
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
              : 'bg-transparent'
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 3
              ? tier === 'MODERATE'
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
              : 'bg-transparent'
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score === 5 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-transparent'
          }`}
        />
      </div>

      {/* Rules Checklist */}
      {showRules && (
        <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10 backdrop-blur-md space-y-1.5">
          <p className="text-[10px] font-semibold text-emerald-200/70 uppercase tracking-wider font-mono">
            Password Security Criteria
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1.5 transition-colors ${
                  rule.valid ? 'text-emerald-300 font-medium' : 'text-emerald-100/40'
                }`}
              >
                {rule.valid ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-emerald-200/30 shrink-0" />
                )}
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
