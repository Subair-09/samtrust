import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FlaskConical,
  Cog,
  ArrowRight,
  Smartphone,
  RefreshCw,
  Eye,
  EyeOff,
  FileCheck2,
  UserPlus,
  X,
} from 'lucide-react';
import { PortalRole } from '../../types/portal';
import { usePortal, PORTAL_USERS } from '../../context/PortalContext';
import {
  computeSaltedSha256Hash,
  validateNigerianCacNumber,
} from '../../utils/portalSecurity';

interface PortalAuthSuiteProps {
  onAuthenticated?: () => void;
  onCloseModal?: () => void;
  initialTab?: 'login' | 'onboarding' | 'reset' | '2fa';
  isModal?: boolean;
}

const FACILITY_TYPES = [
  'Pharmaceutical GMP QC Lab & Cleanroom',
  'Oil & Gas Custody Transfer Metering Terminal',
  'Food & Beverage Quality Assurance Lab',
  'Petrochemical Refinery Process Bay',
  'Clinical & Molecular Diagnostics Laboratory',
  'University / Industrial Research Institute',
];

const NIGERIAN_STATES = [
  'Lagos State',
  'Rivers State (Port Harcourt)',
  'Ogun State',
  'FCT Abuja',
  'Kano State',
  'Delta State',
  'Kaduna State',
  'Anambra State',
  'Oyo State',
  'Akwa Ibom State',
];

