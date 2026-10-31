import React, { useState, useMemo } from 'react';
import { useCms } from '../../context/CmsContext';
import { usePortal } from '../../context/PortalContext';
import {
  CmsRole,
  ManagedUserAccount,
  SystemAccessScope,
  UserAccountStatus,
} from '../../types/cms';
import { PortalRole } from '../../types/portal';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  UserCheck,
  Sliders,
  Sparkles,
  LogIn,
  AlertCircle,
  MessageCircle,
  X,
} from 'lucide-react';

interface UserRoleManagerProps {
  contextMode?: 'cms' | 'portal';
}

const CMS_ROLE_OPTIONS: {
  value: CmsRole | 'none';
  label: string;
  badgeClass: string;
  description: string;
}[] = [
  {
    value: 'super-admin',
    label: 'Super Admin (Full CMS)',
    badgeClass: 'bg-[#D4AF37]/25 text-[#0E3529] border-[#D4AF37]',
    description: 'Unrestricted access to Hero Slider, Catalog, Pages, Services, RFQ Pipeline, Live Desk & User Roles.',
  },
  {
    value: 'live-desk-agent',
    label: 'Live Desk & WhatsApp Control',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    description: 'Enable/disable Visitor WhatsApp Live Desk & On-Site Live Chat, reply to live visitor chats & convert to RFQ leads.',
  },
  {
    value: 'editor',
    label: 'Content Editor',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Manage Hero Slider, Equipment Catalog, Media Library, Public Pages & FAQs.',
  },
  {
    value: 'sales-reviewer',
    label: 'Sales Reviewer',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Access Lead & RFQ Pipeline, assign engineers, generate Pro-Forma invoices & export CSV.',
  },
  {
    value: 'none',
    label: 'No CMS Access',
    badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
    description: 'User cannot access the /admin Website CMS console.',
  },
];

const PORTAL_ROLE_OPTIONS: {
  value: PortalRole | 'none';
  label: string;
  badgeClass: string;
  description: string;
}[] = [
  {
    value: 'portal-admin',
    label: 'Portal Super Admin',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'Executive governance, RBAC permissions matrix, Live Desk & WhatsApp control, security audit logs & system settings.',
  },
  {
    value: 'accounts-sales',
    label: 'Accounts & Sales Specialist',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
    description: 'Commercial quotation engine, pro-forma tax invoicing, Live Desk chat triage, PO review & payment verification.',
  },
  {
    value: 'coordinator',
    label: 'Service Coordinator',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Service ticket triage, field engineer dispatch routing & SLA compliance monitoring.',
  },
  {
    value: 'technician',
    label: 'Field Service Technician',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    description: 'Assigned field jobs, site safety checklists, As-Found/As-Left calibration & ISO 17025 certs.',
  },
  {
    value: 'customer',
    label: 'Registered Customer',
    badgeClass: 'bg-emerald-50 text-[#164E3D] border-emerald-200',
    description: 'Client equipment passport registry, service ticket intake, quote approval & cert downloads.',
  },
  {
    value: 'none',
    label: 'No Portal Access',
    badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
    description: 'User cannot access the /portal Enterprise Operations workspace.',
  },
];

const ALL_GRANULAR_PERMISSIONS: {
  id: string;
  label: string;
  category: 'CMS Website Studio' | 'Enterprise Operations Portal';
}[] = [
  { id: 'cms.livedesk.control', label: 'WhatsApp Live Desk & On-Site Live Chat Control (Enable/Disable & Inbox)', category: 'CMS Website Studio' },
  { id: 'cms.slider.manage', label: 'Manage Homepage Hero Slides', category: 'CMS Website Studio' },
  { id: 'cms.catalog.manage', label: 'Create/Edit Equipment SKUs, Categories & Brands', category: 'CMS Website Studio' },
  { id: 'cms.pages.manage', label: 'Edit Public Pages & Technical Subpages', category: 'CMS Website Studio' },
  { id: 'cms.services.manage', label: 'Manage Calibration Scopes & FAQs', category: 'CMS Website Studio' },
  { id: 'cms.rfq.triage', label: 'Triage RFQ Pipeline & Issue Pro-Forma Invoices', category: 'CMS Website Studio' },
  { id: 'cms.users.manage', label: 'Create Users & Assign System Roles', category: 'CMS Website Studio' },
  { id: 'portal.assets.manage', label: 'Equipment Asset Passports & QR Registry', category: 'Enterprise Operations Portal' },
  { id: 'portal.dispatch.assign', label: 'Dispatch Field Engineers & SLA Routing', category: 'Enterprise Operations Portal' },
  { id: 'portal.calibration.certify', label: 'Record Calibration Readings & Issue ISO 17025 Certs', category: 'Enterprise Operations Portal' },
  { id: 'portal.quotes.approve', label: 'Commercial Quotes, POs & Payment Verification', category: 'Enterprise Operations Portal' },
  { id: 'portal.rbac.manage', label: 'Configure RBAC Matrix & System Settings', category: 'Enterprise Operations Portal' },
  { id: 'portal.audit.view', label: 'Inspect Immutable SHA-256 Security Audit Logs', category: 'Enterprise Operations Portal' },
];

