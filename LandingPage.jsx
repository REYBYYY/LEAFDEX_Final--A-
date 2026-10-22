import React, { useState } from 'react';
import {
  Leaf,
  Scan,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  BarChart3,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileImage,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Database,
  Lock,
  UserCheck,
  HeartPulse,
  Microscope,
  Info,
  Camera,
  Sun,
  Droplets,
  Thermometer,
  ShieldAlert,
  Stethoscope,
  Heart,
  PawPrint,
  FileSearch,
  KeyRound,
  Users,
  History,
  Timer,
  Sprout
} from 'lucide-react';

// Color treatments for feature card icons, keyed by `accent`.
const ACCENT_STYLES = {
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
  teal: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
};

// ---------------------------------------------------------------------------
// Read-only feature catalogue for the pre-login front page.
// This is purely descriptive — guests cannot run any scan until they sign in.
// ---------------------------------------------------------------------------
const CORE_FEATURES = [
  {
    icon: Scan,
    accent: 'emerald',
    title: 'AI Plant Identification',
    tagline: 'Species recognition in seconds',
    summary:
      'Point a phone camera at any leaf or upload a photo. LeafDex matches vein patterns, margins, and texture to name the exact species, genus, and botanical family.',
    points: [
      'Camera capture or photo upload',
      'Scientific + common name, family',
      'Confidence-scored match report',
    ],
    locked: 'Live scanning unlocks after sign in',
  },
  {
    icon: Stethoscope,
    accent: 'rose',
    title: 'Disease & Issue Diagnosis',
    tagline: 'Catch problems early',
    summary:
      'The deep-learning model flags blight, rust, powdery mildew, pest damage, nutrient deficiencies, and overwatering stress — each with a severity estimate.',
    points: [
      'Health status + issue breakdown',
      'Foliar severity percentage',
      'Plain-language what-went-wrong notes',
    ],
    locked: 'Diagnosis reports unlock after sign in',
  },
  {
    icon: Heart,
    accent: 'teal',
    title: 'Healing & Medicinal Uses',
    tagline: 'Pharmacognosy built in',
    summary:
      'Beyond the plant name, LeafDex profiles traditional and scientific therapeutic value — from wound healing and burns to herbal teas and household wellness.',
    points: [
      'Wound healing & remedy profiles',
      'Household & wellness benefits',
      'Backed by a curated botanical database',
    ],
    locked: 'Medicinal profiles unlock after sign in',
  },
  {
    icon: PawPrint,
    accent: 'amber',
    title: 'Pet & Toxicity Safety',
    tagline: 'Know before your pet nibbles',
    summary:
      'Instant dog and cat safety checks that flag toxic saponins, oxalates, and aloin, or confirm safe, non-toxic foliage for pet owners.',
    points: [
      'Dog & cat toxicity verdicts',
      'Toxin explanation per species',
      'Pet-safe alternative guidance',
    ],
    locked: 'Toxicity checks unlock after sign in',
  },
  {
    icon: Droplets,
    accent: 'cyan',
    title: 'Care & Cultivation Plans',
    tagline: 'Keep every plant thriving',
    summary:
      'Every diagnosis ships with tailored agronomic guidance so you know exactly how to keep the plant healthy once you know what it is.',
    points: [
      'Sunlight, watering, soil & pH',
      'Temperature ranges and warnings',
      'Step-by-step treatment protocols',
    ],
    locked: 'Care plans unlock after sign in',
  },
  {
    icon: ShieldCheck,
    accent: 'emerald',
    title: 'Secure Accounts & Roles',
    tagline: 'Built for teams, not just hobbyists',
    summary:
      'Role-based access for Super Admins, Admins, and standard users — with the security hardening you would expect from an enterprise portal.',
    points: [
      'Email OTP verification on signup',
      'Bot-defense & brute-force lockout',
      'Auto-logout on inactivity',
    ],
    locked: 'Account features apply once you register',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Camera,
    title: 'Capture the specimen',
    body:
      'Open the scanner and either shoot a live photo with your phone camera or upload an existing image from your gallery. A single, well-lit leaf is enough — no lab equipment required.',
    detail: 'Video preview, snapshot capture, file upload, and a preset sample gallery are all built into the scanning studio.',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'The vision model analyzes it',
    body:
      'A hybrid ResNet-50 + Vision Transformer backbone, trained on 54,000+ benchmark foliar specimens, classifies the image and looks for disease signatures, nutrient stress, and pest damage in one pass.',
    detail: 'Classic CNN feature extraction is combined with ViT attention to catch both texture-level and pattern-level cues.',
  },
  {
    step: '03',
    icon: FileSearch,
    title: 'You get a full diagnosis',
    body:
      'The result is a structured intelligence report: species name, confidence match, health status, severity, medicinal uses, pet toxicity verdict, and a prescribed treatment protocol — all in one card.',
    detail: 'Filter the report by Care & Needs, Healing & Uses, Pet Toxicity, or Treatment Plan to see exactly what matters to you.',
  },
  {
    step: '04',
    icon: Sprout,
    title: 'Act with confidence',
    body:
      'Use the care plan to adjust watering, sunlight, and soil, apply the treatment steps, and verify pet safety — turning a single photo into an actionable gardening decision.',
    detail: 'Re-analyze anytime as your plant recovers to track how the diagnosis changes over time.',
  },
];

