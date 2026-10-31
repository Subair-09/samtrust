import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { NavTab, ServiceItem, IndustrySolution } from '../../types';
import {
  AboutCoreValue,
  AboutQualityStandard,
  AboutLeader,
  CalibrationScopeItem,
  AmcSlaTierItem,
  ContactCardItem,
  OfficeLocationItem,
} from '../../types/cms';
import {
  FileText,
  Building2,
  Wrench,
  Layers,
  Phone,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  Award,
  Users,
  Target,
  Compass,
  FlaskConical,
  Cog,
  Gauge,
  Scale,
  Sparkles,
  Info,
  Clock,
  Mail,
  MapPin,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { SubpagesManager } from './SubpagesManager';

interface PagesContentManagerProps {
  onNavigateToPublicPage?: (tab: NavTab) => void;
  onNavigateToSubpage?: (slug: string) => void;
}

type PageSection = 'about' | 'services' | 'industries' | 'contact' | 'subpages';

export const PagesContentManager: React.FC<PagesContentManagerProps> = ({
  onNavigateToPublicPage,
  onNavigateToSubpage,
}) => {
  const {
    aboutContent,
    updateAboutContent,
    servicesContent,
    updateServicesContent,
    industriesContent,
    updateIndustriesContent,
    contactContent,
    updateContactContent,
    resetPageContentToDefault,
    subpages,
    canEditContent,
  } = useCms();

  const [activeSection, setActiveSection] = useState<PageSection>('about');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Local draft states initialized from context
  const [aboutDraft, setAboutDraft] = useState(aboutContent);
  const [servicesDraft, setServicesDraft] = useState(servicesContent);
  const [industriesDraft, setIndustriesDraft] = useState(industriesContent);
  const [contactDraft, setContactDraft] = useState(contactContent);

  // Active sub-item editors
  const [activeLeaderIdx, setActiveLeaderIdx] = useState<number | null>(null);
  const [activeServiceIdx, setActiveServiceIdx] = useState<number | null>(0);
  const [activeScopeIdx, setActiveScopeIdx] = useState<number | null>(0);
  const [activeIndustryIdx, setActiveIndustryIdx] = useState<number | null>(0);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3500);
  };

  const handleSaveAbout = () => {
    updateAboutContent(aboutDraft);
    showNotification('About Us page content successfully updated and published to the live site!');
  };

  const handleSaveServices = () => {
    updateServicesContent(servicesDraft);
    showNotification('Services & Metrology page content updated and published to the live site!');
  };

  const handleSaveIndustries = () => {
    updateIndustriesContent(industriesDraft);
    showNotification('Industries & Case Studies page content updated and published to the live site!');
  };

  const handleSaveContact = () => {
    updateContactContent(contactDraft);
    showNotification('Company Contact & Headquarters details updated and published to the live site!');
  };

  const handleResetSection = (section: PageSection) => {
    if (section === 'subpages') return;
    if (
      window.confirm(
        `Are you sure you want to revert the ${section.toUpperCase()} page content to official factory defaults? Any unsaved edits will be lost.`
      )
    ) {
      resetPageContentToDefault(section);
      if (section === 'about') setAboutDraft(aboutContent);
      if (section === 'services') setServicesDraft(servicesContent);
      if (section === 'industries') setIndustriesDraft(industriesContent);
      if (section === 'contact') setContactDraft(contactContent);
      showNotification(`Reverted ${section} page to factory defaults.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
          TOP BAR & NAVIGATION TABS
         ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EBF3F0] text-[#164E3D]">
                <FileText className="w-5 h-5 text-[#C5A059]" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#164E3D]">
                Pages &amp; Content Management Studio
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live content editor for Samstrust Technologies public pages. Edit hero banners, mission statements, technical service scopes, industrial case studies, and corporate directory info.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onNavigateToPublicPage && activeSection !== 'subpages' && (
              <button
                type="button"
                onClick={() => onNavigateToPublicPage(activeSection as NavTab)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer border border-slate-200"
                title="Preview this page on the public website"
              >
                <Eye className="w-3.5 h-3.5 text-[#164E3D]" />
                <span>View {activeSection.toUpperCase()} on Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            )}

            {activeSection !== 'subpages' && (
              <button
                type="button"
                disabled={!canEditContent}
                onClick={() => handleResetSection(activeSection)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold transition-all cursor-pointer border border-rose-200 disabled:opacity-50"
                title="Reset current page to default template"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Default</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Banner */}
        {saveSuccessMsg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Page Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveSection('about')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'about'
                ? 'bg-[#164E3D] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#C5A059]" />
            <span>About Us Page</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('services')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'services'
                ? 'bg-[#164E3D] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4 text-[#C5A059]" />
            <span>Services &amp; Metrology Page</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('industries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'industries'
                ? 'bg-[#164E3D] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C5A059]" />
            <span>Industries &amp; Case Studies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('contact')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'contact'
                ? 'bg-[#164E3D] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Phone className="w-4 h-4 text-[#C5A059]" />
            <span>Contact &amp; Company Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('subpages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'subpages'
                ? 'bg-[#164E3D] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>Create Page ({subpages.length})</span>
          </button>
        </div>
      </div>

      {/* RBAC Notice if sales-reviewer */}
      {!canEditContent && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            You are currently signed in with <strong>Sales Reviewer</strong> permissions (Read-Only). Switch role in the sidebar to <strong>Super Admin</strong> or <strong>Content Editor</strong> to make changes.
          </span>
        </div>
      )}

      {/* -------------------------------------------------------------
          1. ABOUT US PAGE EDITOR
         ------------------------------------------------------------- */}
      {activeSection === 'about' && (
        <div className="space-y-6">
          {/* Header & Mission Section */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C5A059]" />
                  <span>About Us &bull; Hero Header &amp; Brand Story</span>
                </h3>
                <p className="text-xs text-slate-500">Corporate introductory heading, CAC accreditation tag, and seal narrative.</p>
              </div>
              <button
                type="button"
                disabled={!canEditContent}
                onClick={handleSaveAbout}
                className="btn-primary-gold py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save About Page</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tagline</label>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={aboutDraft.badge}
                  onChange={(e) => setAboutDraft({ ...aboutDraft, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#164E3D] focus:border-[#164E3D] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Main Title</label>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={aboutDraft.title}
                  onChange={(e) => setAboutDraft({ ...aboutDraft, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#164E3D] focus:border-[#164E3D] font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Subtitle / Executive Overview</label>
                <textarea
                  rows={3}
                  disabled={!canEditContent}
                  value={aboutDraft.subtitle}
                  onChange={(e) => setAboutDraft({ ...aboutDraft, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#164E3D] focus:border-[#164E3D]"
                />
              </div>
            </div>

            {/* Brand Motif Details (Flask & Gear) */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Brand Emblem Symbolism (Precision Lab Flask &amp; Industrial Gear)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#F8FAF9] border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-xs font-bold text-[#164E3D]">Laboratory Flask Description</span>
                  </div>
                  <input
                    type="text"
                    disabled={!canEditContent}
                    value={aboutDraft.flaskTitle}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, flaskTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                  />
                  <textarea
                    rows={2}
                    disabled={!canEditContent}
                    value={aboutDraft.flaskDescription}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, flaskDescription: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAF9] border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Cog className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-xs font-bold text-[#164E3D]">Industrial Gear Description</span>
                  </div>
                  <input
                    type="text"
                    disabled={!canEditContent}
                    value={aboutDraft.gearTitle}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, gearTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                  />
                  <textarea
                    rows={2}
                    disabled={!canEditContent}
                    value={aboutDraft.gearDescription}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, gearDescription: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Mission & Vision Statements */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#164E3D]">
                  <Target className="w-4 h-4 text-[#C5A059]" />
                  <span>Corporate Mission Statement</span>
                </div>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={aboutDraft.missionTitle}
                  onChange={(e) => setAboutDraft({ ...aboutDraft, missionTitle: e.target.value })}
                  placeholder="Mission Title"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                />
                <textarea
                  rows={3}
                  disabled={!canEditContent}
                  value={aboutDraft.missionStatement}
                  onChange={(e) => setAboutDraft({ ...aboutDraft, missionStatement: e.target.value })}
                  placeholder="Detailed mission..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#164E3D]">
                  <Compass className="w-4 h-4 text-[#C5A059]" />
                  <span>Corporate Vision Statement</span>
                </div>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={aboutDraft.visionTitle}
                  onChange={(e) => setAboutDraft({ ...aboutDraft, visionTitle: e.target.value })}
                  placeholder="Vision Title"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                />
                <textarea
                  rows={3}
                  disabled={!canEditContent}
                  value={aboutDraft.visionStatement}
                  onChange={(e) => setAboutDraft({ ...aboutDraft, visionStatement: e.target.value })}
                  placeholder="Detailed vision..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 3 Core Value Pillars */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Core Value Pillars (Precision, Quality, Reliability)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aboutDraft.coreValues.map((val, idx) => (
                <div key={val.id || idx} className="p-4 rounded-xl border border-slate-200 bg-[#FBFDFD] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#C5A059] uppercase">
                      Pillar 0{idx + 1}
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled={!canEditContent}
                    value={val.title}
                    onChange={(e) => {
                      const next = [...aboutDraft.coreValues];
                      next[idx].title = e.target.value;
                      setAboutDraft({ ...aboutDraft, coreValues: next });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#164E3D]"
                  />
                  <input
                    type="text"
                    disabled={!canEditContent}
                    value={val.tagline}
                    onChange={(e) => {
                      const next = [...aboutDraft.coreValues];
                      next[idx].tagline = e.target.value;
                      setAboutDraft({ ...aboutDraft, coreValues: next });
                    }}
                    placeholder="Tagline"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700"
                  />
                  <textarea
                    rows={3}
                    disabled={!canEditContent}
                    value={val.desc}
                    onChange={(e) => {
                      const next = [...aboutDraft.coreValues];
                      next[idx].desc = e.target.value;
                      setAboutDraft({ ...aboutDraft, coreValues: next });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Leadership Team Members */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C5A059]" />
                <span>Executive &amp; Technical Leadership Team ({aboutDraft.leadershipTeam.length})</span>
              </h3>
              <button
                type="button"
                disabled={!canEditContent}
                onClick={() => {
                  const newMember: AboutLeader = {
                    id: `lead-${Date.now()}`,
                    name: 'New Leadership Member',
                    role: 'Chief Technical Officer',
                    bio: 'Over 15 years leading calibration laboratory accreditation and metrology systems engineering.',
                  };
                  setAboutDraft({
                    ...aboutDraft,
                    leadershipTeam: [...aboutDraft.leadershipTeam, newMember],
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Leader</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aboutDraft.leadershipTeam.map((leader, idx) => (
                <div key={leader.id || idx} className="p-4 rounded-xl border border-slate-200 bg-[#FBFDFD] space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                      Leader #{idx + 1}
                    </span>
                    {aboutDraft.leadershipTeam.length > 1 && (
                      <button
                        type="button"
                        disabled={!canEditContent}
                        onClick={() => {
                          const next = aboutDraft.leadershipTeam.filter((_, i) => i !== idx);
                          setAboutDraft({ ...aboutDraft, leadershipTeam: next });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Name</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={leader.name}
                      onChange={(e) => {
                        const next = [...aboutDraft.leadershipTeam];
                        next[idx].name = e.target.value;
                        setAboutDraft({ ...aboutDraft, leadershipTeam: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#164E3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title / Role</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={leader.role}
                      onChange={(e) => {
                        const next = [...aboutDraft.leadershipTeam];
                        next[idx].role = e.target.value;
                        setAboutDraft({ ...aboutDraft, leadershipTeam: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Biography &amp; Qualifications</label>
                    <textarea
                      rows={3}
                      disabled={!canEditContent}
                      value={leader.bio}
                      onChange={(e) => {
                        const next = [...aboutDraft.leadershipTeam];
                        next[idx].bio = e.target.value;
                        setAboutDraft({ ...aboutDraft, leadershipTeam: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={!canEditContent}
              onClick={handleSaveAbout}
              className="btn-primary-gold py-2.5 px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Publish About Page Edits</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          2. SERVICES & METROLOGY PAGE EDITOR
         ------------------------------------------------------------- */}
      {activeSection === 'services' && (
        <div className="space-y-6">
          {/* Header text */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#C5A059]" />
                  <span>Services Hero &amp; Accreditation Banner</span>
                </h3>
                <p className="text-xs text-slate-500">Edit the primary headline, intro, and standards badges on the public Services page.</p>
              </div>
              <button
                type="button"
                disabled={!canEditContent}
                onClick={handleSaveServices}
                className="btn-primary-gold py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Services Page</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tagline</label>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={servicesDraft.badge}
                  onChange={(e) => setServicesDraft({ ...servicesDraft, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Title</label>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={servicesDraft.title}
                  onChange={(e) => setServicesDraft({ ...servicesDraft, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#164E3D]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Introductory Narrative</label>
                <textarea
                  rows={2}
                  disabled={!canEditContent}
                  value={servicesDraft.subtitle}
                  onChange={(e) => setServicesDraft({ ...servicesDraft, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Service Offerings (Installation, Calibration, PPM, Overhaul, Training, Audits) */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#C5A059]" />
                  <span>Technical Service Offerings ({servicesDraft.services.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Scopes of work, regulatory standards, and dispatch turnaround times.</p>
              </div>

              <button
                type="button"
                disabled={!canEditContent}
                onClick={() => {
                  const newSrv: ServiceItem = {
                    id: `serv-custom-${Date.now()}`,
                    title: 'Turnkey Metrology Consulting',
                    subtitle: 'Custom metrological audits and facility certification',
                    scope: [
                      'Preliminary site inspection & risk analysis',
                      'ISO/IEC 17025 conformity validation',
                      'Technical documentation and SOP preparation',
                    ],
                    standards: 'ISO/IEC 17025 & NMI Traceability',
                    turnaroundTime: '5-7 Working Days',
                    iconName: 'Award',
                    description: 'Custom engineering service package tailored for pharmaceutical and industrial plants.',
                  };
                  setServicesDraft({
                    ...servicesDraft,
                    services: [...servicesDraft.services, newSrv],
                  });
                  setActiveServiceIdx(servicesDraft.services.length);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            {/* Service selector tabs */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {servicesDraft.services.map((srv, idx) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => setActiveServiceIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeServiceIdx === idx
                      ? 'bg-[#164E3D] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{srv.title}</span>
                </button>
              ))}
            </div>

            {/* Currently selected service editor */}
            {activeServiceIdx !== null && servicesDraft.services[activeServiceIdx] && (
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-[#FBFDFD] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#164E3D] uppercase">
                    Editing: {servicesDraft.services[activeServiceIdx].title}
                  </span>
                  {servicesDraft.services.length > 1 && (
                    <button
                      type="button"
                      disabled={!canEditContent}
                      onClick={() => {
                        const next = servicesDraft.services.filter((_, i) => i !== activeServiceIdx);
                        setServicesDraft({ ...servicesDraft, services: next });
                        setActiveServiceIdx(Math.max(0, activeServiceIdx - 1));
                      }}
                      className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Service</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={servicesDraft.services[activeServiceIdx].title}
                      onChange={(e) => {
                        const next = [...servicesDraft.services];
                        next[activeServiceIdx].title = e.target.value;
                        setServicesDraft({ ...servicesDraft, services: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-[#164E3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Turnaround SLA Time</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={servicesDraft.services[activeServiceIdx].turnaroundTime}
                      onChange={(e) => {
                        const next = [...servicesDraft.services];
                        next[activeServiceIdx].turnaroundTime = e.target.value;
                        setServicesDraft({ ...servicesDraft, services: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-emerald-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle / Summary</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={servicesDraft.services[activeServiceIdx].subtitle}
                      onChange={(e) => {
                        const next = [...servicesDraft.services];
                        next[activeServiceIdx].subtitle = e.target.value;
                        setServicesDraft({ ...servicesDraft, services: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Accreditation Standards</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={servicesDraft.services[activeServiceIdx].standards}
                      onChange={(e) => {
                        const next = [...servicesDraft.services];
                        next[activeServiceIdx].standards = e.target.value;
                        setServicesDraft({ ...servicesDraft, services: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Icon Representation</label>
                    <select
                      disabled={!canEditContent}
                      value={servicesDraft.services[activeServiceIdx].iconName}
                      onChange={(e) => {
                        const next = [...servicesDraft.services];
                        next[activeServiceIdx].iconName = e.target.value;
                        setServicesDraft({ ...servicesDraft, services: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                    >
                      <option value="Wrench">Wrench (Mechanical / Commissioning)</option>
                      <option value="Gauge">Gauge (Calibration &amp; Flow)</option>
                      <option value="ShieldCheck">ShieldCheck (Preventive Maintenance)</option>
                      <option value="Cog">Cog (Overhaul &amp; Valve Rebuild)</option>
                      <option value="GraduationCap">GraduationCap (Operator Training)</option>
                      <option value="Award">Award (Compliance &amp; Audits)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Technical Description</label>
                    <textarea
                      rows={2}
                      disabled={!canEditContent}
                      value={servicesDraft.services[activeServiceIdx].description}
                      onChange={(e) => {
                        const next = [...servicesDraft.services];
                        next[activeServiceIdx].description = e.target.value;
                        setServicesDraft({ ...servicesDraft, services: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Deliverable Scope Items (One per line)
                    </label>
                    <textarea
                      rows={4}
                      disabled={!canEditContent}
                      value={servicesDraft.services[activeServiceIdx].scope.join('\n')}
                      onChange={(e) => {
                        const next = [...servicesDraft.services];
                        next[activeServiceIdx].scope = e.target.value.split('\n').filter((l) => l.trim().length > 0);
                        setServicesDraft({ ...servicesDraft, services: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Calibration Scopes & Uncertainties */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#C5A059]" />
              <span>Metrology Calibration Scopes &amp; Uncertainty Budgets ({servicesDraft.calibrationScopes.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servicesDraft.calibrationScopes.map((scope, idx) => (
                <div key={scope.id} className="p-4 rounded-xl border border-slate-200 bg-[#F8FAF9] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#164E3D]">{scope.domain}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {scope.standards}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Range Capacity</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={scope.range}
                      onChange={(e) => {
                        const next = [...servicesDraft.calibrationScopes];
                        next[idx].range = e.target.value;
                        setServicesDraft({ ...servicesDraft, calibrationScopes: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Measurement Uncertainty Budget (U)</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={scope.uncertainty}
                      onChange={(e) => {
                        const next = [...servicesDraft.calibrationScopes];
                        next[idx].uncertainty = e.target.value;
                        setServicesDraft({ ...servicesDraft, calibrationScopes: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Primary Reference Apparatus</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={scope.apparatus}
                      onChange={(e) => {
                        const next = [...servicesDraft.calibrationScopes];
                        next[idx].apparatus = e.target.value;
                        setServicesDraft({ ...servicesDraft, calibrationScopes: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AMC Service Level Agreement Tiers */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span>Annual Maintenance Contract (AMC) SLA Tiers ({servicesDraft.amcTiers.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {servicesDraft.amcTiers.map((tier, idx) => (
                <div key={tier.id} className="p-4 rounded-xl border border-slate-200 bg-[#FBFDFD] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#164E3D]">{tier.name}</span>
                    {tier.recommended && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C5A059] text-[#0E3529]">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Tagline</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={tier.tagline}
                      onChange={(e) => {
                        const next = [...servicesDraft.amcTiers];
                        next[idx].tagline = e.target.value;
                        setServicesDraft({ ...servicesDraft, amcTiers: next });
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Response Time SLA</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={tier.responseSLA}
                      onChange={(e) => {
                        const next = [...servicesDraft.amcTiers];
                        next[idx].responseSLA = e.target.value;
                        setServicesDraft({ ...servicesDraft, amcTiers: next });
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Planned Audits / Visits</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={tier.plannedVisits}
                      onChange={(e) => {
                        const next = [...servicesDraft.amcTiers];
                        next[idx].plannedVisits = e.target.value;
                        setServicesDraft({ ...servicesDraft, amcTiers: next });
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Calibration Discount</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={tier.calibrationDiscount}
                      onChange={(e) => {
                        const next = [...servicesDraft.amcTiers];
                        next[idx].calibrationDiscount = e.target.value;
                        setServicesDraft({ ...servicesDraft, amcTiers: next });
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={!canEditContent}
              onClick={handleSaveServices}
              className="btn-primary-gold py-2.5 px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Publish Services Edits</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          3. INDUSTRIES & CASE STUDIES PAGE EDITOR
         ------------------------------------------------------------- */}
      {activeSection === 'industries' && (
        <div className="space-y-6">
          {/* Header text */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C5A059]" />
                  <span>Industries Page Headline &amp; Overview</span>
                </h3>
                <p className="text-xs text-slate-500">Edit sector titles, regulatory frameworks, and audited industrial field deployments.</p>
              </div>
              <button
                type="button"
                disabled={!canEditContent}
                onClick={handleSaveIndustries}
                className="btn-primary-gold py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Industries Page</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tagline</label>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={industriesDraft.badge}
                  onChange={(e) => setIndustriesDraft({ ...industriesDraft, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Title</label>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={industriesDraft.title}
                  onChange={(e) => setIndustriesDraft({ ...industriesDraft, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#164E3D]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Executive Summary</label>
                <textarea
                  rows={2}
                  disabled={!canEditContent}
                  value={industriesDraft.subtitle}
                  onChange={(e) => setIndustriesDraft({ ...industriesDraft, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Industry Sectors Editor */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C5A059]" />
              <span>Target Sectors &amp; Case Studies ({industriesDraft.industries.length})</span>
            </h3>

            {/* Sector Tabs */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {industriesDraft.industries.map((ind, idx) => (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => setActiveIndustryIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeIndustryIdx === idx
                      ? 'bg-[#164E3D] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{ind.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Sector Details */}
            {activeIndustryIdx !== null && industriesDraft.industries[activeIndustryIdx] && (
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-[#FBFDFD] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-[#164E3D] uppercase">
                    Editing Sector: {industriesDraft.industries[activeIndustryIdx].name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    ID: {industriesDraft.industries[activeIndustryIdx].id}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sector Name</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={industriesDraft.industries[activeIndustryIdx].name}
                      onChange={(e) => {
                        const next = [...industriesDraft.industries];
                        next[activeIndustryIdx].name = e.target.value;
                        setIndustriesDraft({ ...industriesDraft, industries: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-[#164E3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Compliance Highlight</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={industriesDraft.industries[activeIndustryIdx].complianceHighlight}
                      onChange={(e) => {
                        const next = [...industriesDraft.industries];
                        next[activeIndustryIdx].complianceHighlight = e.target.value;
                        setIndustriesDraft({ ...industriesDraft, industries: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-emerald-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sector Tagline</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={industriesDraft.industries[activeIndustryIdx].tagline}
                      onChange={(e) => {
                        const next = [...industriesDraft.industries];
                        next[activeIndustryIdx].tagline = e.target.value;
                        setIndustriesDraft({ ...industriesDraft, industries: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Description</label>
                    <textarea
                      rows={2}
                      disabled={!canEditContent}
                      value={industriesDraft.industries[activeIndustryIdx].description}
                      onChange={(e) => {
                        const next = [...industriesDraft.industries];
                        next[activeIndustryIdx].description = e.target.value;
                        setIndustriesDraft({ ...industriesDraft, industries: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Applications (One per line)
                    </label>
                    <textarea
                      rows={4}
                      disabled={!canEditContent}
                      value={industriesDraft.industries[activeIndustryIdx].applications.join('\n')}
                      onChange={(e) => {
                        const next = [...industriesDraft.industries];
                        next[activeIndustryIdx].applications = e.target.value
                          .split('\n')
                          .filter((l) => l.trim().length > 0);
                        setIndustriesDraft({ ...industriesDraft, industries: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recommended Equipment (One per line)
                    </label>
                    <textarea
                      rows={4}
                      disabled={!canEditContent}
                      value={industriesDraft.industries[activeIndustryIdx].recommendedEquipment.join('\n')}
                      onChange={(e) => {
                        const next = [...industriesDraft.industries];
                        next[activeIndustryIdx].recommendedEquipment = e.target.value
                          .split('\n')
                          .filter((l) => l.trim().length > 0);
                        setIndustriesDraft({ ...industriesDraft, industries: next });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  {/* Case Study Details if present */}
                  {industriesDraft.industries[activeIndustryIdx].caseStudy && (
                    <div className="md:col-span-2 p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-[#C5A059]" />
                          <span>Audited Case Study: {industriesDraft.industries[activeIndustryIdx].caseStudy?.client}</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-[#C5A059] text-[#0E3529] px-2 py-0.5 rounded">
                          {industriesDraft.industries[activeIndustryIdx].caseStudy?.auditMetric}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Client &amp; Location</label>
                          <input
                            type="text"
                            disabled={!canEditContent}
                            value={industriesDraft.industries[activeIndustryIdx].caseStudy?.location}
                            onChange={(e) => {
                              const next = [...industriesDraft.industries];
                              if (next[activeIndustryIdx].caseStudy) {
                                next[activeIndustryIdx].caseStudy!.location = e.target.value;
                                setIndustriesDraft({ ...industriesDraft, industries: next });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Audit Metric Highlight</label>
                          <input
                            type="text"
                            disabled={!canEditContent}
                            value={industriesDraft.industries[activeIndustryIdx].caseStudy?.auditMetric}
                            onChange={(e) => {
                              const next = [...industriesDraft.industries];
                              if (next[activeIndustryIdx].caseStudy) {
                                next[activeIndustryIdx].caseStudy!.auditMetric = e.target.value;
                                setIndustriesDraft({ ...industriesDraft, industries: next });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-emerald-800"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Operational Challenge</label>
                          <textarea
                            rows={2}
                            disabled={!canEditContent}
                            value={industriesDraft.industries[activeIndustryIdx].caseStudy?.challenge}
                            onChange={(e) => {
                              const next = [...industriesDraft.industries];
                              if (next[activeIndustryIdx].caseStudy) {
                                next[activeIndustryIdx].caseStudy!.challenge = e.target.value;
                                setIndustriesDraft({ ...industriesDraft, industries: next });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Samstrust Engineered Solution</label>
                          <textarea
                            rows={2}
                            disabled={!canEditContent}
                            value={industriesDraft.industries[activeIndustryIdx].caseStudy?.samstrustSolution}
                            onChange={(e) => {
                              const next = [...industriesDraft.industries];
                              if (next[activeIndustryIdx].caseStudy) {
                                next[activeIndustryIdx].caseStudy!.samstrustSolution = e.target.value;
                                setIndustriesDraft({ ...industriesDraft, industries: next });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={!canEditContent}
              onClick={handleSaveIndustries}
              className="btn-primary-gold py-2.5 px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Publish Industries Edits</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          4. CONTACT & COMPANY INFO EDITOR
         ------------------------------------------------------------- */}
      {activeSection === 'contact' && (
        <div className="space-y-6">
          {/* Official Hotlines & Corporate Credentials */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C5A059]" />
                  <span>Official Corporate Directory &amp; Hotlines</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Global contact numbers, verified domain email, and Corporate Affairs Commission registration under RC 9898142.
                </p>
              </div>
              <button
                type="button"
                disabled={!canEditContent}
                onClick={handleSaveContact}
                className="btn-primary-gold py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Company Info</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Hotline</label>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={contactDraft.primaryPhone}
                  onChange={(e) => setContactDraft({ ...contactDraft, primaryPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-[#164E3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  disabled={!canEditContent}
                  value={contactDraft.primaryEmail}
                  onChange={(e) => setContactDraft({ ...contactDraft, primaryEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CAC Registration No.</label>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={contactDraft.rcNumber}
                  onChange={(e) => setContactDraft({ ...contactDraft, rcNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Business Desk</label>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={contactDraft.whatsappNumber}
                  onChange={(e) => setContactDraft({ ...contactDraft, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-emerald-700"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Page Main Headline</label>
                <input
                  type="text"
                  disabled={!canEditContent}
                  value={contactDraft.title}
                  onChange={(e) => setContactDraft({ ...contactDraft, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#164E3D]"
                />
              </div>
            </div>
          </div>

          {/* Regional Engineering Facilities (Lagos & Port Harcourt) */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C5A059]" />
              <span>Operational Locations &amp; Facilities ({contactDraft.locations.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactDraft.locations.map((loc, idx) => (
                <div key={loc.id} className="p-4 rounded-xl border border-slate-200 bg-[#FBFDFD] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#164E3D]">{loc.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {loc.tag}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Facility Title</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={loc.title}
                      onChange={(e) => {
                        const next = [...contactDraft.locations];
                        next[idx].title = e.target.value;
                        setContactDraft({ ...contactDraft, locations: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Physical Address</label>
                    <textarea
                      rows={2}
                      disabled={!canEditContent}
                      value={loc.address}
                      onChange={(e) => {
                        const next = [...contactDraft.locations];
                        next[idx].address = e.target.value;
                        setContactDraft({ ...contactDraft, locations: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Facility Phone</label>
                      <input
                        type="text"
                        disabled={!canEditContent}
                        value={loc.phone}
                        onChange={(e) => {
                          const next = [...contactDraft.locations];
                          next[idx].phone = e.target.value;
                          setContactDraft({ ...contactDraft, locations: next });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Hours / Coverage</label>
                      <input
                        type="text"
                        disabled={!canEditContent}
                        value={loc.hours}
                        onChange={(e) => {
                          const next = [...contactDraft.locations];
                          next[idx].hours = e.target.value;
                          setContactDraft({ ...contactDraft, locations: next });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Contact Cards (Tech Support, Sales & Quotes, Corporate Inquiries) */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-[#164E3D] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C5A059]" />
              <span>Dedicated Inquiry Desks ({contactDraft.cards.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contactDraft.cards.map((card, idx) => (
                <div key={card.id} className="p-4 rounded-xl border border-slate-200 bg-[#FBFDFD] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#164E3D]">{card.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Desk Title</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={card.title}
                      onChange={(e) => {
                        const next = [...contactDraft.cards];
                        next[idx].title = e.target.value;
                        setContactDraft({ ...contactDraft, cards: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Direct Phone</label>
                    <input
                      type="text"
                      disabled={!canEditContent}
                      value={card.phone}
                      onChange={(e) => {
                        const next = [...contactDraft.cards];
                        next[idx].phone = e.target.value;
                        setContactDraft({ ...contactDraft, cards: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Direct Email</label>
                    <input
                      type="email"
                      disabled={!canEditContent}
                      value={card.email}
                      onChange={(e) => {
                        const next = [...contactDraft.cards];
                        next[idx].email = e.target.value;
                        setContactDraft({ ...contactDraft, cards: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Description</label>
                    <textarea
                      rows={2}
                      disabled={!canEditContent}
                      value={card.desc}
                      onChange={(e) => {
                        const next = [...contactDraft.cards];
                        next[idx].desc = e.target.value;
                        setContactDraft({ ...contactDraft, cards: next });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={!canEditContent}
              onClick={handleSaveContact}
              className="btn-primary-gold py-2.5 px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Publish Contact Info</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          5. CUSTOM SUBPAGES STUDIO
         ------------------------------------------------------------- */}
      {activeSection === 'subpages' && (
        <SubpagesManager onNavigateToSubpage={onNavigateToSubpage} />
      )}
    </div>
  );
};