function getDefaultPermissionsForRoles(
  cmsRole: CmsRole | 'none',
  portalRole: PortalRole | 'none'
): string[] {
  const perms = new Set<string>();

  if (cmsRole === 'super-admin') {
    perms.add('cms.livedesk.control');
    perms.add('cms.slider.manage');
    perms.add('cms.catalog.manage');
    perms.add('cms.pages.manage');
    perms.add('cms.services.manage');
    perms.add('cms.rfq.triage');
    perms.add('cms.users.manage');
  } else if (cmsRole === 'live-desk-agent') {
    perms.add('cms.livedesk.control');
    perms.add('cms.rfq.triage');
  } else if (cmsRole === 'editor') {
    perms.add('cms.slider.manage');
    perms.add('cms.catalog.manage');
    perms.add('cms.pages.manage');
    perms.add('cms.services.manage');
  } else if (cmsRole === 'sales-reviewer') {
    perms.add('cms.rfq.triage');
    perms.add('cms.livedesk.control');
  }

  if (portalRole === 'portal-admin') {
    perms.add('cms.livedesk.control');
    perms.add('cms.users.manage');
    perms.add('portal.assets.manage');
    perms.add('portal.dispatch.assign');
    perms.add('portal.calibration.certify');
    perms.add('portal.quotes.approve');
    perms.add('portal.rbac.manage');
    perms.add('portal.audit.view');
  } else if (portalRole === 'accounts-sales') {
    perms.add('cms.rfq.triage');
    perms.add('cms.livedesk.control');
    perms.add('portal.quotes.approve');
    perms.add('portal.assets.manage');
  } else if (portalRole === 'coordinator') {
    perms.add('portal.dispatch.assign');
    perms.add('portal.assets.manage');
  } else if (portalRole === 'technician') {
    perms.add('portal.calibration.certify');
    perms.add('portal.assets.manage');
  } else if (portalRole === 'customer') {
    perms.add('portal.assets.manage');
    perms.add('portal.quotes.approve');
  }

  return Array.from(perms);
}

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({ contextMode = 'cms' }) => {
  const {
    managedUsers,
    addManagedUser,
    updateManagedUser,
    deleteManagedUser,
    assignUserRoles,
    toggleUserLiveDeskControl,
    toggleManagedUserStatus,
    resetManagedUserPassword,
    loginAsManagedUser,
    currentUser,
  } = useCms();

  const { rbacMatrix, toggleRbacPermission, switchPortalRole } = usePortal();

  const [subTab, setSubTab] = useState<'directory' | 'roles-matrix'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Create / Edit User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUserAccount | null>(null);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Password Reset Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<ManagedUserAccount | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetMustChange, setResetMustChange] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form Fields
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+234 ');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formOrganization, setFormOrganization] = useState('Samstrust Technologies Limited');
  const [formLocation, setFormLocation] = useState('Ikeja HQ, Lagos');
  const [formSystemScope, setFormSystemScope] = useState<SystemAccessScope>('Both (CMS & Portal)');
  const [formCmsRole, setFormCmsRole] = useState<CmsRole | 'none'>('editor');
  const [formPortalRole, setFormPortalRole] = useState<PortalRole | 'none'>('coordinator');
  const [formStatus, setFormStatus] = useState<UserAccountStatus>('Active');
  const [formPassword, setFormPassword] = useState('Samstrust@2026!');
  const [formMustChangePassword, setFormMustChangePassword] = useState(true);
  const [formTwoFactorRequired, setFormTwoFactorRequired] = useState(true);
  const [formPermissions, setFormPermissions] = useState<string[]>(() =>
    getDefaultPermissionsForRoles('editor', 'coordinator')
  );
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => {
      setToastBanner((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return managedUsers.filter((user) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.jobTitle.toLowerCase().includes(q) ||
        user.organization.toLowerCase().includes(q) ||
        user.department.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      let matchesRole = true;
      if (roleFilter !== 'all') {
        if (roleFilter.startsWith('cms:')) {
          const targetCms = roleFilter.replace('cms:', '');
          matchesRole = user.cmsRole === targetCms;
        } else if (roleFilter.startsWith('portal:')) {
          const targetPortal = roleFilter.replace('portal:', '');
          matchesRole = user.portalRole === targetPortal;
        } else if (roleFilter === 'perm:livedesk') {
          matchesRole =
            user.cmsRole === 'super-admin' ||
            user.cmsRole === 'live-desk-agent' ||
            Boolean(user.customPermissions?.includes('cms.livedesk.control'));
        }
      }

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [managedUsers, searchQuery, roleFilter, statusFilter]);

  // KPI Metrics
  const stats = useMemo(() => {
    const total = managedUsers.length;
    const activeCount = managedUsers.filter((u) => u.status === 'Active').length;
    const adminCount = managedUsers.filter(
      (u) => u.cmsRole === 'super-admin' || u.portalRole === 'portal-admin'
    ).length;
    const staffCount = managedUsers.filter((u) => u.portalRole !== 'customer').length;
    const clientCount = managedUsers.filter((u) => u.portalRole === 'customer').length;
    const liveDeskAssignedCount = managedUsers.filter(
      (u) =>
        u.cmsRole === 'super-admin' ||
        u.cmsRole === 'live-desk-agent' ||
        u.customPermissions?.includes('cms.livedesk.control')
    ).length;
    return { total, activeCount, adminCount, staffCount, clientCount, liveDeskAssignedCount };
  }, [managedUsers]);

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Samstrust@${rand}26!`;
  };

  const handleOpenCreateModal = (
    presetCmsRole: CmsRole | 'none' = 'editor',
    presetPortalRole: PortalRole | 'none' = 'coordinator'
  ) => {
    setEditingUser(null);
    setFormError(null);
    setFormFullName('');
    setFormEmail('');
    setFormPhone('+234 ');
    setFormJobTitle('');
    setFormDepartment('Field Instrumentation & Metrology');
    setFormOrganization(
      presetPortalRole === 'customer' ? '' : 'Samstrust Technologies Limited'
    );
    setFormLocation('Ikeja HQ, Lagos');
    const scope: SystemAccessScope =
      presetCmsRole !== 'none' && presetPortalRole !== 'none'
        ? 'Both (CMS & Portal)'
        : presetCmsRole !== 'none'
        ? 'CMS Only'
        : 'Enterprise Portal Only';
    setFormSystemScope(scope);
    setFormCmsRole(presetCmsRole);
    setFormPortalRole(presetPortalRole);
    setFormStatus('Active');
    setFormPassword(generateStrongPassword());
    setFormMustChangePassword(true);
    setFormTwoFactorRequired(presetPortalRole !== 'customer');
    setFormPermissions(getDefaultPermissionsForRoles(presetCmsRole, presetPortalRole));
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (user: ManagedUserAccount) => {
    setEditingUser(user);
    setFormError(null);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormJobTitle(user.jobTitle);
    setFormDepartment(user.department);
    setFormOrganization(user.organization);
    setFormLocation(user.location);
    setFormSystemScope(user.systemScope);
    setFormCmsRole(user.cmsRole);
    setFormPortalRole(user.portalRole);
    setFormStatus(user.status);
    setFormPassword(user.passwordPlain);
    setFormMustChangePassword(user.mustChangePassword);
    setFormTwoFactorRequired(user.twoFactorRequired);
    setFormPermissions(user.customPermissions || []);
    setIsUserModalOpen(true);
  };

  const handleScopeChange = (newScope: SystemAccessScope) => {
    setFormSystemScope(newScope);
    let nextCms = formCmsRole;
    let nextPortal = formPortalRole;
    if (newScope === 'CMS Only') {
      nextPortal = 'none';
      if (nextCms === 'none') nextCms = 'editor';
    } else if (newScope === 'Enterprise Portal Only') {
      nextCms = 'none';
      if (nextPortal === 'none') nextPortal = 'coordinator';
    } else {
      if (nextCms === 'none') nextCms = 'editor';
      if (nextPortal === 'none') nextPortal = 'coordinator';
    }
    setFormCmsRole(nextCms);
    setFormPortalRole(nextPortal);
    setFormPermissions(getDefaultPermissionsForRoles(nextCms, nextPortal));
  };

  const handleCmsRoleSelect = (role: CmsRole | 'none') => {
    setFormCmsRole(role);
    setFormPermissions(getDefaultPermissionsForRoles(role, formPortalRole));
  };

  const handlePortalRoleSelect = (role: PortalRole | 'none') => {
    setFormPortalRole(role);
    setFormPermissions(getDefaultPermissionsForRoles(formCmsRole, role));
  };

  const togglePermissionCheckbox = (permId: string) => {
    setFormPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleUnassignAllRoles = (user: ManagedUserAccount) => {
    updateManagedUser({
      ...user,
      cmsRole: 'none',
      portalRole: 'none',
      customPermissions: [],
    });
    showToast(`Unassigned all roles and Live Desk permissions from ${user.fullName}.`);
  };

  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formFullName.trim() || !formEmail.trim()) {
      setFormError('Full Name and Corporate Email are required.');
      return;
    }

    // Check duplicate email
    const emailConflict = managedUsers.find(
      (u) =>
        u.email.toLowerCase() === formEmail.trim().toLowerCase() &&
        (!editingUser || u.id !== editingUser.id)
    );
    if (emailConflict) {
      setFormError(`An account with email "${formEmail.trim()}" already exists.`);
      return;
    }

    const resolvedScope: SystemAccessScope =
      formCmsRole !== 'none' && formPortalRole !== 'none'
        ? 'Both (CMS & Portal)'
        : formCmsRole !== 'none'
        ? 'CMS Only'
        : 'Enterprise Portal Only';

    if (editingUser) {
      updateManagedUser({
        ...editingUser,
        fullName: formFullName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        jobTitle: formJobTitle.trim() || 'Technical Specialist',
        department: formDepartment.trim() || 'Operations',
        organization: formOrganization.trim() || 'Samstrust Technologies Limited',
        location: formLocation.trim() || 'Lagos, Nigeria',
        systemScope: resolvedScope,
        cmsRole: formCmsRole,
        portalRole: formPortalRole,
        status: formStatus,
        passwordPlain: formPassword,
        mustChangePassword: formMustChangePassword,
        twoFactorRequired: formTwoFactorRequired,
        customPermissions: formPermissions,
      });
      showToast(`Updated account and role assignments for ${formFullName.trim()}.`);
    } else {
      const created = addManagedUser({
        fullName: formFullName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        jobTitle: formJobTitle.trim() || 'Technical Specialist',
        department: formDepartment.trim() || 'Operations',
        organization: formOrganization.trim() || 'Samstrust Technologies Limited',
        location: formLocation.trim() || 'Lagos, Nigeria',
        systemScope: resolvedScope,
        cmsRole: formCmsRole,
        portalRole: formPortalRole,
        status: formStatus,
        passwordPlain: formPassword,
        mustChangePassword: formMustChangePassword,
        twoFactorRequired: formTwoFactorRequired,
        customPermissions: formPermissions,
      });
      showToast(
        `Created user "${created.fullName}" (${created.email}) with assigned role(s).`
      );
    }

    setIsUserModalOpen(false);
  };

  const handleCopyCredentials = () => {
    const text = `Samstrust Technologies Limited (RC 9898142) - Account Credentials\nName: ${formFullName}\nEmail: ${formEmail}\nPassword: ${formPassword}\nCMS Role: ${formCmsRole}\nPortal Role: ${formPortalRole}`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2500);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newResetPassword.trim()) return;
    resetManagedUserPassword(
      passwordModalUser.id,
      newResetPassword.trim(),
      resetMustChange
    );
    showToast(`Password reset for ${passwordModalUser.fullName} (${passwordModalUser.email}).`);
    setPasswordModalUser(null);
  };

  const handleImpersonateUser = (user: ManagedUserAccount) => {
    loginAsManagedUser(user);
    if (user.portalRole !== 'none') {
      switchPortalRole(user.portalRole);
    }
    showToast(
      `Active session switched to ${user.fullName} (CMS: ${user.cmsRole} | Portal: ${user.portalRole}).`
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastBanner && (
        <div className="p-4 rounded-2xl bg-[#164E3D] text-white border border-[#D4AF37] shadow-lg flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <span>{toastBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastBanner(null)}
            className="text-emerald-200 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Section Header */}
      <div className="bg-white rounded-2xl border border-[#E2ECE7] p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EBF3F0] text-[#164E3D] text-[11px] font-mono font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-[#AD8921]" />
            <span>Identity, Access &amp; Role Governance (RBAC)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#164E3D] tracking-tight">
            User Management &amp; Role Assignment Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Create staff and client accounts, assign CMS and Enterprise Portal roles, manage granular module permissions, enforce 2FA security, and issue temporary credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenCreateModal('live-desk-agent', 'coordinator')}
            className="px-4 py-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#164E3D] border border-teal-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-teal-700" />
            <span>+ Assign Live Desk &amp; WhatsApp User</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateModal('editor', 'coordinator')}
            className="px-5 py-3 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create New User &amp; Assign Role</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            Total Directory Users
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#164E3D] font-mono">{stats.total}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats.activeCount} Active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            Super Administrators
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#AD8921] font-mono">
              {stats.adminCount}
            </span>
            <span className="text-[11px] text-slate-500">Full Authority</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            Internal Staff &amp; Engineers
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800 font-mono">
              {stats.staffCount}
            </span>
            <span className="text-[11px] text-slate-500">CMS &amp; Field Ops</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            Enterprise Customers
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700 font-mono">
              {stats.clientCount}
            </span>
            <span className="text-[11px] text-slate-500">Client Portal</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            WhatsApp &amp; Live Chat Desk
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-teal-700 font-mono">
              {stats.liveDeskAssignedCount} / {stats.total}
            </span>
            <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
              Assigned Control
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2ECE7] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('directory')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'directory'
                ? 'bg-[#164E3D] text-[#D4AF37] shadow-sm'
                : 'bg-white text-slate-600 border border-[#E2ECE7] hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Directory &amp; Role Assignment ({managedUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('roles-matrix')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'roles-matrix'
                ? 'bg-[#164E3D] text-[#D4AF37] shadow-sm'
                : 'bg-white text-slate-600 border border-[#E2ECE7] hover:bg-slate-50'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Role Definitions &amp; RBAC Permission Matrix</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Changes sync immediately with Staff &amp; Client Login (`/login`)</span>
        </div>
      </div>

      {/* =====================================================================
          SUB-TAB 1: USER DIRECTORY & ROLE ASSIGNMENT
         ===================================================================== */}
      {subTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by full name, email, job title, organization, or ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#164E3D]"
              >
                <option value="all">All Assigned Roles</option>
                <optgroup label="Live Support &amp; Chat Control">
                  <option value="perm:livedesk">Assigned: WhatsApp &amp; Live Chat Control</option>
                  <option value="cms:live-desk-agent">CMS Role: Live Desk &amp; WhatsApp Control</option>
                </optgroup>
                <optgroup label="CMS Administrative Roles">
                  <option value="cms:super-admin">CMS: Super Admin</option>
                  <option value="cms:editor">CMS: Content Editor</option>
                  <option value="cms:sales-reviewer">CMS: Sales Reviewer</option>
                </optgroup>
                <optgroup label="Enterprise Portal Roles">
                  <option value="portal:portal-admin">Portal: Super Admin</option>
                  <option value="portal:accounts-sales">Portal: Accounts &amp; Sales</option>
                  <option value="portal:coordinator">Portal: Service Coordinator</option>
                  <option value="portal:technician">Portal: Field Technician</option>
                  <option value="portal:customer">Portal: Registered Customer</option>
                </optgroup>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#164E3D]"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending Activation">Pending Activation</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F8F6] border-b border-[#E2ECE7] text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">User Identity &amp; Organization</th>
                    <th className="py-3.5 px-4">Assign CMS Role</th>
                    <th className="py-3.5 px-4">Assign Enterprise Portal Role</th>
                    <th className="py-3.5 px-4">WhatsApp &amp; Live Chat Control</th>
                    <th className="py-3.5 px-4">Status &amp; Security</th>
                    <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No user accounts match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const initials = user.fullName
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase() || 'U')
                        .join('');

                      const isPrimaryAdmin = user.email === 'admin@samstrusttech.com';
                      const hasLiveDeskControl =
                        user.cmsRole === 'super-admin' ||
                        user.cmsRole === 'live-desk-agent' ||
                        Boolean(user.customPermissions?.includes('cms.livedesk.control'));

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-[#F4F8F6]/60 transition-colors"
                        >
                          {/* 1. User Identity */}
                          <td className="py-4 px-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#164E3D] text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0 border border-[#D4AF37]/40">
                                {initials}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">
                                    {user.fullName}
                                  </span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                    {user.id}
                                  </span>
                                </div>
                                <div className="text-xs font-medium text-[#164E3D]">
                                  {user.jobTitle}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                  <span className="inline-flex items-center gap-1 font-mono">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    {user.email}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-slate-400" />
                                    {user.organization}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Inline CMS Role Selector */}
                          <td className="py-4 px-4">
                            <select
                              value={user.cmsRole}
                              onChange={(e) => {
                                const nextCmsRole = e.target.value as CmsRole | 'none';
                                assignUserRoles(user.id, nextCmsRole, user.portalRole);
                                showToast(
                                  `Updated ${user.fullName}'s CMS role to "${nextCmsRole}".`
                                );
                              }}
                              className={`w-full max-w-[205px] px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${
                                user.cmsRole === 'super-admin'
                                  ? 'bg-[#D4AF37]/20 text-[#0E3529] border-[#D4AF37]'
                                  : user.cmsRole === 'live-desk-agent'
                                  ? 'bg-teal-50 text-teal-900 border-teal-300'
                                  : user.cmsRole === 'editor'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                  : user.cmsRole === 'sales-reviewer'
                                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                            >
                              {CMS_ROLE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <div className="text-[10px] text-slate-400 mt-1">
                              Scope: {user.systemScope}
                            </div>
                          </td>

                          {/* 3. Inline Enterprise Portal Role Selector */}
                          <td className="py-4 px-4">
                            <select
                              value={user.portalRole}
                              onChange={(e) => {
                                const nextPortalRole = e.target.value as PortalRole | 'none';
                                assignUserRoles(user.id, user.cmsRole, nextPortalRole);
                                showToast(
                                  `Updated ${user.fullName}'s Enterprise Portal role to "${nextPortalRole}".`
                                );
                              }}
                              className={`w-full max-w-[205px] px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${
                                user.portalRole === 'portal-admin'
                                  ? 'bg-purple-50 text-purple-900 border-purple-300'
                                  : user.portalRole === 'accounts-sales'
                                  ? 'bg-sky-50 text-sky-900 border-sky-300'
                                  : user.portalRole === 'coordinator'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : user.portalRole === 'technician'
                                  ? 'bg-teal-50 text-teal-900 border-teal-300'
                                  : user.portalRole === 'customer'
                                  ? 'bg-emerald-50 text-[#164E3D] border-emerald-300'
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                            >
                              {PORTAL_ROLE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {user.customPermissions?.length || 0} active permissions
                            </div>
                          </td>

                          {/* 4. WhatsApp Live Desk & On-Site Live Chat Control Assignment */}
                          <td className="py-4 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                toggleUserLiveDeskControl(user.id);
                                showToast(
                                  hasLiveDeskControl
                                    ? `Revoked WhatsApp Live Desk & On-Site Live Chat Control from ${user.fullName}.`
                                    : `Assigned WhatsApp Live Desk & On-Site Live Chat Control to ${user.fullName}.`
                                );
                              }}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                hasLiveDeskControl
                                  ? 'bg-teal-50 text-[#164E3D] border-teal-300 hover:bg-teal-100 shadow-2xs'
                                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                              }`}
                              title={
                                hasLiveDeskControl
                                  ? 'Click to unassign / revoke WhatsApp Live Desk & Live Chat Control'
                                  : 'Click to assign WhatsApp Live Desk & Live Chat Control to this user'
                              }
                            >
                              <MessageCircle
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  hasLiveDeskControl ? 'text-emerald-600' : 'text-slate-400'
                                }`}
                              />
                              <span>
                                {hasLiveDeskControl ? 'Assigned Control' : 'Assign Live Desk'}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                                  hasLiveDeskControl
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {hasLiveDeskControl ? 'ON' : 'OFF'}
                              </span>
                            </button>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {hasLiveDeskControl
                                ? 'Can enable/disable & reply to chats'
                                : 'No Live Desk control'}
                            </div>
                          </td>

                          {/* 5. Status & Security */}
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  user.status === 'Active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : user.status === 'Pending Activation'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    user.status === 'Active'
                                      ? 'bg-emerald-600'
                                      : user.status === 'Pending Activation'
                                      ? 'bg-amber-600'
                                      : 'bg-rose-600'
                                  }`}
                                />
                                {user.status}
                              </span>

                              {user.twoFactorRequired && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold border border-slate-200">
                                  2FA
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {user.lastLoginAt
                                ? `Last login: ${user.lastLoginAt}`
                                : `Created: ${user.createdAt}`}
                            </div>
                          </td>

                          {/* 6. Actions */}
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(user)}
                                className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-[#164E3D] hover:bg-[#164E3D] hover:text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                title="Edit User Profile, Assigned Roles & Permissions"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {(user.cmsRole !== 'none' ||
                                user.portalRole !== 'none' ||
                                hasLiveDeskControl) && (
                                <button
                                  type="button"
                                  onClick={() => handleUnassignAllRoles(user)}
                                  className="px-2 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-900 hover:bg-amber-100 text-[11px] font-semibold transition-colors cursor-pointer"
                                  title="Unassign all roles & Live Desk control from this user"
                                >
                                  Unassign
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleImpersonateUser(user)}
                                className="px-2 py-1.5 rounded-lg bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                title="Switch active session to this user to test their role permissions"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Switch</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setPasswordModalUser(user);
                                  setNewResetPassword(generateStrongPassword());
                                  setResetMustChange(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-[#AD8921] hover:border-amber-200 transition-colors cursor-pointer"
                                title="Reset / Issue Temporary Password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  toggleManagedUserStatus(user.id);
                                  showToast(
                                    `${
                                      user.status === 'Active' ? 'Suspended' : 'Activated'
                                    } account for ${user.fullName}.`
                                  );
                                }}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  user.status === 'Active'
                                    ? 'border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                                title={
                                  user.status === 'Active'
                                    ? 'Suspend User Account'
                                    : 'Activate User Account'
                                }
                              >
                                {user.status === 'Active' ? (
                                  <XCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {confirmDeleteId === user.id ? (
                                <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-lg">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (managedUsers.length <= 1) {
                                        showToast(
                                          'Cannot delete the last remaining user account in the system.'
                                        );
                                        setConfirmDeleteId(null);
                                        return;
                                      }
                                      deleteManagedUser(user.id);
                                      setConfirmDeleteId(null);
                                      showToast(`Deleted user account ${user.fullName}.`);
                                    }}
                                    className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                                  >
                                    Confirm Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(user.id)}
                                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-600 hover:text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Delete User Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: ROLE DEFINITIONS & RBAC PERMISSION MATRIX
         ===================================================================== */}
      {subTab === 'roles-matrix' && (
        <div className="space-y-6">
          {/* WhatsApp Live Desk & On-Site Live Chat Assigned Users Panel */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#164E3D] flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#AD8921]" />
                  <span>
                    WhatsApp Live Desk &amp; On-Site Live Chat Assigned Operators
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Edit, unassign, or delete users currently assigned to control visitor WhatsApp Live Desk &amp; On-Site Live Web Chat.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const targetId = e.target.value;
                    if (!targetId) return;
                    const targetUser = managedUsers.find((u) => u.id === targetId);
                    if (targetUser) {
                      toggleUserLiveDeskControl(targetUser.id);
                      showToast(
                        `Assigned WhatsApp Live Desk & On-Site Live Chat Control to ${targetUser.fullName}.`
                      );
                    }
                    e.target.value = '';
                  }}
                  className="px-3 py-2 rounded-xl border border-teal-300 bg-teal-50/60 text-xs font-bold text-[#164E3D] focus:outline-none cursor-pointer"
                >
                  <option value="">+ Assign Existing User to Live Desk...</option>
                  {managedUsers
                    .filter(
                      (u) =>
                        u.cmsRole !== 'super-admin' &&
                        u.cmsRole !== 'live-desk-agent' &&
                        !u.customPermissions?.includes('cms.livedesk.control')
                    )
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email})
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('live-desk-agent', 'coordinator')}
                  className="px-3.5 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] text-xs font-bold hover:bg-[#0E3529] transition-colors cursor-pointer"
                >
                  + Create &amp; Assign New Operator
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {managedUsers
                .filter(
                  (u) =>
                    u.cmsRole === 'super-admin' ||
                    u.cmsRole === 'live-desk-agent' ||
                    u.customPermissions?.includes('cms.livedesk.control')
                )
                .map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{u.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                        <div className="text-[11px] text-[#164E3D] font-medium mt-0.5">
                          {u.jobTitle} &bull; CMS: {u.cmsRole}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-mono uppercase font-bold">
                        Assigned
                      </span>
                    </div>

                    <div className="pt-2.5 border-t border-teal-200/60 flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(u)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#164E3D] hover:bg-[#164E3D] hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          toggleUserLiveDeskControl(u.id);
                          showToast(
                            `Unassigned WhatsApp Live Desk & On-Site Live Chat Control from ${u.fullName}.`
                          );
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-[11px] font-semibold cursor-pointer"
                      >
                        Unassign
                      </button>

                      {confirmDeleteId === u.id ? (
                        <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-300 px-2 py-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => {
                              if (managedUsers.length <= 1) {
                                showToast('Cannot delete the last remaining user.');
                                setConfirmDeleteId(null);
                                return;
                              }
                              deleteManagedUser(u.id);
                              setConfirmDeleteId(null);
                              showToast(`Deleted user ${u.fullName}.`);
                            }}
                            className="text-[10px] font-bold text-rose-700 hover:underline cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* CMS Roles Breakdown */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#164E3D]">
                  1. Website Administrative CMS Roles (`/admin`)
                </h2>
                <p className="text-xs text-slate-500">
                  Roles governing public content, equipment catalog, media library, and incoming RFQ triage. Edit, unassign, or delete assigned users directly below.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CMS_ROLE_OPTIONS.filter((r) => r.value !== 'none').map((role) => {
                const assignedUsersForRole = managedUsers.filter(
                  (u) => u.cmsRole === role.value
                );
                const assignedCount = assignedUsersForRole.length;
                return (
                  <div
                    key={role.value}
                    className="p-5 rounded-2xl border border-[#E2ECE7] bg-[#F4F8F6]/50 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${role.badgeClass}`}
                        >
                          {role.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#164E3D]">
                          {assignedCount} {assignedCount === 1 ? 'User' : 'Users'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {role.description}
                      </p>

                      {/* Assigned Users List with Edit / Unassign / Delete */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          Assigned Users ({assignedCount})
                        </span>
                        {assignedUsersForRole.length === 0 ? (
                          <div className="text-[11px] text-slate-400 italic py-1">
                            No users currently assigned
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                            {assignedUsersForRole.map((u) => (
                              <div
                                key={u.id}
                                className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-1.5 text-[11px]"
                              >
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-800 truncate">
                                    {u.fullName}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400 truncate">
                                    {u.email}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(u)}
                                    className="px-1.5 py-1 rounded bg-emerald-50 text-[#164E3D] hover:bg-[#164E3D] hover:text-white font-bold text-[10px] cursor-pointer"
                                    title="Edit Assigned User"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      assignUserRoles(u.id, 'none', u.portalRole);
                                      showToast(
                                        `Unassigned ${u.fullName} from CMS role "${role.label}".`
                                      );
                                    }}
                                    className="px-1.5 py-1 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold text-[10px] cursor-pointer"
                                    title="Unassign from this CMS role"
                                  >
                                    Unassign
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (managedUsers.length <= 1) {
                                        showToast('Cannot delete the last remaining user.');
                                        return;
                                      }
                                      deleteManagedUser(u.id);
                                      showToast(`Deleted user ${u.fullName}.`);
                                    }}
                                    className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white cursor-pointer"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRoleFilter(`cms:${role.value}`);
                          setSubTab('directory');
                        }}
                        className="text-xs font-semibold text-slate-600 hover:text-[#164E3D] cursor-pointer"
                      >
                        Filter in Directory &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCreateModal(role.value as CmsRole, 'none')
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#164E3D] text-[#D4AF37] text-[11px] font-bold hover:bg-[#0E3529] transition-colors cursor-pointer"
                      >
                        + Add {role.label.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enterprise Portal Roles Breakdown */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#164E3D]">
                  2. Enterprise Operations Portal Roles (`/portal`)
                </h2>
                <p className="text-xs text-slate-500">
                  5-tier operational RBAC governing equipment passports, field service dispatch, ISO/IEC 17025 calibration benches, and commercial billing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {PORTAL_ROLE_OPTIONS.filter((r) => r.value !== 'none').map((role) => {
                const assignedUsersForRole = managedUsers.filter(
                  (u) => u.portalRole === role.value
                );
                const assignedCount = assignedUsersForRole.length;
                return (
                  <div
                    key={role.value}
                    className="p-4 rounded-2xl border border-[#E2ECE7] bg-[#F4F8F6]/50 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${role.badgeClass}`}
                        >
                          {role.label}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-[#164E3D]">
                        {assignedCount} Assigned {assignedCount === 1 ? 'Account' : 'Accounts'}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {role.description}
                      </p>

                      {/* Assigned Users List with Edit / Unassign / Delete */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                        {assignedUsersForRole.length === 0 ? (
                          <div className="text-[10px] text-slate-400 italic py-1">
                            No users assigned
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                            {assignedUsersForRole.map((u) => (
                              <div
                                key={u.id}
                                className="p-2 rounded-xl bg-white border border-slate-200/80 flex flex-col gap-1.5 text-[11px]"
                              >
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-800 truncate">
                                    {u.fullName}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400 truncate">
                                    {u.email}
                                  </div>
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(u)}
                                    className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#164E3D] hover:bg-[#164E3D] hover:text-white font-bold text-[10px] cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      assignUserRoles(u.id, u.cmsRole, 'none');
                                      showToast(
                                        `Unassigned ${u.fullName} from Portal role "${role.label}".`
                                      );
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold text-[10px] cursor-pointer"
                                  >
                                    Unassign
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (managedUsers.length <= 1) {
                                        showToast('Cannot delete the last remaining user.');
                                        return;
                                      }
                                      deleteManagedUser(u.id);
                                      showToast(`Deleted user ${u.fullName}.`);
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-[10px] cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/70 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCreateModal('none', role.value as PortalRole)
                        }
                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#164E3D] text-[#D4AF37] text-[11px] font-bold hover:bg-[#0E3529] transition-colors cursor-pointer"
                      >
                        + Create {role.label.split(' ')[0]} User
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRoleFilter(`portal:${role.value}`);
                          setSubTab('directory');
                        }}
                        className="w-full py-1 text-[11px] font-semibold text-slate-600 hover:text-[#164E3D] cursor-pointer"
                      >
                        Filter Users ({assignedCount})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive 5-Role Portal RBAC Matrix */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#164E3D]">
                  3. Interactive Role-Based Access Control (RBAC) Matrix
                </h2>
                <p className="text-xs text-slate-500">
                  Click any role cell to grant or revoke module capabilities across the 5 Enterprise Portal roles.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#AD8921] font-bold">
                LIVE POLICY ENFORCEMENT
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F8F6] border-b border-[#E2ECE7] text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Capability / Action</th>
                    <th className="py-3 px-3 text-center">Customer</th>
                    <th className="py-3 px-3 text-center">Technician</th>
                    <th className="py-3 px-3 text-center">Coordinator</th>
                    <th className="py-3 px-3 text-center">Accounts/Sales</th>
                    <th className="py-3 px-3 text-center">Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rbacMatrix.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-[#164E3D]">{row.moduleName}</td>
                      <td className="py-3 px-4 text-slate-700">{row.capability}</td>
                      {(
                        [
                          'customer',
                          'technician',
                          'coordinator',
                          'accounts-sales',
                          'portal-admin',
                        ] as PortalRole[]
                      ).map((roleKey) => {
                        const granted = row.permissions[roleKey];
                        return (
                          <td key={roleKey} className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                toggleRbacPermission(row.id, roleKey);
                                showToast(
                                  `Updated RBAC policy "${row.capability}" for role [${roleKey}].`
                                );
                              }}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                                granted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                              }`}
                              title={`Toggle ${row.capability} for ${roleKey}`}
                            >
                              {granted ? (
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: CREATE / EDIT USER & ASSIGN ROLES
         ===================================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E2ECE7] shadow-2xl max-w-3xl w-full overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-[#164E3D] text-white px-6 py-5 flex items-center justify-between border-b border-emerald-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-white">
                    {editingUser
                      ? `Edit User & Role Assignment — ${editingUser.fullName}`
                      : 'Create New User Account & Assign Roles'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Provision identity, assign CMS and Enterprise Portal roles, and configure security credentials.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Step 1: Identity & Organization */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921] border-b border-slate-100 pb-1.5">
                  1. User Profile &amp; Corporate Particulars
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      placeholder="e.g. Engr. Musa Abdullahi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Corporate Email (Sign-In Username) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. m.abdullahi@samstrusttech.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#164E3D] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Job Title / Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={formJobTitle}
                      onChange={(e) => setFormJobTitle(e.target.value)}
                      placeholder="e.g. Senior Metrology Engineer"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Direct Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization / Company
                    </label>
                    <input
                      type="text"
                      value={formOrganization}
                      onChange={(e) => setFormOrganization(e.target.value)}
                      placeholder="Samstrust Technologies Limited"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department &amp; Hub Location
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. Ikeja HQ, Lagos / Port Harcourt Hub"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Role Assignment */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921] border-b border-slate-100 pb-1.5">
                  2. Assign System Scope &amp; Roles
                </h4>

                {/* Scope Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      'Both (CMS & Portal)',
                      'CMS Only',
                      'Enterprise Portal Only',
                    ] as SystemAccessScope[]
                  ).map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => handleScopeChange(scope)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formSystemScope === scope
                          ? 'bg-[#164E3D] text-[#D4AF37] border-[#164E3D] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {scope}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CMS Role Dropdown */}
                  <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-2">
                    <label className="block text-xs font-extrabold text-[#164E3D]">
                      Website CMS Role (`/admin`)
                    </label>
                    <select
                      value={formCmsRole}
                      onChange={(e) =>
                        handleCmsRoleSelect(e.target.value as CmsRole | 'none')
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#164E3D]"
                    >
                      {CMS_ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {
                        CMS_ROLE_OPTIONS.find((o) => o.value === formCmsRole)
                          ?.description
                      }
                    </p>
                  </div>

                  {/* Enterprise Portal Role Dropdown */}
                  <div className="p-4 rounded-2xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-2">
                    <label className="block text-xs font-extrabold text-[#164E3D]">
                      Enterprise Portal Role (`/portal`)
                    </label>
                    <select
                      value={formPortalRole}
                      onChange={(e) =>
                        handlePortalRoleSelect(e.target.value as PortalRole | 'none')
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#164E3D]"
                    >
                      {PORTAL_ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {
                        PORTAL_ROLE_OPTIONS.find((o) => o.value === formPortalRole)
                          ?.description
                      }
                    </p>
                  </div>
                </div>

                {/* Direct WhatsApp Live Desk & On-Site Live Chat Control Assignment Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    formPermissions.includes('cms.livedesk.control') ||
                    formCmsRole === 'live-desk-agent' ||
                    formCmsRole === 'super-admin'
                      ? 'bg-teal-50/70 border-teal-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        formPermissions.includes('cms.livedesk.control') ||
                        formCmsRole === 'live-desk-agent' ||
                        formCmsRole === 'super-admin'
                          ? 'bg-[#164E3D] text-[#D4AF37]'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#164E3D]">
                          WhatsApp Live Desk &amp; On-Site Live Chat Control
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            formPermissions.includes('cms.livedesk.control') ||
                            formCmsRole === 'live-desk-agent' ||
                            formCmsRole === 'super-admin'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {formPermissions.includes('cms.livedesk.control') ||
                          formCmsRole === 'live-desk-agent' ||
                          formCmsRole === 'super-admin'
                            ? 'Assigned'
                            : 'Not Assigned'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Allow this user account to enable/disable the visitor WhatsApp Live Desk &amp; On-Site Live Chat widget, customize support desk settings, and reply to incoming live visitor chats.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const currentlyAssigned =
                        formPermissions.includes('cms.livedesk.control') ||
                        formCmsRole === 'live-desk-agent';
                      if (currentlyAssigned) {
                        setFormPermissions((prev) =>
                          prev.filter((p) => p !== 'cms.livedesk.control')
                        );
                        if (formCmsRole === 'live-desk-agent') {
                          setFormCmsRole('editor');
                        }
                      } else {
                        setFormPermissions((prev) =>
                          Array.from(new Set([...prev, 'cms.livedesk.control']))
                        );
                        if (formCmsRole === 'none') {
                          setFormCmsRole('live-desk-agent');
                        }
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      formPermissions.includes('cms.livedesk.control') ||
                      formCmsRole === 'live-desk-agent' ||
                      formCmsRole === 'super-admin'
                        ? 'bg-[#164E3D] text-[#D4AF37] shadow-xs hover:bg-[#0E3529]'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-[#164E3D]'
                    }`}
                  >
                    {formPermissions.includes('cms.livedesk.control') ||
                    formCmsRole === 'live-desk-agent' ||
                    formCmsRole === 'super-admin'
                      ? '✓ Assigned to User (Click to Revoke)'
                      : '+ Assign Live Desk & Chat Control'}
                  </button>
                </div>
              </div>

              {/* Step 3: Granular Module Permissions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
                    3. Granular Module Permissions ({formPermissions.length} Selected)
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormPermissions(
                        getDefaultPermissionsForRoles(formCmsRole, formPortalRole)
                      )
                    }
                    className="text-[11px] font-semibold text-[#164E3D] hover:underline cursor-pointer"
                  >
                    Reset to Role Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_GRANULAR_PERMISSIONS.map((perm) => {
                    const checked = formPermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          checked
                            ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermissionCheckbox(perm.id)}
                          className="mt-0.5 rounded text-[#164E3D] focus:ring-[#164E3D]"
                        />
                        <div>
                          <span className="block leading-snug">{perm.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {perm.category}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Credentials & Security Policy */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921] border-b border-slate-100 pb-1.5">
                  4. Security Credentials &amp; Account Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Login Password / Temporary Key *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showFormPassword ? 'text' : 'password'}
                          required
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFormPassword(!showFormPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showFormPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormPassword(generateStrongPassword())}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer shrink-0"
                        title="Generate random strong password"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Generate</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as UserAccountStatus)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#164E3D]"
                    >
                      <option value="Active">Active (Immediate Login Allowed)</option>
                      <option value="Pending Activation">Pending Activation</option>
                      <option value="Suspended">Suspended (Access Blocked)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap items-center gap-5">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formMustChangePassword}
                        onChange={(e) => setFormMustChangePassword(e.target.checked)}
                        className="rounded text-[#164E3D]"
                      />
                      <span>Force password change on next sign-in</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formTwoFactorRequired}
                        onChange={(e) => setFormTwoFactorRequired(e.target.checked)}
                        className="rounded text-[#164E3D]"
                      />
                      <span>Enforce 2FA (TOTP Challenge)</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-[#0E3529] hover:bg-amber-100 cursor-pointer"
                  >
                    {copiedCreds ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied Credentials!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#AD8921]" />
                        <span>Copy Login Details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                {editingUser ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormCmsRole('none');
                        setFormPortalRole('none');
                        setFormPermissions([]);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold cursor-pointer"
                    >
                      Clear / Unassign All Roles
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (managedUsers.length <= 1) {
                          setFormError('Cannot delete the last remaining user account.');
                          return;
                        }
                        deleteManagedUser(editingUser.id);
                        setIsUserModalOpen(false);
                        showToast(`Deleted user account ${editingUser.fullName}.`);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete User Account</span>
                    </button>
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#0E3529] text-[#D4AF37] text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    {editingUser ? 'Save User & Role Changes' : 'Create User & Assign Role'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: RESET / ISSUE TEMPORARY PASSWORD
         ===================================================================== */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2ECE7] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-[#164E3D] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm font-bold">Reset User Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs space-y-1">
                <div className="font-bold text-[#164E3D]">{passwordModalUser.fullName}</div>
                <div className="font-mono text-slate-500">{passwordModalUser.email}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New / Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showResetPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewResetPassword(generateStrongPassword())}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetMustChange}
                  onChange={(e) => setResetMustChange(e.target.checked)}
                  className="rounded text-[#164E3D]"
                />
                <span>Require user to change password on next sign-in</span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] text-xs font-bold uppercase tracking-wider hover:bg-[#0E3529] cursor-pointer"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
