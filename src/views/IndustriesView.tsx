import React, { useState } from 'react';
import { NavTab } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useCms } from '../context/CmsContext';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Building2,
  Flame,
  Utensils,
  Pill,
  Factory,
  Droplets,
  GraduationCap,
  Sparkles,
  FileCheck,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface IndustriesViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const IndustriesView: React.FC<IndustriesViewProps> = ({ onNavigate }) => {
  const { industriesContent } = useCms();
  const industries = industriesContent.industries;
  const [activeIndustryId, setActiveIndustryId] = useState<string>(
    industries[0]?.id || 'food-bev'
  );

  const activeInd = industries.find((i) => i.id === activeIndustryId) || industries[0];

  const getIndustryIcon = (id: string) => {
    switch (id) {
      case 'food-bev':
        return <Utensils className="w-5 h-5" />;
      case 'pharma-biotech':
        return <Pill className="w-5 h-5" />;
      case 'petrochem':
        return <Flame className="w-5 h-5" />;
      case 'academia-research':
        return <GraduationCap className="w-5 h-5" />;
      case 'agri-env':
        return <Droplets className="w-5 h-5" />;
      default:
        return <Factory className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Industries We Serve', active: true }]} onNavigate={onNavigate} />

      {/* 2. Top Header */}
      <div className="space-y-4 max-w-3xl border-b border-[#E2ECE7] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EBF3F0] text-xs font-mono text-[#164E3D] font-bold">
          <Building2 className="w-3.5 h-3.5 text-[#AD8921]" />
          <span>{industriesContent.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#164E3D] tracking-tight leading-tight">
          {industriesContent.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {industriesContent.subtitle}
        </p>
      </div>

      {/* 3. Interactive Industry Navigation Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {industries.map((ind) => {
          const isActive = ind.id === activeIndustryId;
          return (
            <button
              key={ind.id}
              onClick={() => setActiveIndustryId(ind.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                isActive
                  ? 'bg-[#164E3D] text-white border-[#164E3D] shadow-lg -translate-y-1'
                  : 'bg-white text-slate-700 border-[#E2ECE7] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-white/10 text-[#D4AF37]' : 'bg-[#EBF3F0] text-[#164E3D]'
                  }`}
                >
                  {getIndustryIcon(ind.id)}
                </div>
                {ind.caseStudy && (
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-[#D4AF37] text-[#0E3529]' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Case Study
                  </span>
                )}
              </div>
              <span className="text-xs font-bold leading-tight line-clamp-2 mt-2">
                {ind.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Deep Dive: Active Industry Requirements & Architecture */}
      <div className="rounded-3xl bg-white border border-[#E2ECE7] shadow-xl p-6 sm:p-10 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E2ECE7] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider">
              <span>Sector Architecture</span>
              <span>&bull;</span>
              <span>{activeInd.complianceHighlight}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#164E3D] tracking-tight">
              {activeInd.name}
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {activeInd.description}
            </p>
          </div>

          <button
            onClick={() => onNavigate('products')}
            className="btn-primary py-2.5 px-5 text-xs whitespace-nowrap self-start lg:self-auto cursor-pointer"
          >
            <span>Explore Certified Equipment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Applications & Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Applications */}
          <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-4">
            <div className="flex items-center gap-2 text-[#164E3D]">
              <Layers className="w-5 h-5 text-[#AD8921]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Key Technical Applications &amp; Loops
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              {activeInd.applications.map((app, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{app}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Instrumentation */}
          <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-4">
            <div className="flex items-center gap-2 text-[#164E3D]">
              <ShieldCheck className="w-5 h-5 text-[#AD8921]" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Recommended Instrumentation &amp; Systems
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              {activeInd.recommendedEquipment.map((eq, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D] shrink-0 mt-1.5" />
                  <span className="leading-relaxed font-medium">{eq}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. AUDITED CASE STUDY BREAKDOWN */}
        {activeInd.caseStudy && (
          <div className="rounded-2xl border-2 border-emerald-800/20 bg-gradient-to-br from-[#F4F8F6] via-white to-[#F4F8F6] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2ECE7] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#AD8921] block">
                  Field Proven Case Study &bull; {activeInd.caseStudy.facilityType}
                </span>
                <h3 className="text-xl font-bold text-[#164E3D]">
                  {activeInd.caseStudy.client}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Location: {activeInd.caseStudy.location}
                </span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#164E3D] text-white text-xs font-mono font-bold text-center">
                <span className="text-[10px] text-emerald-200 block uppercase">Audit Result</span>
                <span>{activeInd.caseStudy.auditMetric}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-rose-700">
                  The Operational Challenge
                </h4>
                <p className="text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-rose-100">
                  {activeInd.caseStudy.challenge}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-800">
                  The Samstrust Engineering Solution
                </h4>
                <p className="text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-emerald-100">
                  {activeInd.caseStudy.samstrustSolution}
                </p>
              </div>
            </div>

            {/* Documented ROI / Quantified Results */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#AD8921]" />
                <span>Quantified Operational &amp; Financial Impact</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeInd.caseStudy.results.map((res, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#E2ECE7] space-y-1">
                    <span className="font-mono text-xs font-bold text-[#164E3D]">Outcome 0{idx + 1}</span>
                    <p className="text-xs text-slate-700 leading-snug">{res}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Contact CTA Banner */}
      <div className="rounded-3xl bg-[#164E3D] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF37]">
            Have a Specific Process or Regulatory Audit?
          </span>
          <h3 className="text-xl sm:text-2xl font-bold">
            Consult With Our Sector Application Engineers
          </h3>
          <p className="text-xs sm:text-sm text-emerald-200">
            We review piping P&amp;IDs, cleanroom ventilation layouts, and calibration schedules.
          </p>
        </div>

        <button
          onClick={() => onNavigate('contact')}
          className="btn-primary-gold py-3 px-6 text-xs whitespace-nowrap cursor-pointer shadow-md"
        >
          Schedule Sector Consultation
        </button>
      </div>
    </div>
  );
};
