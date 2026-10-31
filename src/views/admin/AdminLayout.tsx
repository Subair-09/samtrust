import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { NavTab } from '../../types';
import { CmsRole } from '../../types/cms';
import { AdminLogin } from './AdminLogin';
import { LoginView } from '../LoginView';
import { HeroSliderManager } from './HeroSliderManager';
import { ProductCatalogManager } from './ProductCatalogManager';
import { ServicesFaqManager } from './ServicesFaqManager';
import { LeadPipelineViewer } from './LeadPipelineViewer';
import { PagesContentManager } from './PagesContentManager';
import { UserRoleManager } from './UserRoleManager';
import { LiveChatDeskManager } from './LiveChatDeskManager';
import { generateAndPrintTutorialPdf } from '../../utils/generateTutorialPdf';
import {
  SlidersHorizontal,
  Package,
  Wrench,
  FileSpreadsheet,
  Globe,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Users,
  MessageCircle,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  BookOpen,
  Download,
} from 'lucide-react';

interface AdminLayoutProps {
  onNavigate: (tab: NavTab, subpageSlug?: string) => void;
  onOpenTutorialModal?: () => void;
}

type AdminTab = 'slider' | 'catalog' | 'pages' | 'services' | 'pipeline' | 'livedesk' | 'users';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigate, onOpenTutorialModal }) => {
  const {
    currentUser,
    loginAs,
    logout,
    rfqLeads,
    products,
    managedUsers,
    liveSupportConfig,
    liveChatSessions,
    canEditContent,
    canManageSales,
    canManageLiveDesk,
    isSuperAdmin,
  } = useCms();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>(() =>
    currentUser?.role === 'live-desk-agent' ? 'livedesk' : 'slider'
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // If not authenticated, display the unified secure login screen
  if (!currentUser) {
    return <LoginView onNavigate={onNavigate} targetRedirect="admin" />;
  }

  // Count new incoming RFQ leads & unread live chat messages
  const newLeadsCount = rfqLeads.filter((l) => l.status === 'New').length;
  const unreadChatCount = liveChatSessions.reduce((sum, s) => sum + s.unreadByAdmin, 0);
  const bothChannelsDisabled =
    !liveSupportConfig.whatsappEnabled && !liveSupportConfig.liveChatEnabled;

  const navItems = [
    {
      id: 'slider' as AdminTab,
      label: 'Hero Slider Manager',
      description: 'Manage homepage slides & scheduling',
      icon: <SlidersHorizontal className="w-5 h-5 shrink-0" />,
      allowed: canEditContent,
      badge: null,
    },
    {
      id: 'catalog' as AdminTab,
      label: 'Product Catalog',
      description: 'CRUD products, specs & media',
      icon: <Package className="w-5 h-5 shrink-0" />,
      allowed: canEditContent,
      badge: products.length,
    },
    {
      id: 'pages' as AdminTab,
      label: 'Pages Content Studio',
      description: 'Edit About, Services, Sectors & Contact',
      icon: <Layers className="w-5 h-5 shrink-0" />,
      allowed: canEditContent,
      badge: '4 Pages',
      badgeColor: 'bg-[#C5A059] text-[#0E3529]',
    },
    {
      id: 'services' as AdminTab,
      label: 'Services & FAQ',
      description: 'Calibration scopes, PPM & FAQs',
      icon: <Wrench className="w-5 h-5 shrink-0" />,
      allowed: canEditContent,
      badge: null,
    },
    {
      id: 'pipeline' as AdminTab,
      label: 'Lead & RFQ Pipeline',
      description: 'Triage inquiries & export CSV',
      icon: <FileSpreadsheet className="w-5 h-5 shrink-0" />,
      allowed: canManageSales,
      badge: newLeadsCount > 0 ? `${newLeadsCount} New` : null,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'livedesk' as AdminTab,
      label: 'Live Desk & WhatsApp',
      description: 'Enable/disable chat & WhatsApp desk',
      icon: <MessageCircle className="w-5 h-5 shrink-0" />,
      allowed: canManageLiveDesk || canEditContent || isSuperAdmin,
      badge: bothChannelsDisabled
        ? 'Disabled'
        : unreadChatCount > 0
        ? `${unreadChatCount} Chat`
        : 'Live',
      badgeColor: bothChannelsDisabled
        ? 'bg-slate-600 text-slate-200'
        : unreadChatCount > 0
        ? 'bg-amber-400 text-[#0E3529]'
        : 'bg-emerald-500 text-white',
    },
    {
      id: 'users' as AdminTab,
      label: 'Users & Role Access',
      description: 'Create users & assign RBAC roles',
      icon: <Users className="w-5 h-5 shrink-0" />,
      allowed: isSuperAdmin,
      badge: `${managedUsers.length} Users`,
      badgeColor: 'bg-[#D4AF37] text-[#0E3529]',
    },
  ];

  const handleRoleChange = (role: CmsRole) => {
    loginAs(role);
    setRoleDropdownOpen(false);
    if (role === 'live-desk-agent') {
      setActiveAdminTab('livedesk');
    } else if (role === 'sales-reviewer' && activeAdminTab !== 'pipeline' && activeAdminTab !== 'livedesk') {
      setActiveAdminTab('pipeline');
    }
  };

  const getRoleBadge = (role: CmsRole) => {
    switch (role) {
      case 'super-admin':
        return {
          label: 'Super Admin (Full Access)',
          color: 'bg-[#D4AF37] text-[#0A261D]',
        };
      case 'live-desk-agent':
        return {
          label: 'Live Desk & WhatsApp Control',
          color: 'bg-teal-500 text-white',
        };
      case 'editor':
        return {
          label: 'Content Editor (Catalog/Slider)',
          color: 'bg-emerald-700 text-white',
        };
      case 'sales-reviewer':
        return {
          label: 'Sales Reviewer (RFQ Pipeline)',
          color: 'bg-blue-600 text-white',
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <div className="min-h-screen bg-[#F4F8F6] text-[#1A2E26] font-sans flex flex-col md:flex-row antialiased">
      {/* -----------------------------------------------------------------------
          MOBILE TOP APP BAR
         ----------------------------------------------------------------------- */}
      <div className="md:hidden bg-[#164E3D] text-white px-4 py-3 flex items-center justify-between border-b border-emerald-900 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/aistudio/favicon_d10ca84b.jfif"
            alt="Samstrust Emblem"
            className="w-8 h-8 object-contain"
          />
          <div>
            <span className="font-bold text-sm tracking-tight block">Samstrust Admin CMS</span>
            <span className="text-[10px] text-emerald-300 font-mono">RC 9898142</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 rounded-lg bg-emerald-900/80 text-emerald-200 text-xs flex items-center gap-1 hover:text-white"
            title="Public Website"
          >
            <Globe className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-emerald-900/80 text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          LEFT ADMINISTRATIVE SIDEBAR
         ----------------------------------------------------------------------- */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-72 bg-[#164E3D] text-white flex flex-col z-40 transition-transform duration-300 border-r border-[#103E30] shadow-xl ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-900/70 bg-[#123F32] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/favicon_d10ca84b.jfif"
                alt="Samstrust Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                SAMSTRUST
              </span>
              <span className="text-[11px] font-semibold text-[#D4AF37] tracking-wider uppercase block">
                Enterprise CMS v2.4
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              RC 9898142
            </span>
          </div>
        </div>

        {/* Current Active User & Persona Strip */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-[#D4AF37] flex items-center justify-center font-bold text-sm text-[#D4AF37] overflow-hidden shrink-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentUser.name.charAt(0)}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-emerald-300 block truncate">
                {currentUser.title}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-900 flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${roleInfo.color}`}
            >
              {roleInfo.label.split(' ')[0]} {roleInfo.label.split(' ')[1]}
            </span>

            {/* Quick Persona Switcher Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="text-[11px] text-emerald-300 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
              >
                <span>Switch Role</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-2 w-56 rounded-xl bg-white shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Switch RBAC Persona
                    </div>
                    <button
                      onClick={() => handleRoleChange('super-admin')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 ${
                        currentUser.role === 'super-admin' ? 'bg-emerald-50 text-emerald-800 font-bold' : ''
                      }`}
                    >
                      <div>
                        <span className="block font-semibold">Super Admin</span>
                        <span className="text-[10px] text-slate-500">Unrestricted full control</span>
                      </div>
                      {currentUser.role === 'super-admin' && (
                        <span className="text-xs text-emerald-600 font-bold">&bull; Active</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleRoleChange('editor')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 ${
                        currentUser.role === 'editor' ? 'bg-emerald-50 text-emerald-800 font-bold' : ''
                      }`}
                    >
                      <div>
                        <span className="block font-semibold">Content Editor</span>
                        <span className="text-[10px] text-slate-500">Catalog, Sliders &amp; FAQs</span>
                      </div>
                      {currentUser.role === 'editor' && (
                        <span className="text-xs text-emerald-600 font-bold">&bull; Active</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleRoleChange('sales-reviewer')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 ${
                        currentUser.role === 'sales-reviewer' ? 'bg-emerald-50 text-emerald-800 font-bold' : ''
                      }`}
                    >
                      <div>
                        <span className="block font-semibold">Sales Reviewer</span>
                        <span className="text-[10px] text-slate-500">Lead Pipeline &amp; CSV Export</span>
                      </div>
                      {currentUser.role === 'sales-reviewer' && (
                        <span className="text-xs text-emerald-600 font-bold">&bull; Active</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleRoleChange('live-desk-agent')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 ${
                        currentUser.role === 'live-desk-agent' ? 'bg-emerald-50 text-emerald-800 font-bold' : ''
                      }`}
                    >
                      <div>
                        <span className="block font-semibold">Live Desk &amp; WhatsApp Control</span>
                        <span className="text-[10px] text-slate-500">Enable/Disable Chat &amp; Reply</span>
                      </div>
                      {currentUser.role === 'live-desk-agent' && (
                        <span className="text-xs text-emerald-600 font-bold">&bull; Active</span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400/80">
            Navigation Modules
          </div>

          {navItems.map((item) => {
            const isActive = activeAdminTab === item.id;
            const isAllowed = item.allowed;

            return (
              <button
                key={item.id}
                type="button"
                disabled={!isAllowed}
                onClick={() => {
                  if (isAllowed) {
                    setActiveAdminTab(item.id);
                    setMobileSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all text-xs font-semibold ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#0E3529] shadow-md font-bold'
                    : isAllowed
                    ? 'text-emerald-100 hover:bg-emerald-900 hover:text-white'
                    : 'text-emerald-500/50 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#0E3529]' : 'text-[#D4AF37]'}>
                    {item.icon}
                  </span>
                  <div>
                    <span className="block leading-tight">{item.label}</span>
                    <span
                      className={`text-[10px] block font-normal ${
                        isActive ? 'text-[#0E3529]/80' : 'text-emerald-300/70'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-[#0E3529] text-[#D4AF37]'
                        : item.badgeColor || 'bg-emerald-800 text-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions: Public Site Link & Logout */}
        <div className="p-4 border-t border-emerald-900 bg-[#123F32] space-y-2">
          <button
            type="button"
            onClick={() => {
              if (onOpenTutorialModal) {
                onOpenTutorialModal();
              } else {
                generateAndPrintTutorialPdf();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] transition-colors cursor-pointer border border-[#D4AF37]/40"
          >
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>Operational Guide &amp; PDF</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-xs font-semibold text-emerald-200 hover:text-white transition-colors cursor-pointer border border-emerald-800/60"
          >
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            <span>Return to Public Website</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of CMS</span>
          </button>
        </div>
      </aside>

      {/* -----------------------------------------------------------------------
          MAIN ADMINISTRATIVE CONTENT STAGE
         ----------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Desktop App Bar */}
        <header className="hidden md:flex h-16 bg-white border-b border-[#E2ECE7] px-8 items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider">
              Admin CMS Dashboard
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-[#164E3D]">
              {activeAdminTab === 'slider' && 'Homepage Hero Slider Manager'}
              {activeAdminTab === 'catalog' && 'Product & Equipment Catalog Manager'}
              {activeAdminTab === 'pages' && 'Pages & Public Content Management Studio'}
              {activeAdminTab === 'services' && 'Services & FAQ Content Manager'}
              {activeAdminTab === 'pipeline' && 'Lead & RFQ Inquiries Pipeline'}
              {activeAdminTab === 'livedesk' && 'WhatsApp Live Desk & On-Site Live Chat Control Console'}
              {activeAdminTab === 'users' && 'User Management & Role Assignment Console'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Guide & PDF Manual Button */}
            <button
              onClick={() => {
                if (onOpenTutorialModal) {
                  onOpenTutorialModal();
                } else {
                  generateAndPrintTutorialPdf();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-semibold text-[#0E3529] hover:bg-amber-100 transition-all cursor-pointer shadow-xs"
              title="Open System Tutorial or Download PDF Manual"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Platform Guide &amp; PDF</span>
            </button>

            {/* Active Role Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-medium">Signed in as:</span>
              <strong className="text-slate-900">{currentUser.name}</strong>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleInfo.color}`}
              >
                {currentUser.role}
              </span>
            </div>

            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-[#EBF3F0] hover:text-[#164E3D] hover:border-emerald-300 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#AD8921]" />
              <span>View Live Site</span>
            </button>
          </div>
        </header>

        {/* Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeAdminTab === 'slider' && <HeroSliderManager />}
          {activeAdminTab === 'catalog' && <ProductCatalogManager />}
          {activeAdminTab === 'pages' && (
            <PagesContentManager
              onNavigateToPublicPage={(tab) => onNavigate(tab)}
              onNavigateToSubpage={(slug) => onNavigate('subpage', slug)}
            />
          )}
          {activeAdminTab === 'services' && <ServicesFaqManager />}
          {activeAdminTab === 'pipeline' && <LeadPipelineViewer />}
          {activeAdminTab === 'livedesk' && <LiveChatDeskManager />}
          {activeAdminTab === 'users' && <UserRoleManager contextMode="cms" />}
        </main>
      </div>
    </div>
  );
};
