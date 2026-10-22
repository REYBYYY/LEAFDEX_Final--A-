import React, { useState } from 'react';
import { ShieldCheck, Check, RotateCw, Sparkles, UserCheck } from 'lucide-react';

const CHALLENGES = [
  { id: 'leaf', label: 'Select the green leaf 🍃', target: '🍃', options: ['🍎', '🍃', '🚗', '✈️'] },
  { id: 'plant', label: 'Select the seedling 🌱', target: '🌱', options: ['🍕', '🚲', '🌱', '⚽'] },
  { id: 'flower', label: 'Select the blossom 🌸', target: '🌸', options: ['🌸', '🏀', '🎸', '🚀'] },
  { id: 'tree', label: 'Select the tree 🌳', target: '🌳', options: ['🚁', '🌳', '🍔', '📱'] },
];

export const HumanVerificationWidget = ({
  isVerified,
  onVerify,
  hasError = false,
  idPrefix = 'human-verify',
  className = '',
}) => {
  const [verifying, setVerifying] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeError, setChallengeError] = useState(false);

  const activeChallenge = CHALLENGES[challengeIndex];

  const handleCheckboxClick = () => {
    if (isVerified) return;
    setVerifying(true);
    setChallengeError(false);

    setTimeout(() => {
      setVerifying(false);
      setShowChallenge(true);
    }, 400);
  };

  const handleSelectOption = (opt) => {
    if (opt === activeChallenge.target) {
      setShowChallenge(false);
      setChallengeError(false);
      onVerify(true);
    } else {
      setChallengeError(true);
      setTimeout(() => {
        setChallengeIndex((prev) => (prev + 1) % CHALLENGES.length);
        setChallengeError(false);
      }, 700);
    }
  };

  const handleReset = (e) => {
    e.stopPropagation();
    onVerify(false);
    setShowChallenge(false);
    setChallengeIndex((prev) => (prev + 1) % CHALLENGES.length);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        id={`${idPrefix}-container`}
        className={`relative p-3.5 bg-white/[0.06] border rounded-xl backdrop-blur-md transition-all ${
          hasError && !isVerified
            ? 'border-rose-400/80 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
            : isVerified
            ? 'border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
            : 'border-white/15 hover:border-emerald-400/40 hover:bg-white/[0.08]'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Checkbox and Label */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id={`${idPrefix}-checkbox`}
              onClick={handleCheckboxClick}
              disabled={isVerified || verifying}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer select-none ${
                isVerified
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : verifying
                  ? 'border-emerald-400 bg-white/10'
                  : hasError
                  ? 'border-rose-400 bg-rose-500/20 hover:border-rose-300'
                  : 'border-white/30 bg-white/5 hover:border-emerald-400 hover:bg-white/10'
              }`}
              aria-label="Verify Are you a human"
            >
              {verifying ? (
                <span className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
              ) : isVerified ? (
                <Check className="w-4 h-4 text-white stroke-[3]" />
              ) : null}
            </button>

            <div className="text-left cursor-pointer" onClick={!isVerified ? handleCheckboxClick : undefined}>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  {isVerified ? 'Verified Human' : 'Are you a Human?'}
                </span>
                {isVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-300 font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    <UserCheck className="w-2.5 h-2.5" /> Pass
                  </span>
                )}
              </div>
              <p className="text-[10px] text-emerald-100/60 mt-0.5">
                {isVerified ? 'Security check passed successfully' : 'Click the box to verify you are not a robot'}
              </p>
            </div>
          </div>

          {/* Right: Security Badge / Brand Logo */}
          <div className="flex flex-col items-end shrink-0 pl-2 border-l border-white/10">
            <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="tracking-tight">Bot Defense</span>
            </div>
            <span className="text-[9px] text-white/40 font-mono mt-0.5">LeafDex Shield</span>
          </div>
        </div>

        {/* Interactive Challenge Popup if clicked */}
        {showChallenge && !isVerified && (
          <div
            id={`${idPrefix}-challenge-modal`}
            className="mt-3 pt-3 border-t border-white/15 animate-in fade-in slide-in-from-top-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {activeChallenge.label}
              </span>
              <button
                type="button"
                onClick={handleReset}
                title="Get another challenge"
                className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {challengeError && (
              <p className="text-[10px] text-rose-300 font-medium mb-1.5">
                Incorrect choice. Trying another challenge...
              </p>
            )}

            <div className="grid grid-cols-4 gap-2">
              {activeChallenge.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className="h-10 text-xl bg-white/10 hover:bg-emerald-500/25 active:bg-emerald-500/40 border border-white/15 hover:border-emerald-400/60 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasError && !isVerified && (
        <p className="text-[10px] text-rose-300 mt-1 pl-1 flex items-center gap-1">
          <span>⚠️ Please complete the &quot;Are you a Human?&quot; check before proceeding.</span>
        </p>
      )}
    </div>
  );
};
