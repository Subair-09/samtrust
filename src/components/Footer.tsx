import React, { useState } from 'react';
import { Phone, Mail, MapPin, CheckCircle, ArrowRight, ShieldCheck, Award, BookOpen, Download, Lock } from 'lucide-react';
import { NavTab } from '../types';
import { useCms } from '../context/CmsContext';

interface FooterProps {
  onNavigate: (tab: NavTab, subpageSlug?: string) => void;
  onOpenLegalModal: (type: 'privacy' | 'terms' | 'compliance') => void;
  onOpenTutorialModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenLegalModal,
  onOpenTutorialModal,
}) => {
  const { contactContent, subpages } = useCms();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#0E3529] text-white border-t border-[#164E3D]">
      {/* Upper Newsletter & Assurance Strip */}
      <div className="border-b border-emerald-900/60 bg-[#0A261D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Official Technical Intelligence & Updates</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Stay ahead in metrology, ISO standards, and process innovation
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/70 mt-1">
              Receive quarterly technical whitepapers, calibration bulletins, and regulatory advisories from our certified metrologists.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-900/80 border border-emerald-600/50 text-emerald-200 text-sm">
                <CheckCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>Thank you. Your corporate subscription has been registered.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter corporate email..."
                  required
                  className="px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-800 text-white placeholder-emerald-400/50 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all min-w-[260px]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider bg-[#D4AF37] text-[#0E3529] hover:bg-[#E8C85E] transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column (Col Span 2) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/favicon_d10ca84b.jfif"
                alt="Samstrust Emblem"
                className="w-12 h-12 object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight block">
                  SAMSTRUST
                </span>
                <span className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
                  Technologies Limited
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed pr-4">
              Samstrust Technologies Limited is an engineering and laboratory technology authority providing precision flowmeters, pressure and temperature transmitters, analytical balances, laboratory cleanroom fit-outs, and certified ISO 17025 metrology calibration services.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>Incorporated in Nigeria &bull; RC <strong>9898142</strong></span>
              </div>
            </div>

            <div className="text-xs text-emerald-300/80 space-y-1.5 pt-1">
              <p className="font-medium text-white">Tagline:</p>
              <p className="italic text-[#D4AF37]">Precision. Quality. Reliability. Trusted Solutions.</p>
            </div>
          </div>

          {/* Column 1: Equipment & Systems */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-800 pb-2">
              Equipment & Systems
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Electromagnetic & Turbine Flowmeters
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Differential Pressure Transmitters
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Analytical Balances (0.1 mg)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  VAV Laboratory Fume Cupboards
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Automated Checkweighers & Scales
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Fixed & Portable Gas Detectors
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Biotech PCR Cyclers & Reagents
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Calibration & Technical Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-800 pb-2">
              Technical Services
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  ISO/IEC 17025 Calibration
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Pressure & Temperature Profiling
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Plant Turnaround Loop Testing
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Turnkey Lab Architecture & Fit-Out
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Preventive Maintenance Contracts (PPM)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  Control Valve Stroking & Diagnostic
                </button>
              </li>
              {subpages
                .filter((s) => s.published && s.showInNavigation)
                .slice(0, 4)
                .map((subpage) => (
                  <li key={subpage.id} className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => onNavigate('subpage', subpage.slug)}
                      className="text-emerald-300/90 hover:text-[#D4AF37] transition-colors text-left flex items-start gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                      <span className="line-clamp-1">{subpage.title}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Column 3: Contact & Portal Access */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-800 pb-2">
              Corporate Office
            </h4>
            <div className="space-y-3 text-xs text-emerald-200/90 font-mono">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>
                  Samstrust Engineering Complex<br />
                  Lagos & Port Harcourt Facilities<br />
                  Nigeria
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`tel:${contactContent.primaryPhone.replace(/\s+/g, '')}`}
                  className="hover:text-white transition-colors"
                >
                  {contactContent.primaryPhone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`mailto:${contactContent.primaryEmail}`}
                  className="hover:text-white transition-colors"
                >
                  {contactContent.primaryEmail}
                </a>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('rfq')}
                  className="w-full text-center px-3 py-2 rounded-lg bg-emerald-900 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0E3529] font-sans font-semibold transition-all text-xs cursor-pointer"
                >
                  Instant RFQ Submission &rarr;
                </button>
                {onOpenTutorialModal && (
                  <button
                    type="button"
                    onClick={onOpenTutorialModal}
                    className="w-full text-center px-3 py-1.5 rounded-lg bg-[#164E3D] hover:bg-[#123F32] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Platform Guide &amp; PDF Manual</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-emerald-900/80 bg-[#071D16] text-xs text-emerald-300/70 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p>
              &copy; {new Date().getFullYear()} Samstrust Technologies Limited. All Rights Reserved.
            </p>
            <p className="text-[11px] text-emerald-400/50 mt-0.5">
              Federal Republic of Nigeria &bull; Registered Company RC: 9898142 &bull; www.samstrusttech.com
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => onOpenLegalModal('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-emerald-800" aria-hidden="true">&bull;</span>
            <button
              type="button"
              onClick={() => onOpenLegalModal('terms')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <span className="text-emerald-800" aria-hidden="true">&bull;</span>
            <button
              type="button"
              onClick={() => onOpenLegalModal('compliance')}
              className="hover:text-white transition-colors"
            >
              ISO 17025 Compliance
            </button>
            <span className="text-emerald-800" aria-hidden="true">&bull;</span>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-emerald-400/60 hover:text-[#D4AF37] transition-colors flex items-center gap-1 cursor-pointer"
              title="Secure Staff & Enterprise Client Login"
            >
              <Lock className="w-3 h-3 text-[#D4AF37]" />
              <span>Staff Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
