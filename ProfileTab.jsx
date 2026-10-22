import React from 'react';
import { ShieldCheck, Calendar, Phone, MapPin } from 'lucide-react';

const formatPhone = (phone) => {
  if (phone?.startsWith('+')) return phone;
  if (phone?.startsWith('63')) return `+${phone}`;
  return phone;
};

export const ProfileTab = ({ currentUser }) => (
  <div className="space-y-4 text-xs">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
        <span className="text-slate-400 text-[11px] block">Full Name</span>
        <span className="font-semibold text-white text-sm mt-0.5 block">{currentUser.fullName}</span>
      </div>

      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
        <span className="text-slate-400 text-[11px] block">Email (Username)</span>
        <span className="font-semibold text-white text-sm mt-0.5 block">{currentUser.email}</span>
      </div>

      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
        <span className="text-slate-400 text-[11px] block flex items-center gap-1">
          <Calendar className="w-3 h-3 text-emerald-400" /> Date of Birth
        </span>
        <span className="font-semibold text-white mt-0.5 block">{currentUser.birthday}</span>
      </div>

      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
        <span className="text-slate-400 text-[11px] block flex items-center gap-1">
          <Phone className="w-3 h-3 text-emerald-400" /> Phone Number
        </span>
        <span className="font-semibold text-white mt-0.5 block">{formatPhone(currentUser.mobilePhone)}</span>
      </div>
    </div>

    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
      <span className="text-slate-400 text-[11px] block flex items-center gap-1">
        <MapPin className="w-3 h-3 text-emerald-400" /> Home / Farm Address
      </span>
      <span className="font-semibold text-white mt-0.5 block">{currentUser.address}</span>
    </div>

    <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
      <div>
        <span className="text-emerald-300 font-bold block">Account Status: Active &amp; Verified</span>
        <span className="text-slate-300 text-[11px]">Member since {new Date(currentUser.createdAt).toLocaleDateString()}</span>
      </div>
      <ShieldCheck className="w-6 h-6 text-emerald-400" />
    </div>
  </div>
);
