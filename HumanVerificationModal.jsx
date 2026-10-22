import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, RotateCw, Sparkles, X, UserCheck, ArrowRight } from 'lucide-react';

const CHALLENGES = [
  { id: 'leaf', label: 'Select the green leaf 🍃', target: '🍃', options: ['🍎', '🍃', '🚗', '✈️'] },
  { id: 'plant', label: 'Select the seedling 🌱', target: '🌱', options: ['🍕', '🚲', '🌱', '⚽'] },
  { id: 'flower', label: 'Select the blossom 🌸', target: '🌸', options: ['🌸', '🏀', '🎸', '🚀'] },
  { id: 'tree', label: 'Select the tree 🌳', target: '🌳', options: ['🚁', '🌳', '🍔', '📱'] },
];

export const HumanVerificationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  userFullName,
}) => {
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeError, setChallengeError] = useState(false);

  const activeChallenge = CHALLENGES[challengeIndex];

  useEffect(() => {
    if (isOpen) {
      setIsVerified(false);
      setVerifying(false);
      setShowChallenge(false);
      setChallengeIndex(0);
      setChallengeError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckboxClick = () => {
    if (isVerified) return;
    setVerifying(true);
    setChallengeError(false);

    setTimeout(() => {
      setVerifying(false);
      setShowChallenge(true);
    }, 350);
  };

  const handleSelectOption = (opt) => {
    if (opt === activeChallenge.target) {
      setShowChallenge(false);
      setChallengeError(false);
      setIsVerified(true);
    } else {
      setChallengeError(true);
      setTimeout(() => {
        setChallengeIndex((prev) => (prev + 1) % CHALLENGES.length);
        setChallengeError(false);
      }, 700);
    }
  };

  const handleRefreshChallenge = () => {
    setChallengeIndex((prev) => (prev + 1) % CHALLENGES.length);
    setChallengeError(false);
  };

  const handleFinalize = () => {
    if (!isVerified) return;
    onConfirm();
  };

  return (
    <div
      id="human-verification-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="human-verification-modal-dialog"
        className="w-full max-w-md bg-slate-900/95 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-white relative animate-in zoom-in-95 duration-150"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Security Check</h3>
            <p className="text-xs text-emerald-200/80">Are you a Human?</p>
          </div>
        </div>

        <p className="text-xs text-emerald-100/70 mb-4 leading-relaxed">
          {userFullName ? (
            <>Welcome, <strong className="text-white">{userFullName}</strong>! </>
          ) : null}
          Please complete the verification below to finalize creating your LeafDex account and prevent automated bots.
        </p>

        {/* Verification Checkbox Box */}
        <div
          className={`p-4 rounded-2xl border backdrop-blur-md transition-all mb-4 ${
            isVerified
              ? 'bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-white/[0.06] border-white/15 hover:border-emerald-400/40'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="modal-human-verify-checkbox"
                onClick={handleCheckboxClick}
                disabled={isVerified || verifying}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isVerified
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                    : verifying
                    ? 'border-emerald-400 bg-white/10'
                    : 'border-white/30 bg-white/5 hover:border-emerald-400 hover:bg-white/10'
                }`}
              >
                {verifying ? (
                  <span className="w-4 h-4 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
                ) : isVerified ? (
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                ) : null}
              </button>

              <div className="text-left cursor-pointer" onClick={!isVerified ? handleCheckboxClick : undefined}>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">
                    {isVerified ? 'Verified Human' : 'Are you a Human?'}
                  </span>
                  {isVerified && (
                    <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono border border-emerald-500/40 flex items-center gap-0.5">
                      <UserCheck className="w-2.5 h-2.5" /> Pass
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-100/60 mt-0.5">
                  {isVerified ? 'Verification confirmed' : 'Click to verify you are a real person'}
                </p>
              </div>
            </div>

            <div className="text-right border-l border-white/10 pl-3">
              <span className="text-[10px] text-emerald-400 font-semibold block">LeafDex BotShield</span>
              <span className="text-[9px] text-white/40 font-mono">Anti-Bot v2</span>
            </div>
          </div>

          {/* Challenge area */}
          {showChallenge && !isVerified && (
            <div className="mt-3.5 pt-3.5 border-t border-white/15 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {activeChallenge.label}
                </span>
                <button
                  type="button"
                  onClick={handleRefreshChallenge}
                  className="text-[10px] text-white/60 hover:text-white flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" /> New
                </button>
              </div>

              {challengeError && (
                <p className="text-[10px] text-rose-300 mb-2">
                  Incorrect selection. Please try the new challenge...
                </p>
              )}

              <div className="grid grid-cols-4 gap-2">
                {activeChallenge.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className="h-12 text-2xl bg-white/10 hover:bg-emerald-500/30 active:bg-emerald-500/50 border border-white/20 hover:border-emerald-400/70 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-confirm-human-register"
            onClick={handleFinalize}
            disabled={!isVerified || isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
