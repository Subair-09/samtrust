import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Bell,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Mail,
  MessageSquare,
  KeyRound,
  AlertOctagon,
  FileCheck,
  UserCheck,
} from 'lucide-react';
import {
  FacilityCategory,
  PersonnelDesignation,
  CustomerFacility,
} from '../../types/portal';
import { usePortal } from '../../context/PortalContext';

interface PortalProfileFacilityViewProps {
  onOpenAuthModal: (tab: 'login' | 'onboarding' | 'reset' | '2fa') => void;
  onShowToast: (msg: string) => void;
}

const FACILITY_CATEGORIES: FacilityCategory[] = [
  'Central Testing Lab',
  'Satellite QA Unit',
  'Factory Bay',
  'Cleanroom Suite',
  'Terminal Metering Skid',
];

const PERSONNEL_DESIGNATIONS: PersonnelDesignation[] = [
  'Procurement Manager',
  'Laboratory Analyst',
  'Receiving Officer',
  'QA / Metrology Lead',
  'Plant Safety Coordinator',
];

export const PortalProfileFacilityView: React.FC<PortalProfileFacilityViewProps> = ({
  onOpenAuthModal,
  onShowToast,
}) => {
  const {
    activeRole,
    currentPortalUser,
    sessionState,
    companyProfile,
    updateCompanyProfile,
    extendPortalSession,
    facilities,
    addFacility,
    setPrimaryFacility,
    removeFacility,
    authorizedPersonnel,
    addAuthorizedPersonnel,
    togglePersonnelActive,
    removeAuthorizedPersonnel,
    notificationPrefs,
    toggleNotificationPref,
    lastIdorResult,
    verifyAndAccessResource,
    auditLogs,
  } = usePortal();

  // New Facility Form State
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [facForm, setFacForm] = useState({
    facilityName: '',
    facilityType: 'Satellite QA Unit' as FacilityCategory,
    address: '',
    state: 'Lagos State',
    siteContactName: currentPortalUser.name,
    siteContactPhone: currentPortalUser.phone,
    accessSafetyProtocol: 'Standard Lab Coat, Safety Glasses & Visitor Sign-In',
    isPrimary: false,
    status: 'Active Operation' as CustomerFacility['status'],
    instrumentCount: 4,
  });

  // New Authorized Personnel Form State
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [persForm, setPersForm] = useState({
    fullName: '',
    designation: 'Laboratory Analyst' as PersonnelDesignation,
    email: '',
    phone: '+234 803 ',
    assignedFacilityName: facilities[0]?.facilityName || 'Central Testing Lab',
    canApproveQuotes: false,
    canSignSiteChecklists: true,
    canDownloadCertificates: true,
  });

  const handleAddFacilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facForm.facilityName || !facForm.address) return;
    addFacility(facForm);
    setFacForm({
      facilityName: '',
      facilityType: 'Satellite QA Unit',
      address: '',
      state: 'Lagos State',
      siteContactName: currentPortalUser.name,
      siteContactPhone: currentPortalUser.phone,
      accessSafetyProtocol: 'Standard Lab Coat, Safety Glasses & Visitor Sign-In',
      isPrimary: false,
      status: 'Active Operation',
      instrumentCount: 4,
    });
    setShowAddFacility(false);
    onShowToast('New operational facility added to Multi-Facility Registry.');
  };

  const handleAddPersonnelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!persForm.fullName || !persForm.email) return;
    addAuthorizedPersonnel({
      ...persForm,
      active: true,
    });
    setPersForm({
      fullName: '',
      designation: 'Laboratory Analyst',
      email: '',
      phone: '+234 803 ',
      assignedFacilityName: facilities[0]?.facilityName || 'Central Testing Lab',
      canApproveQuotes: false,
      canSignSiteChecklists: true,
      canDownloadCertificates: true,
    });
    setShowAddPersonnel(false);
    onShowToast(
      `Designated ${persForm.fullName} (${persForm.designation}) on Authorized Personnel Roster.`
    );
  };

  const remainingMinutes = Math.max(
    1,
    Math.round((sessionState.expiresAtMs - Date.now()) / 60000)
  );

  return (
    <div className="space-y-8">
      {/* =====================================================================
          1. CORPORATE IDENTITY, CAC REGISTRATION & SESSION SECURITY BANNER
         ===================================================================== */}
      <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E2ECE7] pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#164E3D] text-[#D4AF37] font-mono text-xs font-bold">
                CAC VERIFIED: {companyProfile.cacRegistrationNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#EBF3F0] text-[#164E3D] font-mono text-xs font-semibold">
                {companyProfile.tinNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-mono text-xs font-semibold">
                2FA: {companyProfile.twoFactorEnabled ? 'ENFORCED' : 'OPTIONAL'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A2E26] mt-1">
              {companyProfile.companyName}
            </h2>
            <p className="text-xs text-slate-600">
              Primary Facility Classification:{' '}
              <strong className="text-[#164E3D]">
                {companyProfile.laboratoryFacilityType}
              </strong>{' '}
              • {companyProfile.primaryFacilityAddress}, {companyProfile.state}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenAuthModal('onboarding')}
              className="px-3.5 py-2 rounded-xl bg-[#F4F8F6] hover:bg-[#EBF3F0] text-[#164E3D] border border-[#164E3D]/20 text-xs font-bold cursor-pointer"
            >
              Onboard New CAC Company
            </button>
            <button
              type="button"
              onClick={() => onOpenAuthModal('reset')}
              className="px-3.5 py-2 rounded-xl bg-[#F4F8F6] hover:bg-[#EBF3F0] text-[#164E3D] border border-[#164E3D]/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password Reset Token</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAuthModal('2fa')}
              className="px-3.5 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>2FA Challenge</span>
            </button>
          </div>
        </div>

        {/* Cryptographic & Session Security Telemetry Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7]">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Active Session & Expiration Rule
            </span>
            <div className="font-bold text-[#164E3D] mt-1 flex items-center justify-between">
              <span>Expires in {remainingMinutes} mins</span>
              <button
                type="button"
                onClick={() => {
                  extendPortalSession(60);
                  onShowToast('Session TTL extended by 60 minutes.');
                }}
                className="text-[11px] font-mono underline text-[#A17E22] cursor-pointer"
              >
                + Extend 60m
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Auth Mode: {sessionState.authMethod}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7]">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Stored Salted Password Digest (SHA-256)
            </span>
            <p className="font-mono font-bold text-[#1A2E26] truncate mt-1">
              {companyProfile.passwordHash}
            </p>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Salt: {companyProfile.passwordSalt}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Two-Factor Auth (2FA) Policy
              </span>
              <p className="font-bold text-[#1A2E26] mt-1">
                {companyProfile.twoFactorMethod}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mandatory for Staff/Admin roles
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={companyProfile.twoFactorEnabled}
                onChange={(e) => {
                  updateCompanyProfile({ twoFactorEnabled: e.target.checked });
                  onShowToast(
                    `2FA requirement updated to ${
                      e.target.checked ? 'ENABLED' : 'OPTIONAL'
                    }.`
                  );
                }}
                className="rounded text-[#164E3D] w-4 h-4"
              />
            </label>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. MULTI-FACILITY ADDRESS MANAGEMENT
         ===================================================================== */}
      <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#E2ECE7] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
              Multi-Site Laboratory & Plant Locations
            </span>
            <h3 className="text-lg font-bold text-[#1A2E26]">
              Facility Address Management ({facilities.length} Registered Sites)
            </h3>
            <p className="text-xs text-slate-500">
              Manage Central Testing Labs, Satellite QA Units, and Factory Bays for engineer dispatch and calibration certificates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddFacility(!showAddFacility)}
            className="px-4 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility Location</span>
          </button>
        </div>

        {showAddFacility && (
          <form
            onSubmit={handleAddFacilitySubmit}
            className="p-6 bg-[#F4F8F6] border-b border-[#E2ECE7] space-y-4 text-xs"
          >
            <h4 className="font-bold text-sm text-[#164E3D]">
              Register New Operational Facility / Laboratory Wing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satellite QA Microbiology Lab"
                  value={facForm.facilityName}
                  onChange={(e) =>
                    setFacForm({ ...facForm, facilityName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Facility Classification *
                </label>
                <select
                  value={facForm.facilityType}
                  onChange={(e) =>
                    setFacForm({
                      ...facForm,
                      facilityType: e.target.value as FacilityCategory,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                >
                  {FACILITY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={facForm.state}
                  onChange={(e) => setFacForm({ ...facForm, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Street / Industrial Estate Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 8, Redemption Industrial Park, Mowe"
                  value={facForm.address}
                  onChange={(e) => setFacForm({ ...facForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Site Safety & Cleanroom Entry Protocol
                </label>
                <input
                  type="text"
                  value={facForm.accessSafetyProtocol}
                  onChange={(e) =>
                    setFacForm({ ...facForm, accessSafetyProtocol: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddFacility(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E2ECE7] font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold cursor-pointer"
              >
                Save Facility
              </button>
            </div>
          </form>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                fac.isPrimary
                  ? 'bg-[#EBF3F0]/70 border-[#164E3D]'
                  : 'bg-[#F4F8F6] border-[#E2ECE7]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#164E3D] text-[#D4AF37] font-mono text-[10px] font-bold">
                    {fac.facilityType}
                  </span>
                  {fac.isPrimary && (
                    <span className="px-2 py-0.5 rounded bg-[#D4AF37] text-[#0E3529] font-mono text-[10px] font-extrabold">
                      PRIMARY HQ
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-[#1A2E26]">{fac.facilityName}</h4>
                <p className="text-xs text-slate-600 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#164E3D] shrink-0 mt-0.5" />
                  <span>
                    {fac.address}, {fac.state}
                  </span>
                </p>
                <div className="pt-2 border-t border-[#E2ECE7] text-[11px] text-slate-600 space-y-1">
                  <div>
                    <strong>Site Contact:</strong> {fac.siteContactName} (
                    {fac.siteContactPhone})
                  </div>
                  <div>
                    <strong>Access Rule:</strong> {fac.accessSafetyProtocol}
                  </div>
                  <div className="font-mono text-[#164E3D] font-bold">
                    {fac.instrumentCount} Registered Instruments • {fac.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2ECE7]">
                {!fac.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPrimaryFacility(fac.id);
                      onShowToast(`Set "${fac.facilityName}" as Primary Facility.`);
                    }}
                    className="text-xs font-bold text-[#164E3D] hover:underline cursor-pointer"
                  >
                    Set as Primary
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-800 font-semibold">
                    Default Billing & Dispatch Site
                  </span>
                )}
                {!fac.isPrimary && (
                  <button
                    type="button"
                    onClick={() => {
                      removeFacility(fac.id);
                      onShowToast(`Removed "${fac.facilityName}".`);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
                    title="Remove Facility"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          3. AUTHORIZED PERSONNEL ROSTER
         ===================================================================== */}
      <div className="bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#E2ECE7] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A17E22] font-bold">
              Delegated Corporate Authority
            </span>
            <h3 className="text-lg font-bold text-[#1A2E26]">
              Authorized Personnel Roster ({authorizedPersonnel.length} Officers)
            </h3>
            <p className="text-xs text-slate-500">
              Designate Procurement Managers, Laboratory Analysts, and Receiving Officers authorized for quote approvals, site checklists, and certificate custody.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPersonnel(!showAddPersonnel)}
            className="px-4 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Authorized Officer</span>
          </button>
        </div>

        {showAddPersonnel && (
          <form
            onSubmit={handleAddPersonnelSubmit}
            className="p-6 bg-[#F4F8F6] border-b border-[#E2ECE7] space-y-4 text-xs"
          >
            <h4 className="font-bold text-sm text-[#164E3D]">
              Designate New Authorized Corporate Personnel
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pharm. Ngozi Eze"
                  value={persForm.fullName}
                  onChange={(e) =>
                    setPersForm({ ...persForm, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Role Designation *
                </label>
                <select
                  value={persForm.designation}
                  onChange={(e) =>
                    setPersForm({
                      ...persForm,
                      designation: e.target.value as PersonnelDesignation,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                >
                  {PERSONNEL_DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="n.eze@company.com"
                  value={persForm.email}
                  onChange={(e) => setPersForm({ ...persForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Facility
                </label>
                <select
                  value={persForm.assignedFacilityName}
                  onChange={(e) =>
                    setPersForm({
                      ...persForm,
                      assignedFacilityName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7]"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.facilityName}>
                      {f.facilityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={persForm.canApproveQuotes}
                  onChange={(e) =>
                    setPersForm({ ...persForm, canApproveQuotes: e.target.checked })
                  }
                  className="rounded text-[#164E3D]"
                />
                <span className="font-semibold">Can Approve Commercial Quotes</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={persForm.canSignSiteChecklists}
                  onChange={(e) =>
                    setPersForm({
                      ...persForm,
                      canSignSiteChecklists: e.target.checked,
                    })
                  }
                  className="rounded text-[#164E3D]"
                />
                <span className="font-semibold">Can Sign Site Handover Checklists</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={persForm.canDownloadCertificates}
                  onChange={(e) =>
                    setPersForm({
                      ...persForm,
                      canDownloadCertificates: e.target.checked,
                    })
                  }
                  className="rounded text-[#164E3D]"
                />
                <span className="font-semibold">
                  Can Download ISO 17025 Certificates
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPersonnel(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E2ECE7] font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold cursor-pointer"
              >
                Save Officer to Roster
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F8F6] text-[11px] font-mono uppercase text-slate-500 border-b border-[#E2ECE7]">
                <th className="py-3.5 px-4">Personnel & Contact</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Assigned Facility</th>
                <th className="py-3.5 px-4">Signing Privileges</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2ECE7]">
              {authorizedPersonnel.map((person) => (
                <tr key={person.id} className="hover:bg-[#F4F8F6]/60">
                  <td className="py-4 px-4">
                    <div className="font-bold text-[#1A2E26]">{person.fullName}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {person.email} • {person.phone}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#EBF3F0] text-[#164E3D] font-bold text-[11px]">
                      {person.designation}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    {person.assignedFacilityName}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {person.canApproveQuotes && (
                        <span className="px-2 py-0.5 rounded bg-[#D4AF37]/25 text-[#0E3529] font-mono text-[10px] font-bold">
                          Quote Approval
                        </span>
                      )}
                      {person.canSignSiteChecklists && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-semibold">
                          Site Sign-Off
                        </span>
                      )}
                      {person.canDownloadCertificates && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                          Cert Custody
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => togglePersonnelActive(person.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                        person.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {person.active ? 'Authorized' : 'Suspended'}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        removeAuthorizedPersonnel(person.id);
                        onShowToast(`Removed ${person.fullName} from roster.`);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Remove Officer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          4. NOTIFICATION PREFERENCES (EMAIL & WHATSAPP) + 5. IDOR SANDBOX
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Email & WhatsApp Notification Preferences */}
        <div className="lg:col-span-6 bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs p-6 space-y-4">
          <div className="border-b border-[#E2ECE7] pb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#164E3D] font-bold">
              Multi-Channel Alert Routing
            </span>
            <h3 className="text-base font-bold text-[#1A2E26]">
              Email & WhatsApp Notification Preferences
            </h3>
            <p className="text-xs text-slate-500">
              Routed to <strong>{companyProfile.primaryContactEmail}</strong> & WhatsApp{' '}
              <strong>{companyProfile.whatsappNumber}</strong>
            </p>
          </div>

          <div className="space-y-3">
            {notificationPrefs.map((pref) => (
              <div
                key={pref.id}
                className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#1A2E26]">{pref.label}</h4>
                  <p className="text-[11px] text-slate-500">{pref.description}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleNotificationPref(pref.id, 'emailEnabled')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      pref.emailEnabled
                        ? 'bg-[#164E3D] text-[#D4AF37] border-[#164E3D]'
                        : 'bg-white text-slate-400 border-[#E2ECE7]'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleNotificationPref(pref.id, 'whatsappEnabled')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      pref.whatsappEnabled
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-slate-400 border-[#E2ECE7]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 Cols: Server-Side Anti-IDOR Ownership Verification Sandbox */}
        <div className="lg:col-span-6 bg-white rounded-[18px] border border-[#E2ECE7] shadow-xs p-6 space-y-4">
          <div className="border-b border-[#E2ECE7] pb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-red-700 font-bold">
              Zero-Trust Object Ownership Guard
            </span>
            <h3 className="text-base font-bold text-[#1A2E26]">
              Anti-IDOR Verification & Immutable Security Audit Log
            </h3>
            <p className="text-xs text-slate-500">
              Every request for calibration certificates, quotes, or equipment serials verifies tenant ownership before serving records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                const res = verifyAndAccessResource({
                  resourceType: 'Calibration Certificate',
                  resourceId: 'CERT-ISO17025-2026-0891',
                  resourceOwnerCompany: companyProfile.companyName,
                  simulateCrossTenantAttack: false,
                });
                onShowToast(res.reason);
              }}
              className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#164E3D]">
                <ShieldCheck className="w-4 h-4" />
                <span>Test Authorized Tenant Access</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Verify ownership of {companyProfile.companyName} certificate (HTTP 200 OK).
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                const res = verifyAndAccessResource({
                  resourceType: 'Calibration Certificate',
                  resourceId: 'CERT-ISO17025-2026-0765',
                  resourceOwnerCompany: 'Atlantic Energy & Refining Group',
                  simulateCrossTenantAttack: true,
                });
                onShowToast(res.reason);
              }}
              className="p-3.5 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                <AlertOctagon className="w-4 h-4" />
                <span>Simulate Cross-Tenant IDOR Attack</span>
              </div>
              <p className="text-[11px] text-red-700/80 mt-1">
                Attempt unauthorized direct object reference to another client's certificate (HTTP 403).
              </p>
            </button>
          </div>

          {lastIdorResult && (
            <div
              className={`p-4 rounded-2xl border text-xs font-mono space-y-1 ${
                lastIdorResult.allowed
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>
                  HTTP {lastIdorResult.httpStatus} •{' '}
                  {lastIdorResult.allowed ? 'OWNERSHIP VERIFIED' : 'IDOR BLOCKED'}
                </span>
                <span>{lastIdorResult.resourceId}</span>
              </div>
              <p className="font-sans text-[11px] leading-relaxed">
                {lastIdorResult.reason}
              </p>
            </div>
          )}

          {/* Latest Security Audit Log Entries with Integrity Hash */}
          <div className="pt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              Recent Immutable Security Ledger Entries (Tamper-Evident SHA-256 Chain)
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-[#E2ECE7] border border-[#E2ECE7] rounded-2xl bg-[#F4F8F6]">
              {auditLogs.slice(0, 6).map((entry) => (
                <div key={entry.id} className="p-3 text-[11px] space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-bold ${
                        entry.severity === 'Critical'
                          ? 'text-red-700'
                          : 'text-[#164E3D]'
                      }`}
                    >
                      {entry.action}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {entry.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>
                      {entry.actorName} ({entry.module})
                    </span>
                    {entry.integrityHash && (
                      <span className="text-emerald-800 truncate max-w-[180px]">
                        {entry.integrityHash}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
