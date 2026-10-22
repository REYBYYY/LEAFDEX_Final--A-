import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trash2, Leaf, CalendarDays, Stethoscope, FlaskConical, Inbox } from 'lucide-react';

const SAVED_SCANS_KEY = 'savedScans';

const loadScans = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_SCANS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const SavedScans = ({ onBack }) => {
  const [scans, setScans] = useState(() => loadScans());

  // Re-read on mount/focus so saves made in the scanner are picked up
  useEffect(() => {
    setScans(loadScans());
    const sync = () => setScans(loadScans());
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  const handleDelete = (id) => {
    const next = scans.filter((s) => s.id !== id);
    setScans(next);
    localStorage.setItem(SAVED_SCANS_KEY, JSON.stringify(next));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 backdrop-blur-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Main Page</span>
        </button>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          Saved Scans
        </h2>
      </div>

      {/* Empty State */}
      {scans.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-3">
          <Inbox className="w-10 h-10 text-emerald-400/60 mx-auto" />
          <p className="text-slate-300 font-semibold">No saved scans yet</p>
          <p className="text-xs text-slate-400">
            Scan a plant in the scanner and save it to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scans.map((scan, idx) => (
            <motion.div
              key={scan.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/15 shadow-lg flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{scan.emoji || '🌱'}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {scan.plantName || scan.commonName || 'Unknown Plant'}
                    </h3>
                    {scan.scientificName && (
                      <p className="text-[10px] italic text-emerald-200/70">{scan.scientificName}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(scan.id)}
                  title="Delete saved scan"
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <p className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold">{scan.diseaseStatus || 'Unknown'}</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-slate-400">Treatment:</span>
                  <span>{scan.treatment || 'No treatment recorded'}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">Saved:</span>
                  <span className="font-mono">
                    {scan.savedAt ? new Date(scan.savedAt).toLocaleString() : 'Unknown date'}
                  </span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
