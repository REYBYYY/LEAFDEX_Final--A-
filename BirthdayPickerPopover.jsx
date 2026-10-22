import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Maximum allowed birthdate for 18+ policy: Dec 31, 2007
const MAX_ALLOWED_YEAR = 2007;
const MIN_ALLOWED_YEAR = 1930;
const YEARS_PER_PAGE = 12;

export const BirthdayPickerPopover = ({
  isOpen,
  onClose,
  selectedMonth,
  selectedDay,
  selectedYear,
  onSelectDate,
}) => {
  const popoverRef = useRef(null);

  const initialYear = parseInt(selectedYear, 10) || 2000;
  const initialMonth = parseInt(selectedMonth, 10) ? parseInt(selectedMonth, 10) - 1 : 0;
  const initialDay = parseInt(selectedDay, 10) || 1;

  // Start with Year selection first
  const [viewMode, setViewMode] = useState('years');
  const [currentYear, setCurrentYear] = useState(Math.min(initialYear, MAX_ALLOWED_YEAR));
  const [currentMonth, setCurrentMonth] = useState(Math.max(0, Math.min(11, initialMonth)));
  const [tempDay, setTempDay] = useState(initialDay);
  const [decadeStart, setDecadeStart] = useState(Math.floor(initialYear / YEARS_PER_PAGE) * YEARS_PER_PAGE);

  // Sync state and reset to Year view whenever opened
  useEffect(() => {
    if (isOpen) {
      const y = parseInt(selectedYear, 10) || 2000;
      const m = parseInt(selectedMonth, 10) ? parseInt(selectedMonth, 10) - 1 : 0;
      const d = parseInt(selectedDay, 10) || 1;
      setCurrentYear(Math.min(y, MAX_ALLOWED_YEAR));
      setCurrentMonth(Math.max(0, Math.min(11, m)));
      setTempDay(d);
      setDecadeStart(Math.floor(Math.min(y, MAX_ALLOWED_YEAR) / YEARS_PER_PAGE) * YEARS_PER_PAGE);
      // Flow starts with Year first
      setViewMode('years');
    }
  }, [isOpen, selectedYear, selectedMonth, selectedDay]);

  // Click outside and Escape key listeners
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Month navigation in Day view
  const prevMonth = () => {
    if (currentMonth === 0) {
      if (currentYear > MIN_ALLOWED_YEAR) {
        setCurrentYear((prev) => prev - 1);
        setCurrentMonth(11);
      }
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      if (currentYear < MAX_ALLOWED_YEAR) {
        setCurrentYear((prev) => prev + 1);
        setCurrentMonth(0);
      }
    } else {
      if (currentYear < MAX_ALLOWED_YEAR || currentMonth < 11) {
        setCurrentMonth((prev) => prev + 1);
      }
    }
  };

  // Generate calendar days for currentMonth & currentYear
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth === 0 ? 11 : currentMonth - 1);

  // Construct calendar cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isNextMonth: false,
      isPrevMonth: true,
      disabled: true,
    });
  }

  // Current month active days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const isFutureRestricted = currentYear > MAX_ALLOWED_YEAR;
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      isNextMonth: false,
      isPrevMonth: false,
      disabled: isFutureRestricted,
    });
  }

  // Next month leading days to complete grid
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= (remainingCells >= 7 ? remainingCells - 7 : remainingCells); d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      isNextMonth: true,
      isPrevMonth: false,
      disabled: true,
    });
  }

  // Step 3: Select Day -> finalize date & close
  const handleSelectDay = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const formattedYear = String(currentYear);
    onSelectDate(formattedMonth, formattedDay, formattedYear);
    onClose();
  };

  // Step 1: Select Year -> auto-advance to Month view
  const handleSelectYear = (yr) => {
    setCurrentYear(yr);
    setViewMode('months');
  };

  // Step 2: Select Month -> auto-advance to Day view
  const handleSelectMonth = (monthIdx) => {
    setCurrentMonth(monthIdx);
    setViewMode('days');
  };

  // Calculate age preview
  const calculatedAge = 2026 - currentYear;

  // Years for the year selection grid (pages of 12)
  const yearGrid = [];
  const startY = Math.max(MIN_ALLOWED_YEAR, decadeStart);
  const endY = Math.min(MAX_ALLOWED_YEAR, decadeStart + YEARS_PER_PAGE - 1);
  for (let y = startY; y <= endY; y++) {
    yearGrid.push(y);
  }

  return (
    <div
      ref={popoverRef}
      id="birthday-calendar-popover"
      className="absolute top-full right-0 mt-2 z-50 w-80 sm:w-88 bg-slate-900/95 border border-emerald-500/30 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl p-4 text-white animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* Header with Step Indicator & Switchers */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          {/* Step 1: Year Switcher */}
          <button
            type="button"
            onClick={() => {
              setDecadeStart(Math.floor(currentYear / YEARS_PER_PAGE) * YEARS_PER_PAGE);
              setViewMode('years');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 ${
              viewMode === 'years'
                ? 'bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-300/50'
                : 'bg-white/10 hover:bg-white/15 text-emerald-200'
            }`}
            title="Step 1: Select Year"
          >
            <span>{currentYear}</span>
          </button>

          {/* Step 2: Month Switcher */}
          <button
            type="button"
            onClick={() => setViewMode('months')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'months'
                ? 'bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-300/50'
                : 'bg-white/10 hover:bg-white/15 text-emerald-200'
            }`}
            title="Step 2: Select Month"
          >
            <span>{MONTH_SHORT[currentMonth]}</span>
          </button>

          {/* Step 3: Day indicator/tab */}
          <button
            type="button"
            onClick={() => setViewMode('days')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              viewMode === 'days'
                ? 'bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-300/50'
                : 'bg-white/10 hover:bg-white/15 text-emerald-200'
            }`}
            title="Step 3: Select Day"
          >
            <span>Day</span>
          </button>
        </div>

        {/* View Controls & Close */}
        <div className="flex items-center gap-1">
          {viewMode === 'days' && (
            <>
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-emerald-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                disabled={currentYear === MAX_ALLOWED_YEAR && currentMonth === 11}
                aria-label="Next month"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-emerald-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {viewMode === 'years' && (
            <>
              <button
                type="button"
                onClick={() => setDecadeStart((prev) => Math.max(MIN_ALLOWED_YEAR, prev - YEARS_PER_PAGE))}
                disabled={decadeStart <= MIN_ALLOWED_YEAR}
                aria-label="Earlier years"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-emerald-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDecadeStart((prev) => Math.min(MAX_ALLOWED_YEAR - 11, prev + YEARS_PER_PAGE))}
                disabled={decadeStart + YEARS_PER_PAGE > MAX_ALLOWED_YEAR}
                aria-label="Later years"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-emerald-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close calendar"
            className="p-1.5 ml-1 rounded-lg bg-white/5 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STEP 1: YEAR SELECTION GRID (Shown first) */}
      {viewMode === 'years' && (
        <div className="py-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
              <span>1️⃣</span> Select Birth Year:
            </p>
            <span className="text-[10px] text-emerald-200/60 font-mono">
              {startY} – {endY}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {yearGrid.map((yr) => {
              const isCurrent = currentYear === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => handleSelectYear(yr)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105 ring-2 ring-emerald-300'
                      : 'bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-emerald-100'
                  }`}
                >
                  {yr}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: MONTH SELECTION GRID (Shown after year) */}
      {viewMode === 'months' && (
        <div className="py-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
              <span>2️⃣</span> Select Month for <span className="font-mono underline decoration-emerald-400">{currentYear}</span>:
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTH_NAMES.map((mName, idx) => {
              const isCurrent = currentMonth === idx;
              return (
                <button
                  key={mName}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105 ring-2 ring-emerald-300'
                      : 'bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-emerald-100'
                  }`}
                >
                  {mName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: DAY GRID (Shown after month) */}
      {viewMode === 'days' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
              <span>3️⃣</span> Select Day for <span className="font-bold text-white">{MONTH_SHORT[currentMonth]} {currentYear}</span>:
            </p>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((d, i) => (
              <span key={d} className={`text-[10px] font-bold ${i === 0 || i === 6 ? 'text-emerald-400' : 'text-emerald-100/60'}`}>
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              const isSelected =
                cell.isCurrentMonth &&
                cell.day === tempDay &&
                currentMonth === (parseInt(selectedMonth, 10) - 1) &&
                currentYear === parseInt(selectedYear, 10);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => cell.isCurrentMonth && handleSelectDay(cell.day)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    cell.disabled
                      ? 'text-white/15 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-500 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-105'
                      : cell.isCurrentMonth
                      ? 'text-white hover:bg-emerald-500/20 hover:text-emerald-300'
                      : 'text-white/20'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clean Selected Date Preview Footer */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
        <span className="text-emerald-100/70 font-mono flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
          {String(currentMonth + 1).padStart(2, '0')}/{String(tempDay).padStart(2, '0')}/{currentYear}
        </span>
        <span className="text-emerald-300 font-medium">
          Age ~{calculatedAge} yrs (18+ Eligible)
        </span>
      </div>
    </div>
  );
};
