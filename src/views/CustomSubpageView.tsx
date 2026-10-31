import React from 'react';
import { NavTab } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useCms } from '../context/CmsContext';
import {
  ShieldCheck,
  Award,
  FlaskConical,
  Cog,
  Gauge,
  Scale,
  Wrench,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  AlertTriangle,
  Info,
  Layers,
  ArrowLeft,
  Share2,
  ExternalLink,
} from 'lucide-react';

interface CustomSubpageViewProps {
  slug: string | null;
  onNavigate: (tab: NavTab, subpageSlug?: string) => void;
}

export const CustomSubpageView: React.FC<CustomSubpageViewProps> = ({ slug, onNavigate }) => {
  const { subpages } = useCms();

  const subpage = subpages.find((s) => s.slug === slug);

  if (!subpage) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#164E3D]">Subpage Not Found</h1>
        <p className="text-slate-600 max-w-md mx-auto">
          The requested page may have been unpublished, moved, or deleted. You can explore our standard corporate sections below.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2.5 rounded-xl bg-[#164E3D] text-white text-sm font-semibold hover:bg-[#0f372b] transition-all cursor-pointer"
          >
            Return to Homepage
          </button>
          <button
            onClick={() => onNavigate('services')}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#E2ECE7] text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
          >
            Explore Services
          </button>
        </div>
      </div>
    );
  }

  // Parent page breadcrumbs resolution
  const parentBreadcrumb = (() => {
    switch (subpage.parentPage) {
      case 'about':
        return { label: 'About Us', tab: 'about' as NavTab };
      case 'services':
        return { label: 'Services', tab: 'services' as NavTab };
      case 'industries':
        return { label: 'Industries', tab: 'industries' as NavTab };
      default:
        return null;
    }
  })();

  const breadcrumbItems = [
    ...(parentBreadcrumb ? [parentBreadcrumb] : []),
    { label: subpage.title, active: true },
  ];

  // Helper for dynamic icons
  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#164E3D]" />;
      case 'Award':
        return <Award className="w-5 h-5 text-[#D4AF37]" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5 text-[#164E3D]" />;
      case 'Gauge':
        return <Gauge className="w-5 h-5 text-[#164E3D]" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-[#164E3D]" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-[#164E3D]" />;
      case 'Cog':
        return <Cog className="w-5 h-5 text-[#164E3D]" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-[#164E3D]" />;
    }
  };

  // Other related subpages under the same parent
  const relatedSubpages = subpages
    .filter((s) => s.id !== subpage.id && s.published && (s.parentPage === subpage.parentPage || subpage.parentPage === 'none'))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigate} />

      {/* 2. Hero Header */}
      <div className="rounded-3xl bg-white border border-[#E2ECE7] shadow-xl overflow-hidden">
        <div className="p-8 sm:p-12 lg:p-14 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#EBF3F0] text-xs font-mono font-bold text-[#164E3D]">
              <Award className="w-4 h-4 text-[#AD8921]" />
              <span>{subpage.badge || 'TECHNICAL WHITE PAPER & METROLOGY SPECIFICATION'}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 font-sans">
              {subpage.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{subpage.author}</span>
                </div>
              )}
              {subpage.lastUpdated && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Updated {subpage.lastUpdated}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#164E3D] tracking-tight leading-tight">
              {subpage.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
              {subpage.subtitle}
            </p>
          </div>

          {subpage.heroImage && (
            <div className="pt-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[21/9] max-h-[380px] border border-[#E2ECE7] shadow-inner">
                <img
                  src={subpage.heroImage}
                  alt={subpage.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <span className="text-xs font-medium text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    Official Technical Record • RC 9898142
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Dynamic Content Sections */}
      <div className="space-y-12">
        {subpage.sections && subpage.sections.length > 0 ? (
          subpage.sections.map((section) => {
            switch (section.type) {
              case 'text':
                return (
                  <div
                    key={section.id}
                    className="rounded-3xl bg-white border border-[#E2ECE7] shadow-sm p-8 sm:p-10 space-y-4"
                  >
                    {section.title && (
                      <h2 className="text-2xl font-bold text-[#164E3D] tracking-tight border-b border-[#E2ECE7] pb-3">
                        {section.title}
                      </h2>
                    )}
                    <div className="text-slate-700 leading-relaxed font-sans text-base sm:text-lg whitespace-pre-line space-y-4">
                      {section.content}
                    </div>
                  </div>
                );

              case 'features':
                return (
                  <div key={section.id} className="space-y-6">
                    {section.title && (
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#AD8921] rounded-full" />
                        <h2 className="text-2xl font-bold text-[#164E3D] tracking-tight">
                          {section.title}
                        </h2>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {section.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl bg-white border border-[#E2ECE7] p-6 shadow-sm hover:shadow-md hover:border-[#164E3D]/30 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-[#EBF3F0] flex items-center justify-center border border-[#164E3D]/10">
                              {renderIcon(item.icon)}
                            </div>
                            <h3 className="font-bold text-[#164E3D] text-lg leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case 'specs':
                return (
                  <div
                    key={section.id}
                    className="rounded-3xl bg-white border border-[#E2ECE7] shadow-sm overflow-hidden"
                  >
                    <div className="p-6 sm:p-8 border-b border-[#E2ECE7] bg-gradient-to-r from-[#F4F8F6] to-white">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#164E3D] mb-1">
                        <Scale className="w-4 h-4 text-[#AD8921]" />
                        <span>METROLOGICAL PARAMETERS & TEST CAPABILITIES</span>
                      </div>
                      <h2 className="text-2xl font-bold text-[#164E3D]">
                        {section.title || 'Technical Specifications Matrix'}
                      </h2>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {section.specs?.map((spec, sIdx) => (
                            <tr
                              key={sIdx}
                              className={`border-b border-[#E2ECE7] transition-colors ${
                                sIdx % 2 === 0 ? 'bg-white' : 'bg-[#FAFCFB]'
                              } hover:bg-[#EBF3F0]/50`}
                            >
                              <td className="py-4 px-6 sm:px-8 text-sm font-semibold text-[#164E3D] w-1/3">
                                {spec.label}
                              </td>
                              <td className="py-4 px-6 sm:px-8 text-sm text-slate-700 font-mono">
                                {spec.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );

              case 'callout':
                const isAudit = section.calloutType === 'audit';
                const isWarning = section.calloutType === 'warning';
                return (
                  <div
                    key={section.id}
                    className={`rounded-2xl p-6 sm:p-8 border ${
                      isAudit
                        ? 'bg-[#164E3D] text-white border-[#164E3D]'
                        : isWarning
                        ? 'bg-amber-50 text-amber-950 border-amber-200'
                        : 'bg-[#EBF3F0] text-[#164E3D] border-[#C2DBD1]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl shrink-0 ${
                          isAudit
                            ? 'bg-white/10 text-[#D4AF37]'
                            : isWarning
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-white text-[#164E3D]'
                        }`}
                      >
                        {isAudit ? (
                          <Award className="w-6 h-6" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-6 h-6" />
                        ) : (
                          <Info className="w-6 h-6" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className={`font-bold text-lg ${isAudit ? 'text-[#D4AF37]' : ''}`}>
                          {section.title || 'Regulatory Compliance Notice'}
                        </h3>
                        <p className={`text-sm sm:text-base leading-relaxed ${isAudit ? 'text-white/90' : 'text-slate-700'}`}>
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );

              case 'cta':
                return (
                  <div
                    key={section.id}
                    className="rounded-3xl bg-gradient-to-br from-[#164E3D] via-[#103E30] to-[#0A261D] text-white p-8 sm:p-12 shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-3xl space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-[#D4AF37] font-semibold">
                        <Award className="w-3.5 h-3.5" />
                        <span>SAMSTRUST DIRECT ENGINEERING CONSULT</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {section.title}
                      </h2>
                      {section.content && (
                        <p className="text-white/80 text-base leading-relaxed">
                          {section.content}
                        </p>
                      )}
                      <div>
                        <button
                          onClick={() => onNavigate(section.ctaDestination || 'contact')}
                          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#164E3D] font-bold text-sm hover:brightness-105 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          <span>{section.ctaText || 'Get in Touch with Our Engineers'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })
        ) : (
          <div className="text-center py-12 text-slate-500">
            No content sections defined for this page yet.
          </div>
        )}
      </div>

      {/* 4. Related Subpages Navigation */}
      {relatedSubpages.length > 0 && (
        <div className="pt-8 border-t border-[#E2ECE7] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider">
                EXPLORE FURTHER
              </span>
              <h3 className="text-xl font-bold text-[#164E3D]">Related Technical Articles & Capabilities</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedSubpages.map((related) => (
              <div
                key={related.id}
                onClick={() => onNavigate('subpage', related.slug)}
                className="group rounded-2xl bg-white border border-[#E2ECE7] p-6 shadow-sm hover:shadow-md hover:border-[#164E3D]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="text-xs font-mono font-semibold text-[#164E3D] bg-[#EBF3F0] px-2.5 py-1 rounded inline-block">
                    {related.parentPage.toUpperCase()}
                  </div>
                  <h4 className="font-bold text-[#164E3D] text-base group-hover:text-[#AD8921] transition-colors leading-snug">
                    {related.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {related.subtitle}
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-[#164E3D] group-hover:text-[#AD8921] transition-colors gap-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Back button */}
      <div className="pt-4 flex justify-between items-center">
        <button
          onClick={() => {
            if (parentBreadcrumb) {
              onNavigate(parentBreadcrumb.tab);
            } else {
              onNavigate('home');
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#164E3D] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {parentBreadcrumb ? parentBreadcrumb.label : 'Overview'}</span>
        </button>
      </div>
    </div>
  );
};
