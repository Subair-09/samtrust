import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { CmsRole } from '../../types/cms';
import { ShieldCheck, Lock, UserCheck, ArrowRight, Shield, Award, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onBackToPublicSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPublicSite }) => {
  const { loginAs } = useCms();
  const [selectedRole, setSelectedRole] = useState<CmsRole>('super-admin');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleRolePreset = (role: CmsRole, email: string) => {
    setSelectedRole(role);
    setEmailInput(email);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E3529] via-[#164E3D] to-[#0A261D] flex items-center justify-center p-4 sm:p-6 text-white font-sans">
      <div className="w-full max-w-lg bg-white text-slate-800 rounded-3xl shadow-2xl border border-emerald-800/40 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header */}
        <div className="bg-[#164E3D] text-white p-6 sm:p-8 border-b border-emerald-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 p-2 flex items-center justify-center">
                <img
                  src="/assets/aistudio/favicon_d10ca84b.jfif"
                  alt="Samstrust Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Samstrust Technologies</h2>
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Administrative CMS &bull; RC 9898142</span>
                </div>
              </div>
            </div>

            <button
              onClick={onBackToPublicSite}
              className="text-xs text-emerald-200 hover:text-white underline cursor-pointer"
            >
              Public Site &rarr;
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#164E3D]">Portal Authentication &amp; RBAC</h3>
            <p className="text-xs text-slate-500">
              Sign in to manage hero slides, inventory products, service FAQs, and review sales RFQs.
            </p>
          </div>

          {/* Quick Persona Role Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Select Demo Access Role:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRolePreset('super-admin', 'superadmin@samstrusttech.com')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'super-admin'
                    ? 'bg-[#164E3D] text-white border-[#164E3D] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Shield className="w-4 h-4 mx-auto mb-1 text-[#D4AF37]" />
                <span className="text-xs font-bold block">Super Admin</span>
                <span className="text-[10px] block opacity-75">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleRolePreset('editor', 'editor@samstrusttech.com')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'editor'
                    ? 'bg-[#164E3D] text-white border-[#164E3D] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Award className="w-4 h-4 mx-auto mb-1 text-[#D4AF37]" />
                <span className="text-xs font-bold block">Editor</span>
                <span className="text-[10px] block opacity-75">Content &amp; Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => handleRolePreset('sales-reviewer', 'sales@samstrusttech.com')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === 'sales-reviewer'
                    ? 'bg-[#164E3D] text-white border-[#164E3D] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <UserCheck className="w-4 h-4 mx-auto mb-1 text-[#D4AF37]" />
                <span className="text-xs font-bold block">Sales Review</span>
                <span className="text-[10px] block opacity-75">RFQ Pipeline</span>
              </button>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Staff Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Security Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Staff CMS Portal</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
            Protected internal area under Samstrust Technologies Limited IT Security Policy.
          </div>
        </div>
      </div>
    </div>
  );
};
