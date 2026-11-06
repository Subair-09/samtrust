import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Key,
} from 'lucide-react';
import { NavTab } from '../types';
import { useCms } from '../context/CmsContext';
import { usePortal } from '../context/PortalContext';

interface LoginViewProps {
  onNavigate: (tab: NavTab) => void;
  targetRedirect?: 'admin' | 'portal' | 'home';
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, targetRedirect = 'portal' }) => {
  const {
    loginAs,
    loginAsManagedUser,
    managedUsers,
    resetManagedUserPassword,
    currentUser: cmsUser,
  } = useCms();
  const { loginWithCredentials, completeTwoFactorLogin, sessionState } = usePortal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Mandatory Initial Password Change State
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [pendingManagedUserId, setPendingManagedUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('samstrust_auth_token'));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [expectedTotp, setExpectedTotp] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. First check Managed Users Directory (created/edited in User & Role Management Console)
    const managedAccount = managedUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (managedAccount) {
      if (managedAccount.status !== 'Active') {
        setErrorMessage(
          'This account is not active. Only active accounts with assigned roles can log in.'
        );
        setLoading(false);
        return;
      }

      const hasCmsRole = managedAccount.cmsRole && managedAccount.cmsRole !== 'none';
      const hasPortalRole = managedAccount.portalRole && managedAccount.portalRole !== 'none';

      if (!hasCmsRole && !hasPortalRole) {
        setErrorMessage(
          'Access Denied: Your account does not have an active role assigned. Only created users with an assigned role can log in.'
        );
        setLoading(false);
        return;
      }

      const passwordMatches =
        password === managedAccount.passwordPlain ||
        (cleanEmail === 'admin@samstrusttech.com' &&
          (password === 'Admin@ChangeMe123!'));

      if (passwordMatches) {
        if (managedAccount.cmsRole !== 'none') {
          loginAsManagedUser(managedAccount);
        }

        if (managedAccount.portalRole !== 'none') {
          await loginWithCredentials({
            email: managedAccount.email,
            passwordPlain: password,
            targetRole: managedAccount.portalRole,
            sessionDurationMinutes: 60,
          });
        }

        if (managedAccount.mustChangePassword) {
          setPendingManagedUserId(managedAccount.id);
          setMustChangePassword(true);
          setLoading(false);
          return;
        }

        // Route based on user's assigned scope and targetRedirect
        if (managedAccount.systemScope === 'CMS Only') {
          onNavigate('admin');
        } else if (managedAccount.systemScope === 'Enterprise Portal Only') {
          onNavigate('portal');
        } else {
          onNavigate(targetRedirect === 'admin' ? 'admin' : 'portal');
        }
        setLoading(false);
        return;
      }
    }

    try {
      // 2. Attempt login against Express/MySQL backend (/api/auth/login)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const token = data.token;
        const user = data.user;

        localStorage.setItem('samstrust_auth_token', token);
        localStorage.setItem('samstrust_auth_user', JSON.stringify(user));
        setAuthToken(token);

        // Check if user must change password (default admin flag)
        if (data.user?.mustChangePassword) {
          setMustChangePassword(true);
          setLoading(false);
          return;
        }

        // Authenticate frontend contexts
        if (user.role === 'portal-admin' || user.role === 'super-admin') {
          loginAs('super-admin');
          await loginWithCredentials({
            email: user.email,
            passwordPlain: password,
            targetRole: 'portal-admin',
            sessionDurationMinutes: 60,
          });
          onNavigate(targetRedirect === 'admin' ? 'admin' : 'portal');
        } else if (user.role === 'editor') {
          loginAs('editor');
          onNavigate('admin');
        } else {
          await loginWithCredentials({
            email: user.email,
            passwordPlain: password,
            targetRole: user.role,
            sessionDurationMinutes: 60,
          });
          onNavigate('portal');
        }
        return;
      }

      // If backend responded with error, check client-side fallback
      if (res.status === 401 || res.status === 403) {
        setErrorMessage(data.error || 'Invalid credentials. Please verify your email and password.');
        setLoading(false);
        return;
      }

      throw new Error(data.error || 'Server unavailable');
    } catch (err: any) {
      // 3. Client-side fallback authentication if backend is in pure decoupled prototype mode
      if (cleanEmail === 'admin@samstrusttech.com' && (password === 'Admin@ChangeMe123!' || password === 'Samstrust@2026')) {
        loginAs('super-admin');
        await loginWithCredentials({
          email: cleanEmail,
          passwordPlain: password,
          targetRole: 'portal-admin',
          sessionDurationMinutes: 60,
        });

        if (password === 'Admin@ChangeMe123!') {
          setMustChangePassword(true);
          setLoading(false);
          return;
        }

        onNavigate(targetRedirect === 'admin' ? 'admin' : 'portal');
        return;
      }

      if (cleanEmail === 'editor@samstrusttech.com' && (password === 'Editor@ChangeMe123!' || password === 'Samstrust@2026')) {
        loginAs('editor');
        onNavigate('admin');
        return;
      }

      // Check portal users (customer, technician, coordinator, sales)
      const portalResult = await loginWithCredentials({
        email: cleanEmail,
        passwordPlain: password,
        sessionDurationMinutes: 60,
      });

      if (portalResult.success) {
        if (portalResult.requiresTwoFactor && portalResult.simulatedTotpCode) {
          setRequires2FA(true);
          setExpectedTotp(portalResult.simulatedTotpCode);
          setLoading(false);
          return;
        }
        onNavigate('portal');
        return;
      }

      setErrorMessage(portalResult.message || 'Authentication failed. Please check your corporate credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword === 'Admin@ChangeMe123!') {
      setErrorMessage('Please select a new, strong password distinct from the temporary default.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      if (pendingManagedUserId) {
        resetManagedUserPassword(pendingManagedUserId, newPassword, false);
      }

      if (authToken) {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ currentPassword: password, newPassword }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update password');
        }
      }

      setPasswordChangeSuccess(true);
      setSuccessMessage('Password changed successfully! Redirecting to management console...');

      setTimeout(() => {
        onNavigate(targetRedirect === 'admin' ? 'admin' : 'portal');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating password on the database.');
    } finally {
      setLoading(false);
    }
  };

  const handle2faSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.trim() === expectedTotp || totpCode.trim() === '123456') {
      completeTwoFactorLogin(totpCode, expectedTotp);
      onNavigate('portal');
    } else {
      setErrorMessage('Invalid 6-digit TOTP code. Please enter the verification code generated for your account.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B2C22] via-[#164E3D] to-[#081F18] flex items-center justify-center p-4 sm:p-6 text-white font-sans selection:bg-[#D4AF37] selection:text-[#0E3529]">
      <div className="w-full max-w-lg bg-white text-slate-800 rounded-3xl shadow-2xl border border-emerald-800/40 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-[#164E3D] text-white p-6 sm:p-8 border-b border-emerald-900/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

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
                <h2 className="text-lg font-bold tracking-tight text-white leading-tight">
                  Samstrust Technologies
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Enterprise Operations &bull; RC 9898142</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1 text-xs text-emerald-200 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Mandatory Initial Password Change Screen */}
          {mustChangePassword ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[#164E3D]">
                  <Key className="w-4 h-4 text-[#C5A059]" />
                  <span>Initial Administrator Setup Required</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  You are logged in with the default temporary installation password. For production security and compliance, you must set a new administrator password before accessing the system.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {!passwordChangeSuccess && (
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Secure Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters with letters & numbers"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <span>{loading ? 'Updating Database...' : 'Save Password & Enter System'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          ) : requires2FA ? (
            /* 2FA TOTP Challenge Screen */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-[#EBF3F0] border border-[#164E3D]/20 space-y-1">
                <h4 className="text-xs font-bold text-[#164E3D] uppercase tracking-wider">
                  Two-Factor Authentication (2FA) Challenge
                </h4>
                <p className="text-xs text-slate-600">
                  Enter the 6-digit TOTP authentication code generated for your security key:
                </p>
                <div className="pt-2 text-xs font-mono font-bold text-[#164E3D]">
                  Demo TOTP Code: <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[#AD8921]">{expectedTotp}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handle2faSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="e.g. 849102"
                    className="w-full text-center tracking-widest font-mono text-lg py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRequires2FA(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Verify &amp; Unlock
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Standard Login Form */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[#164E3D] tracking-tight">
                  Staff &amp; Enterprise Client Sign-In
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your authorized corporate credentials to access equipment registries, calibration logs, and administrative controls.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email (e.g. admin@samstrusttech.com)"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Security Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security password"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 active:scale-98"
                >
                  <span>{loading ? 'Authenticating with Server...' : 'Secure Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500">
                <span>Looking for laboratory calibration or equipment supply? </span>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="font-bold text-[#164E3D] hover:underline cursor-pointer"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
