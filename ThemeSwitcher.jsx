import React, { useState } from 'react';
import { Moon, Trees, Palette } from 'lucide-react';

export const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    {
      id: 'dark',
      label: 'Midnight Dark',
      icon: <Moon className="w-4 h-4 text-indigo-300" />,
      desc: 'Obsidian & Slate',
    },
    {
      id: 'forest',
      label: 'Emerald Forest',
      icon: <Trees className="w-4 h-4 text-emerald-300" />,
      desc: 'Deep Glassmorphic',
    },
  ];

  const currentOption = themeOptions.find((t) => t.id === currentTheme) || themeOptions[0];

  // Quick toggle helper between Dark and Forest
  const handleNextTheme = () => {
    onThemeChange(currentTheme === 'dark' ? 'forest' : 'dark');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start font-sans select-none">
      {/* Expanded Palette Menu */}
      {isOpen && (
        <div className="mb-2 p-2 bg-black/70 dark:bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-1 w-48 animate-in fade-in slide-in-from-bottom-2">
          <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-emerald-300/80 flex items-center justify-between border-b border-white/10 pb-1.5 mb-0.5">
            <span>Select Theme</span>
            <Palette className="w-3 h-3 text-emerald-400" />
          </div>
          {themeOptions.map((opt) => {
            const isSelected = currentTheme === opt.id;
            return (
              <button
                key={opt.id}
                id={`theme-select-${opt.id}`}
                onClick={() => {
                  onThemeChange(opt.id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white border border-emerald-400/40 shadow-sm'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="p-1 rounded-lg bg-white/10">{opt.icon}</div>
                <div className="flex flex-col leading-tight">
                  <span>{opt.label}</span>
                  <span className="text-[10px] text-emerald-200/60 font-normal">{opt.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Switch Pill in Bottom Left */}
      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xl border border-white/20 p-1.5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        {/* Quick Click Toggle */}
        <button
          id="btn-toggle-dark-theme"
          onClick={handleNextTheme}
          title="Toggle Theme Mode"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/15 text-white text-xs font-medium border border-white/15 transition-colors"
        >
          {currentOption.icon}
          <span className="text-xs font-semibold whitespace-nowrap">{currentOption.label}</span>
        </button>

        {/* Switch Selector Popout Trigger */}
        <button
          id="btn-theme-menu-trigger"
          onClick={() => setIsOpen(!isOpen)}
          title="Choose Theme Preset"
          aria-label="Theme menu"
          className={`p-1.5 rounded-xl border transition-all ${
            isOpen
              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
              : 'bg-white/[0.05] hover:bg-white/15 border-white/15 text-emerald-200 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