const SECURITY_FEATURES = [
  { icon: KeyRound, label: 'Email OTP verification' },
  { icon: Users, label: 'Role-based access (Super Admin / Admin / User)' },
  { icon: ShieldAlert, label: 'Brute-force lockout protection' },
  { icon: Timer, label: 'Auto-logout on inactivity' },
  { icon: Lock, label: 'bcrypt-hashed password storage' },
  { icon: History, label: 'Full audit log trail' },
];

export const LandingPage = ({ onOpenLogin, onOpenRegister, currentUser, onOpenDashboard }) => {
  const [expandedStep, setExpandedStep] = useState(0);

  return (
    <div className="w-full text-slate-100 relative">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-300/40">
              <Leaf className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">LeafDex</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  AI v3.4 Deep Learning
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/70 hidden sm:block">
                Image-Based Plant Identification &amp; Classification
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={onOpenDashboard}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Open Dashboard ({currentUser.fullName.split(' ')[0]})</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">


        {/* Hero Section (read-only preview) */}
        <section className="text-center max-w-3xl mx-auto pt-6 sm:pt-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deep Learning Botanical Classifier &amp; Pharmacognosy Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Identify any plant and&#8209; diagnose it from a{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              single photo
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            LeafDex pairs species identification with disease diagnosis, medicinal use profiles,
            pet toxicity safety, and tailored care plans — all from one leaf image.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {currentUser ? (
              <button
                onClick={onOpenDashboard}
                className="px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Open Dashboard</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenRegister}
                  className="px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenLogin}
                  className="px-6 py-3 rounded-2xl text-sm font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border-white/15 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Sign In to Scan</span>
                </button>
              </>
            )}
          </div>

          <p className="text-[11px] text-emerald-200/60 flex items-center justify-center gap-1.5 pt-1">
            <Info className="w-3 h-3" />
            The live scanner is available inside your account — sign in to start analyzing plants.
          </p>
        </section>

        {/* Core Features Grid */}
        <section>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Everything You Get With an Account</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Features at a Glance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              A quick tour of what LeafDex does once you are signed in — no scanning happens until then.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CORE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-5 rounded-2xl bg-white/[0.04] border-white/10 backdrop-blur-xl flex-col transition-all hover:bg-white/[0.07] hover:border-emerald-400/30"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${ACCENT_STYLES[feature.accent]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-300/70">
                    {feature.tagline}
                  </span>
                  <h3 className="text-sm font-bold text-white mb-1.5 mt-0.5">{feature.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{feature.summary}</p>

                  <ul className="mt-3 space-y-1.5">
                    {feature.points.map((point) => (
                      <li key={point} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-emerald-200/60">
                    <Lock className="w-3 h-3" />
                    <span>{feature.locked}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works — expandable pipeline */}
        <section className="pt-10 border-t border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Stage Vision &amp; Diagnosis Pipeline</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              How LeafDex Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Four steps turn a single photo into an actionable plant health report. Tap a step to expand it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* Step accordion */}
            <div className="space-y-3">
              {HOW_IT_WORKS.map((item, idx) => {
                const Icon = item.icon;
                const isOpen = expandedStep === idx;
                return (
                  <div
                    key={item.step}
                    className={`rounded-2xl border backdrop-blur-xl transition-all ${
                      isOpen ? 'bg-white/[0.07] border-emerald-400/40' : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedStep(isOpen ? -1 : idx)}
                      className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
                    >
                      <span className="text-xs font-mono font-bold text-emerald-300 w-7 shrink-0">{item.step}</span>
                      <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 text-sm font-bold text-white">{item.title}</span>
                      <ChevronDown className={`w-4 h-4 text-emerald-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pl-[4.5rem] space-y-2">
                        <p className="text-xs text-slate-300 leading-relaxed">{item.body}</p>
                        <p className="text-[11px] text-emerald-200/70 leading-relaxed flex items-start gap-1.5">
                          <Info className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{item.detail}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Static preview panel (clearly marked as a preview, not usable) */}
            <div className="relative rounded-3xl bg-slate-900/80 border-white/15 p-6 backdrop-blur-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Scan className="w-4 h-4 text-emerald-400" />
                  Sample Diagnosis Report
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border-amber-400/40 text-amber-300 font-semibold">
                  Preview only
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border-emerald-400/30 flex items-center justify-center text-2xl">
                  🪴
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Aloe Vera</h3>
                  <p className="text-[11px] font-mono text-emerald-300 italic">
                    Aloe barbadensis miller &bull; Family: Asphodelaceae
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                    99.4% AI Match
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                    Healthy
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] border-white/10 flex items-start gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">Bright indirect sunlight, 6+ hours daily</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] border-white/10 flex items-start gap-2">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">Deep watering every 2–3 weeks; let soil dry fully</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/40 border-emerald-500/30 flex items-start gap-2">
                  <Heart className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-slate-200">
                    <strong className="text-emerald-300">Healing:</strong> accelerates collagen synthesis — excellent for burns and minor cuts.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/30 border-rose-500/40 flex items-start gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                  <span className="text-slate-200">
                    <strong className="text-rose-300">Pet safety:</strong> Toxic to dogs &amp; cats — contains aloin and saponins.
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10">
                <button
                  onClick={onOpenLogin}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In to Run a Real Scan</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Account Features */}
        <section className="pt-10 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure by Design</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
                An account you can trust
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                LeafDex is more than a scanner — it is a full authentication and user-management
                portal, so your plant data and account stay protected.
              </p>
            </div>

            <div className="lg:col-span-2 grid-cols-1 sm:grid-cols-2 gap-3">
              {SECURITY_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.label}
                    className="p-3.5 rounded-2xl bg-white/[0.04] border-white/10 backdrop-blur-xl flex items-center gap-3"
                  >
                    <span className="w-9 h-9 rounded-xl bg-emerald-500/15 border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{feature.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pt-4">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600/20 via-teal-600/10 to-emerald-600/20 border-emerald-500/30 p-8 text-center backdrop-blur-xl">
            <Sparkles className="w-6 h-6 text-emerald-300 mx-auto mb-3" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Ready to identify your first plant?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-5">
              Create a free account to unlock the live scanner, diagnosis reports, and care plans.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onOpenRegister}
                className="px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenLogin}
                className="px-6 py-3 rounded-2xl text-sm font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border-white/15 transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-white/10 bg-slate-950/80 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">LeafDex AI</span> — Image-Based Plant Identification and Classification
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={onOpenLogin} className="hover:text-emerald-300 transition-colors cursor-pointer">
              Admin Login
            </button>
            <span>•</span>
            <button onClick={onOpenRegister} className="hover:text-emerald-300 transition-colors cursor-pointer">
              Create Account
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

