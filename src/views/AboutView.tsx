import React, { useState } from 'react';
import { NavTab } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useCms } from '../context/CmsContext';
import {
  ShieldCheck,
  Award,
  Target,
  CheckCircle2,
  FlaskConical,
  Cog,
  Compass,
  ChevronRight,
  Building2,
  Users,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface AboutViewProps {
  onNavigate: (tab: NavTab, subpageSlug?: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const { aboutContent, subpages } = useCms();

  const coreValues = aboutContent.coreValues;
  const qualityStandards = aboutContent.qualityStandards;
  const leadershipTeam = aboutContent.leadershipTeam;

  const aboutSubpages = subpages.filter((s) => s.published && s.parentPage === 'about');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. Breadcrumbs Navigation */}
      <Breadcrumbs items={[{ label: 'About Us', active: true }]} onNavigate={onNavigate} />

      {/* 2. Hero Header */}
      <div className="space-y-4 max-w-3xl border-b border-[#E2ECE7] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EBF3F0] text-xs font-mono text-[#164E3D] font-bold">
          <Award className="w-3.5 h-3.5 text-[#AD8921]" />
          <span>{aboutContent.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#164E3D] tracking-tight leading-tight">
          {aboutContent.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {aboutContent.subtitle}
        </p>
      </div>

      {/* 2b. Dedicated About Us Sub-Pages Quick Navigation */}
      {aboutSubpages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-[#D4AF37]" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#164E3D]">
                About Us Sub-Pages &amp; Corporate Dossiers
              </h2>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Select a section below to open its dedicated page
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aboutSubpages.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onNavigate('subpage', sub.slug)}
                className="group text-left p-5 rounded-2xl bg-white border border-[#E2ECE7] hover:border-[#164E3D] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EBF3F0] text-[#164E3D]">
                      About Us
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#AD8921] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-base font-bold text-[#164E3D] group-hover:text-[#AD8921] transition-colors">
                    {sub.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {sub.subtitle}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#164E3D] group-hover:text-[#AD8921] inline-flex items-center gap-1">
                  <span>Open {sub.title} Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Brand Identity & Emblem Symbolism (Flask & Gear) */}
      <div className="rounded-3xl bg-white border border-[#E2ECE7] shadow-xl p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-[#164E3D] to-[#0A261D] text-white text-center space-y-4">
            <div className="w-24 h-24 rounded-2xl bg-white/10 p-3 flex items-center justify-center border border-white/20 shadow-inner">
              <img
                src="/assets/aistudio/samtrust_logo_dc1a9c31.jfif"
                alt="Samstrust Official Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                The Samstrust Seal
              </h2>
              <span className="text-xs font-mono text-[#D4AF37] block mt-0.5">
                Precision &bull; Quality &bull; Reliability
              </span>
            </div>
            <div className="text-xs text-emerald-100/80 leading-relaxed max-w-xs pt-2 border-t border-emerald-800">
              Registered Corporate Entity under the Companies and Allied Matters Act, Federal Republic of Nigeria.
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
                  Symbolic Architecture
                </span>
                <h2 className="text-2xl font-bold text-[#164E3D]">
                  The Convergence of Scientific Analysis &amp; Industrial Motion
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('subpage', 'company-profile')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <span>View Full Company Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] space-y-2">
                <div className="flex items-center gap-2 text-[#164E3D]">
                  <FlaskConical className="w-5 h-5 text-[#AD8921]" />
                  <h3 className="text-sm font-bold">{aboutContent.flaskTitle}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {aboutContent.flaskDescription}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] space-y-2">
                <div className="flex items-center gap-2 text-[#164E3D]">
                  <Cog className="w-5 h-5 text-[#AD8921]" />
                  <h3 className="text-sm font-bold">{aboutContent.gearTitle}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {aboutContent.gearDescription}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {aboutContent.brandSummary}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Mission, Vision, and Core Values */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="p-8 rounded-2xl bg-[#164E3D] text-white shadow-lg flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-mono font-bold uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Corporate Mission</span>
              </div>
              <h2 className="text-2xl font-bold">{aboutContent.missionTitle}</h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {aboutContent.missionStatement}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('subpage', 'mission')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
              >
                <span>Explore Dedicated Mission Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Vision */}
          <div className="p-8 rounded-2xl bg-white border border-[#E2ECE7] shadow-lg flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#AD8921] text-xs font-mono font-bold uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Corporate Vision</span>
              </div>
              <h2 className="text-2xl font-bold text-[#164E3D]">{aboutContent.visionTitle}</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {aboutContent.visionStatement}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('subpage', 'vision')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#164E3D] hover:text-[#AD8921] transition-colors cursor-pointer"
              >
                <span>Explore Dedicated Vision Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Core Values */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#164E3D]">Core Values</h3>
            <button
              type="button"
              onClick={() => onNavigate('subpage', 'core-values')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#164E3D] hover:text-[#AD8921] transition-colors cursor-pointer"
            >
              <span>View Full Core Values Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreValues.map((val, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                  Pillar 0{idx + 1}
                </span>
                <h3 className="text-xl font-bold text-[#164E3D]">{val.title}</h3>
                <span className="text-xs font-semibold text-slate-800 block">{val.tagline}</span>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Quality Management Framework & Traceability */}
      <div className="rounded-3xl bg-[#F8FAF9] border border-[#E2ECE7] p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
            Standardized Metrological Assurance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#164E3D]">
            Quality Management Framework &amp; OEM Traceability
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Our calibration laboratories operate under strict ISO/IEC 17025 principles, utilizing unbroken chains of traceability to National Metrology Institutes (NIST, DKD, NPL).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {qualityStandards.map((std, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-[#E2ECE7] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#164E3D] px-2 py-0.5 rounded-md bg-[#EBF3F0]">
                  {std.code}
                </span>
                <ShieldCheck className="w-4 h-4 text-[#AD8921]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{std.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{std.focus}</p>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-[#164E3D] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold">Require Audit Defense or Traceability Verification?</h4>
            <p className="text-xs text-emerald-200">
              Download accredited sample calibration certificates or schedule a pre-audit facility review.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="btn-primary-gold py-2.5 px-5 text-xs whitespace-nowrap cursor-pointer"
          >
            Request Quality Dossier
          </button>
        </div>
      </div>

      {/* 6. Executive & Technical Leadership */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
            Governance &amp; Stewardship
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#164E3D]">
            Executive &amp; Technical Leadership
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leadershipTeam.map((leader, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EBF3F0] text-[#164E3D] flex items-center justify-center font-bold text-base">
                {leader.name.split(' ')[1]?.[0] || 'S'}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#164E3D]">{leader.name}</h3>
                <span className="text-xs text-[#AD8921] font-semibold block">{leader.role}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {leader.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