export const PortalAuthSuite: React.FC<PortalAuthSuiteProps> = ({
  onAuthenticated,
  onCloseModal,
  initialTab = 'login',
  isModal = false,
}) => {
  const {
    activeRole,
    companyProfile,
    loginWithCredentials,
    completeTwoFactorLogin,
    onboardNewCompany,
    activeResetToken,
    requestPasswordResetToken,
    completePasswordReset,
  } = usePortal();

  const [activeTab, setActiveTab] = useState<'login' | 'onboarding' | 'reset' | '2fa'>(
    initialTab
  );

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedRolePreset, setSelectedRolePreset] = useState<PortalRole>(activeRole);
  const [sessionTtlMinutes, setSessionTtlMinutes] = useState<number>(60);
  const [showPassword, setShowPassword] = useState(false);
  const [livePasswordHash, setLivePasswordHash] = useState<string>('');
  const [authFeedback, setAuthFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // 2FA State
  const [generatedTotp, setGeneratedTotp] = useState<string>('482910');
  const [enteredTotp, setEnteredTotp] = useState<string>('');

  // Customer Onboarding State
  const [onboardForm, setOnboardForm] = useState({
    companyName: '',
    cacRegistrationNumber: 'RC ',
    tinNumber: '',
    laboratoryFacilityType: FACILITY_TYPES[0],
    primaryFacilityAddress: '',
    state: NIGERIAN_STATES[0],
    primaryContactName: '',
    primaryContactTitle: 'Head of Quality & Metrology',
    primaryContactEmail: '',
    primaryContactPhone: '+234 ',
    whatsappNumber: '+234 ',
    passwordPlain: 'Samstrust@2026',
    enableTwoFactor: true,
  });

  // Password Reset State
  const [resetEmail, setResetEmail] = useState(companyProfile.primaryContactEmail);
  const [enteredResetToken, setEnteredResetToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('Samstrust#New2026');
  const [tokenRemainingSec, setTokenRemainingSec] = useState<number>(0);

  // Compute live Web Crypto SHA-256 preview as user types password
  useEffect(() => {
    let cancelled = false;
    computeSaltedSha256Hash(
      loginPassword || '',
      companyProfile.passwordSalt || 'SALT_BZ_2026'
    ).then((digest) => {
      if (!cancelled) {
        setLivePasswordHash(`sha256:${digest}`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loginPassword, companyProfile.passwordSalt]);

  // Update countdown for time-limited password reset token
  useEffect(() => {
    if (!activeResetToken || activeResetToken.used) {
      setTokenRemainingSec(0);
      return;
    }
    const tick = () => {
      const rem = Math.max(
        0,
        Math.floor((activeResetToken.expiresAtMs - Date.now()) / 1000)
      );
      setTokenRemainingSec(rem);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeResetToken]);

  const cacValidation = validateNigerianCacNumber(onboardForm.cacRegistrationNumber);

  // Handle Quick Role Credential Fill
  const handleSelectRolePreset = (role: PortalRole) => {
    setSelectedRolePreset(role);
    const presetUser = PORTAL_USERS[role];
    setLoginEmail(
      role === 'customer' ? companyProfile.primaryContactEmail : presetUser.email
    );
    setLoginPassword('Samstrust@2026');
    setAuthFeedback(null);
  };

  // Handle Login Form Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthFeedback(null);

    const res = await loginWithCredentials({
      email: loginEmail,
      passwordPlain: loginPassword,
      targetRole: selectedRolePreset,
      sessionDurationMinutes: sessionTtlMinutes,
    });

    if (!res.success) {
      setAuthFeedback({ type: 'error', text: res.message });
      return;
    }

    if (res.requiresTwoFactor && res.simulatedTotpCode) {
      setGeneratedTotp(res.simulatedTotpCode);
      setEnteredTotp(res.simulatedTotpCode);
      setActiveTab('2fa');
      setAuthFeedback({
        type: 'info',
        text: `Primary SHA-256 password hash verified. Enter the 6-digit 2FA TOTP code (${res.simulatedTotpCode}) to unlock your ${selectedRolePreset.toUpperCase()} session.`,
      });
      return;
    }

    setAuthFeedback({ type: 'success', text: res.message });
    if (onAuthenticated) onAuthenticated();
    if (onCloseModal) onCloseModal();
  };

  // Handle Intentional Failed Login Simulation (for Security Audit testing)
  const handleSimulateFailedAttempt = async () => {
    const res = await loginWithCredentials({
      email: loginEmail,
      passwordPlain: 'wrongpassword',
      targetRole: selectedRolePreset,
      sessionDurationMinutes: sessionTtlMinutes,
    });
    setAuthFeedback({
      type: 'error',
      text: res.message,
    });
  };

  // Handle 2FA Verification Submit
  const handleVerify2faSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = completeTwoFactorLogin(enteredTotp, generatedTotp);
    if (!ok) {
      setAuthFeedback({
        type: 'error',
        text: 'Invalid 2FA verification code. Failed 2FA challenge recorded in the immutable security audit log.',
      });
      return;
    }
    setAuthFeedback({
      type: 'success',
      text: 'Two-Factor Authentication (2FA) verified! Corporate session unlocked.',
    });
    if (onAuthenticated) onAuthenticated();
    if (onCloseModal) onCloseModal();
  };

  // Handle Customer Onboarding Submit
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cacValidation.valid) {
      setAuthFeedback({
        type: 'error',
        text: cacValidation.message,
      });
      return;
    }

    await onboardNewCompany({
      ...onboardForm,
      cacRegistrationNumber: cacValidation.normalized,
    });

    setAuthFeedback({
      type: 'success',
      text: `Company "${onboardForm.companyName}" (${cacValidation.normalized}) onboarded! Primary facility and authorized personnel provisioned.`,
    });

    setTimeout(() => {
      if (onAuthenticated) onAuthenticated();
      if (onCloseModal) onCloseModal();
    }, 900);
  };

  // Handle Request Password Reset Token
  const handleRequestToken = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenObj = requestPasswordResetToken(resetEmail);
    setEnteredResetToken(tokenObj.token);
    setAuthFeedback({
      type: 'info',
      text: `Time-limited 15-minute token [${tokenObj.token}] generated and dispatched to ${tokenObj.email}.`,
    });
  };

  // Handle Complete Password Reset
  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await completePasswordReset(enteredResetToken, newResetPassword);
    if (!res.success) {
      setAuthFeedback({ type: 'error', text: res.message });
      return;
    }
    setLoginPassword(newResetPassword);
    setAuthFeedback({
      type: 'success',
      text: `${res.message} New Digest: ${res.newHashDigest?.slice(0, 32)}...`,
    });
  };

  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 z-50 bg-[#0E3529]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto'
          : 'min-h-screen bg-[#F4F8F6] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8'
      }
    >
      <div className="max-w-4xl w-full mx-auto bg-white rounded-[22px] border border-[#E2ECE7] shadow-2xl overflow-hidden my-6">
        {/* Top Deep Forest Emerald Identity Header */}
        <div className="bg-[#164E3D] text-white p-6 sm:p-8 border-b border-[#0E3529] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl bg-[#0E3529] border border-[#D4AF37]/60 flex items-center justify-center shrink-0 shadow-md">
              <Cog className="w-8 h-8 text-[#D4AF37]/35 absolute" />
              <FlaskConical className="w-6 h-6 text-[#D4AF37] relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#D4AF37] text-[#0E3529] font-extrabold">
                  ISO/IEC 17025 SECURITY GATEWAY
                </span>
                <span className="text-xs font-mono text-emerald-200">RC 9898142</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1">
                Samstrust Enterprise Authentication & Onboarding Suite
              </h2>
              <p className="text-xs text-emerald-100/80">
                Web Crypto SHA-256 Salted Hashing • Mandatory Staff 2FA • CAC (RC/BN) Verification
              </p>
            </div>
          </div>

          {onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="self-end sm:self-center p-2 rounded-xl bg-[#0E3529] text-emerald-200 hover:text-white cursor-pointer"
              title="Close Authentication Suite"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#F4F8F6] px-6 py-3 border-b border-[#E2ECE7] flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setAuthFeedback(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#164E3D] text-[#D4AF37] shadow-xs'
                : 'text-[#1A2E26] hover:bg-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>1. Corporate Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('2fa');
              setAuthFeedback(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === '2fa'
                ? 'bg-[#164E3D] text-[#D4AF37] shadow-xs'
                : 'text-[#1A2E26] hover:bg-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>2. Two-Factor Auth (2FA)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('onboarding');
              setAuthFeedback(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'onboarding'
                ? 'bg-[#164E3D] text-[#D4AF37] shadow-xs'
                : 'text-[#1A2E26] hover:bg-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>3. Customer CAC Onboarding</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('reset');
              setAuthFeedback(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'reset'
                ? 'bg-[#164E3D] text-[#D4AF37] shadow-xs'
                : 'text-[#1A2E26] hover:bg-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>4. Time-Limited Password Reset</span>
          </button>
        </div>

        {/* Status Feedback Banner */}
        {authFeedback && (
          <div
            className={`mx-6 mt-5 p-4 rounded-2xl border flex items-start gap-3 text-xs ${
              authFeedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : authFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            {authFeedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#164E3D] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium leading-relaxed">{authFeedback.text}</div>
          </div>
        )}

        {/* =================================================================
            TAB 1: CORPORATE LOGIN & SESSION EXPIRATION RULES
           ================================================================= */}
        {activeTab === 'login' && (
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form onSubmit={handleLoginSubmit} className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
                  Encrypted Session Handshake
                </span>
                <h3 className="text-lg font-bold text-[#1A2E26]">
                  Sign In to Customer & Staff Operations Portal
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs font-mono text-[#1A2E26] focus:outline-none focus:border-[#164E3D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password (Salted SHA-256 Verification)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs font-mono text-[#1A2E26] focus:outline-none focus:border-[#164E3D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Cryptographic Hash Digest Preview */}
              <div className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>WEB CRYPTO PBKDF2 / SHA-256 SALTED DIGEST</span>
                  <span className="text-[#D4AF37]">
                    Salt: {companyProfile.passwordSalt}
                  </span>
                </div>
                <div className="truncate">{livePasswordHash}</div>
              </div>

              {/* Session Expiration Policy Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Session Expiration Policy (Idle & Absolute TTL)
                </label>
                <select
                  value={sessionTtlMinutes}
                  onChange={(e) => setSessionTtlMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs font-medium text-[#1A2E26]"
                >
                  <option value={15}>15 Minutes (Strict Cleanroom Terminal Policy)</option>
                  <option value={30}>30 Minutes (High-Security Audit Session)</option>
                  <option value={60}>60 Minutes (Standard Corporate Session)</option>
                  <option value={480}>480 Minutes (8-Hour Field Shift Token)</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Authenticate Corporate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSimulateFailedAttempt}
                  className="py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs cursor-pointer"
                  title="Test Failed Login Audit Logging"
                >
                  Simulate Failed Login
                </button>
              </div>
            </form>

            {/* Right Column: Quick Persona Credential Fill */}
            <div className="lg:col-span-5 bg-[#F4F8F6] rounded-2xl p-5 border border-[#E2ECE7] space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A17E22] font-bold">
                  Instant Demo Credentials
                </span>
                <h4 className="text-sm font-bold text-[#1A2E26]">
                  1-Click Role Credential Selector
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Staff & Admin roles automatically enforce 2FA verification upon login.
                </p>
              </div>

              <div className="space-y-2">
                {(Object.keys(PORTAL_USERS) as PortalRole[]).map((rKey) => {
                  const u = PORTAL_USERS[rKey];
                  const isSelected = selectedRolePreset === rKey;
                  return (
                    <button
                      key={rKey}
                      type="button"
                      onClick={() => handleSelectRolePreset(rKey)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#164E3D] text-white border-[#164E3D] shadow-xs'
                          : 'bg-white text-[#1A2E26] border-[#E2ECE7] hover:border-[#164E3D]/40'
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-[#D4AF37]' : 'text-[#164E3D]'
                          }`}
                        >
                          {u.roleTitle}
                        </p>
                        <p
                          className={`text-[11px] font-mono truncate ${
                            isSelected ? 'text-emerald-100' : 'text-slate-500'
                          }`}
                        >
                          {rKey === 'customer'
                            ? companyProfile.primaryContactEmail
                            : u.email}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                          rKey === 'customer'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-[#D4AF37] text-[#0E3529]'
                        }`}
                      >
                        {rKey === 'customer' ? 'CAC Client' : '2FA Staff'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 2: TWO-FACTOR AUTHENTICATION (2FA) CHALLENGE
           ================================================================= */}
        {activeTab === '2fa' && (
          <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-[#EBF3F0] border border-[#164E3D]/30 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
                  Simulated TOTP Authenticator / SMS Gateway
                </span>
                <p className="text-xs text-[#1A2E26]">
                  Active 6-Digit Security Code for{' '}
                  <strong>{loginEmail}</strong>:
                </p>
                <p className="text-2xl font-mono font-extrabold tracking-widest text-[#164E3D]">
                  {generatedTotp}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnteredTotp(generatedTotp)}
                className="px-3 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold text-xs cursor-pointer shrink-0"
              >
                Auto-Fill Code
              </button>
            </div>

            <form onSubmit={handleVerify2faSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 6-Digit TOTP Authenticator / SMS Code (or Recovery Code `170250`)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={enteredTotp}
                  onChange={(e) => setEnteredTotp(e.target.value)}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-center text-xl font-mono font-bold tracking-widest text-[#164E3D]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify 2FA Code & Unlock Session</span>
              </button>
            </form>
          </div>
        )}

        {/* =================================================================
            TAB 3: CUSTOMER ONBOARDING & NIGERIAN CAC (RC/BN) REGISTRATION
           ================================================================= */}
        {activeTab === 'onboarding' && (
          <form onSubmit={handleOnboardingSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#E2ECE7] pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
                  New Corporate Client Registration
                </span>
                <h3 className="text-lg font-bold text-[#1A2E26]">
                  Company Onboarding, CAC Verification & Primary Facility Setup
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EBF3F0] text-[#164E3D] font-mono text-xs font-bold">
                Auto-Provisions Facility & Roster
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Registered Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PrimeCure Biologics & Diagnostics Nigeria Ltd"
                  value={onboardForm.companyName}
                  onChange={(e) =>
                    setOnboardForm({ ...onboardForm, companyName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nigerian CAC Number (RC / BN) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RC 1948201"
                  value={onboardForm.cacRegistrationNumber}
                  onChange={(e) =>
                    setOnboardForm({
                      ...onboardForm,
                      cacRegistrationNumber: e.target.value,
                    })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono border ${
                    cacValidation.valid
                      ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950'
                      : 'bg-[#F4F8F6] border-[#E2ECE7]'
                  }`}
                />
                <span
                  className={`block text-[10px] font-mono mt-1 ${
                    cacValidation.valid ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {cacValidation.message}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Laboratory / Industrial Facility Type *
                </label>
                <select
                  value={onboardForm.laboratoryFacilityType}
                  onChange={(e) =>
                    setOnboardForm({
                      ...onboardForm,
                      laboratoryFacilityType: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                >
                  {FACILITY_TYPES.map((ft) => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Corporate TIN (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TIN-3391042-0001"
                  value={onboardForm.tinNumber}
                  onChange={(e) =>
                    setOnboardForm({ ...onboardForm, tinNumber: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Facility Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 22 Trans-Amadi Industrial Layout, Phase II"
                  value={onboardForm.primaryFacilityAddress}
                  onChange={(e) =>
                    setOnboardForm({
                      ...onboardForm,
                      primaryFacilityAddress: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Operating State *
                </label>
                <select
                  value={onboardForm.state}
                  onChange={(e) =>
                    setOnboardForm({ ...onboardForm, state: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Contact Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Boma Horsfall"
                  value={onboardForm.primaryContactName}
                  onChange={(e) =>
                    setOnboardForm({
                      ...onboardForm,
                      primaryContactName: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. b.horsfall@primecure.ng"
                  value={onboardForm.primaryContactEmail}
                  onChange={(e) =>
                    setOnboardForm({
                      ...onboardForm,
                      primaryContactEmail: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone / WhatsApp (+234) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+234 803 000 0000"
                  value={onboardForm.primaryContactPhone}
                  onChange={(e) =>
                    setOnboardForm({
                      ...onboardForm,
                      primaryContactPhone: e.target.value,
                      whatsappNumber: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">
                  Set Portal Password *
                </label>
                <input
                  type="password"
                  required
                  value={onboardForm.passwordPlain}
                  onChange={(e) =>
                    setOnboardForm({ ...onboardForm, passwordPlain: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                />
              </div>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs cursor-pointer mt-4">
                <span className="font-bold text-[#1A2E26]">
                  Enforce Two-Factor Authentication (2FA) on Account
                </span>
                <input
                  type="checkbox"
                  checked={onboardForm.enableTwoFactor}
                  onChange={(e) =>
                    setOnboardForm({
                      ...onboardForm,
                      enableTwoFactor: e.target.checked,
                    })
                  }
                  className="rounded text-[#164E3D]"
                />
              </label>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E2ECE7]">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Complete CAC Onboarding & Provision Portal Workspace</span>
              </button>
            </div>
          </form>
        )}

        {/* =================================================================
            TAB 4: SECURE PASSWORD RESET WITH TIME-LIMITED TOKENS
           ================================================================= */}
        {activeTab === 'reset' && (
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Step 1: Generate Time-Limited Reset Token */}
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
                  Step 1 • Token Issuance
                </span>
                <h3 className="text-base font-bold text-[#1A2E26]">
                  Request Time-Limited Password Reset Token (15-Min TTL)
                </h3>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">
                  Registered Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate 15-Minute Security Reset Token</span>
              </button>

              {activeResetToken && (
                <div className="p-4 rounded-2xl bg-[#EBF3F0] border border-[#164E3D]/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#164E3D]">
                      Active Reset Token Dispatched
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      TTL: {Math.floor(tokenRemainingSec / 60)}m {tokenRemainingSec % 60}s
                    </span>
                  </div>
                  <p className="text-lg font-mono font-extrabold text-[#164E3D]">
                    {activeResetToken.token}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Status: {activeResetToken.used ? 'CONSUMED' : 'VALID & UNUSED'}
                  </p>
                </div>
              )}
            </form>

            {/* Step 2: Verify Token & Rotate Password Hash */}
            <form onSubmit={handleCompleteReset} className="space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#A17E22] font-bold">
                  Step 2 • Cryptographic Key Rotation
                </span>
                <h3 className="text-base font-bold text-[#1A2E26]">
                  Verify Token & Rotate Salted SHA-256 Password
                </h3>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">
                  Time-Limited Reset Token *
                </label>
                <input
                  type="text"
                  required
                  placeholder="RST-SAM-XXXX-XXXX"
                  value={enteredResetToken}
                  onChange={(e) => setEnteredResetToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono font-bold text-[#164E3D]"
                />
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">
                  New Corporate Password *
                </label>
                <input
                  type="text"
                  required
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37] text-[#0E3529] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Verify Token & Rotate Password Hash</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
