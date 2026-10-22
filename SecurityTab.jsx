  import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { evaluatePassword } from '../../utils/security.js';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter.jsx';

const PasswordField = ({ label, value, onChange, visible, onToggleVisible }) => (
  <div>
    <label className="block font-semibold text-emerald-100/90 mb-1">{label}</label>
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/15 rounded-xl text-white placeholder-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
      />
      <button
        type="button"
        onClick={onToggleVisible}
        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-200/60 hover:text-white"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

export const SecurityTab = ({ token, onRefreshUser }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassStatus, setChangePassStatus] = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePassStatus(null);

    const evalResult = evaluatePassword(newPass);
    if (evalResult.score < 5) {
      setChangePassStatus({
        type: 'error',
        message: 'New password must fulfill all 5 password complexity requirements.',
      });
      return;
    }
    if (newPass !== confirmNewPass) {
      setChangePassStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setChangePassLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
          confirmNewPassword: confirmNewPass,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChangePassStatus({ type: 'success', message: data.message });
        setCurrentPass('');
        setNewPass('');
        setConfirmNewPass('');
        if (data.user) onRefreshUser(data.user);
      } else {
        setChangePassStatus({ type: 'error', message: data.message || 'Password update failed.' });
      }
    } catch (err) {
      setChangePassStatus({ type: 'error', message: 'Network connection error.' });
    } finally {
      setChangePassLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {changePassStatus && (
        <div
          className={`p-3.5 rounded-xl flex items-start gap-2.5 backdrop-blur-md ${changePassStatus.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-200'
              : 'bg-rose-500/20 border border-rose-500/50 text-rose-200'
            }`}
        >
          {changePassStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{changePassStatus.message}</span>
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-3.5">
        <PasswordField
          label="Current Password"
          value={currentPass}
          onChange={setCurrentPass}
          visible={showCurrentPass}
          onToggleVisible={() => setShowCurrentPass(!showCurrentPass)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PasswordField
            label="New Password"
            value={newPass}
            onChange={setNewPass}
            visible={showNewPass}
            onToggleVisible={() => setShowNewPass(!showNewPass)}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmNewPass}
            onChange={setConfirmNewPass}
            visible={showConfirmNewPass}
            onToggleVisible={() => setShowConfirmNewPass(!showConfirmNewPass)}
          />
        </div>

        <PasswordStrengthMeter password={newPass} />

        <button
          type="submit"
          disabled={changePassLoading}
          className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl shadow-md hover:brightness-110 cursor-pointer disabled:opacity-50"
        >
          {changePassLoading ? 'Updating Password...' : 'Save New Password'}
        </button>
      </form>
    </div>
  );
};
