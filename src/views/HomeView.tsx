import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavTab, ProductItem, CurrencyCode } from '../types';
import { PRODUCTS, SERVICES, INDUSTRIES, TRUST_METRICS, CLIENT_TESTIMONIALS, CURRENCIES } from '../data/mockData';
import { useCms } from '../context/CmsContext';
import { ProductCard } from '../components/ProductCard';
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Wrench,
  Gauge,
  FlaskConical,
  Award,
  Sparkles,
  Clock,
  Cog,
  GraduationCap,
  Scale,
  Paperclip,
  Building2,
  Flame,
  Utensils,
  Pill,
  Factory,
  Droplets,
  PhoneCall,
  Upload,
  Pause,
  Play,
  FileText,
  Layers,
  Check,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  currency: CurrencyCode;
  onAddToRfq: (product: ProductItem) => void;
  onViewProductDetails: (product: ProductItem) => void;
  rfqProductIds: Set<string>;
  onOpenRfqAtStep?: (step: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  currency,
  onAddToRfq,
  onViewProductDetails,
  rfqProductIds,
  onOpenRfqAtStep,
}) => {
  // ---------------------------------------------------------------------------
  // 1. DYNAMIC HERO SLIDER STATE & LOGIC
  // ---------------------------------------------------------------------------
  const { heroSlides: cmsSlides, products: cmsProducts } = useCms();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const heroSlides = useMemo(() => {
    const active = cmsSlides.filter((s) => s.active);
    const source = active.length > 0 ? active : cmsSlides;
    return source.map((s) => ({
      id: s.id,
      tag: s.tag,
      title: s.title,
      subtext: s.subtext,
      ctaText: s.ctaText,
      targetTab: (s.destinationTab || 'products') as NavTab,
      image: s.image,
      statLabel: s.statLabel,
      statValue: s.statValue,
      specBadge: s.specBadge,
    }));
  }, [cmsSlides]);

  // Keep current slide within bounds if slides are added or removed
  useEffect(() => {
    if (currentSlide >= heroSlides.length) {
      setCurrentSlide(0);
    }
  }, [heroSlides.length, currentSlide]);

  // Auto-play slider with pause on hover (speed increased to 4000ms from 6500ms)
  const SLIDE_DURATION = 4000;

  useEffect(() => {
    if (isPaused || heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const handleNextSlide = () => {
    setUserInteracted(true);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setUserInteracted(true);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const activeSlide = heroSlides[currentSlide] || heroSlides[0];

  // ---------------------------------------------------------------------------
  // 2. FEATURED EQUIPMENT SHOWCASE FILTER & CAROUSEL
  // ---------------------------------------------------------------------------
  const [equipmentCategory, setEquipmentCategory] = useState<string>('all');
  const [equipmentPage, setEquipmentPage] = useState(0);

  const showcaseCategories = [
    { id: 'all', label: 'All Featured' },
    { id: 'balances', label: 'Weighing & Balances' },
    { id: 'flowmeters', label: 'Flow & Fluid' },
    { id: 'transmitters', label: 'Process Transmitters' },
    { id: 'safety-cabinets', label: 'Safety & Centrifuges' },
    { id: 'reagents-consumables', label: 'Glassware & Consumables' },
  ];

  const filteredShowcaseProducts = cmsProducts.filter((item) => {
    if (equipmentCategory === 'all') return true;
    return item.category === equipmentCategory;
  });

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredShowcaseProducts.length / itemsPerPage);
  const currentShowcaseItems = filteredShowcaseProducts.slice(
    equipmentPage * itemsPerPage,
    (equipmentPage + 1) * itemsPerPage
  );

  const handleNextShowcase = () => {
    setEquipmentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevShowcase = () => {
    setEquipmentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Reset page when category changes
  const handleCategorySelect = (catId: string) => {
    setEquipmentCategory(catId);
    setEquipmentPage(0);
  };

  // ---------------------------------------------------------------------------
  // 3. QUOTE CTA BANNER STATE (SIMULATED ATTACHMENT)
  // ---------------------------------------------------------------------------
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [quickInquiryNotes, setQuickInquiryNotes] = useState('');
  const [quickInquirySent, setQuickInquirySent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFileName(e.target.files[0].name);
    }
  };

  const handleQuickInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickInquirySent(true);
    setTimeout(() => {
      onNavigate('rfq');
    }, 1200);
  };

  // Helper for currency conversion
  const curr = CURRENCIES[currency];

  return (
    <div className="w-full space-y-20 sm:space-y-28 pb-20">
      {/* =========================================================================
          SECTION 1: DYNAMIC HERO SLIDER (3 SLIDES, AUTOPLAY, HOVER PAUSE)
         ========================================================================= */}
      <section
        className="relative w-full overflow-hidden bg-gradient-to-b from-white via-[#F4F8F6] to-[#EBF3F0] border-b border-[#E2ECE7]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-roledescription="carousel"
        aria-label="Samstrust Core Engineering Capabilities"
      >
        {/* Background Grid Accent */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#164E3D 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 sm:pb-20 relative z-10">
          {/* Top Registration Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 pb-3 border-b border-[#E2ECE7]/80 text-xs text-slate-600">
            <div className="inline-flex items-center gap-2">
              <img
                src="/assets/aistudio/favicon_d10ca84b.jfif"
                alt="Samstrust Flask & Gear Emblem"
                className="w-4 h-4 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-[#164E3D] tracking-tight">Samstrust Technologies Limited</span>
              <span className="text-slate-300" aria-hidden="true">&bull;</span>
              <span className="font-mono text-[#AD8921] font-bold">CAC RC 9898142</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
              <span>ISO/IEC 17025 TRACEABLE</span>
              <span className="hidden sm:inline" aria-hidden="true">&bull;</span>
              <span className="hidden sm:inline">NATIONWIDE METROLOGY DISPATCH</span>
            </div>
          </div>

          {/* Main Slide Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[440px] sm:min-h-[480px]">
            {/* Left Content Column (7 cols) */}
            <div key={activeSlide.id} className="lg:col-span-7 space-y-6 transition-all duration-300">
              {/* Category Kicker */}
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>{activeSlide.tag}</span>
              </div>

              {/* Exact Hero Scale: Desktop 52px; Mobile 34px */}
              <h1 className="text-[34px] sm:text-[44px] lg:text-[52px] font-extrabold text-[#164E3D] tracking-tight leading-[1.12] text-balance">
                {activeSlide.title}
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
                {activeSlide.subtext}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate(activeSlide.targetTab)}
                  className="btn-primary text-base py-3 px-6 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{activeSlide.ctaText}</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('rfq')}
                  className="btn-secondary text-base py-3 px-6 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Request a Quotation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Slide Meta Indicator & Key Spec Pill */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600 border-t border-[#E2ECE7]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Primary Rating:</span>
                  <strong className="font-mono text-slate-900 font-bold">{activeSlide.statValue}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Compliance:</span>
                  <strong className="font-mono text-[#164E3D] font-bold">{activeSlide.specBadge}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium ml-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified OEM Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Visual Image Column (5 cols) */}
            <div key={`img-${activeSlide.id}`} className="lg:col-span-5 relative transition-all duration-300">
              <div className="relative rounded-2xl overflow-hidden border border-[#E2ECE7] shadow-xl bg-white aspect-4/3 sm:aspect-5/4 group">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E3529]/70 via-transparent to-transparent pointer-events-none" />

                {/* Floating Lower Badge on Image */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-[#AD8921] block">
                      {activeSlide.statLabel}
                    </span>
                    <span className="font-bold text-[#164E3D] text-sm font-mono">
                      {activeSlide.statValue}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#EBF3F0] text-[#164E3D] font-bold font-mono text-[11px] border border-emerald-200">
                    {activeSlide.specBadge}
                  </span>
                </div>
              </div>

              {/* Pause/Play indicator pill */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors cursor-pointer"
                  title={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
                  aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Slider Controls Strip (Previous/Next + Indicator Dots + Progress Bar) */}
          <div className="mt-8 pt-6 border-t border-[#E2ECE7] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Dots and Slide Index */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#164E3D] tracking-wider">
                0{currentSlide + 1} &mdash; 0{heroSlides.length}
              </span>

              <div className="flex items-center gap-2">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => {
                      setUserInteracted(true);
                      setCurrentSlide(idx);
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer overflow-hidden relative ${
                      currentSlide === idx
                        ? 'w-10 bg-[#164E3D]'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  >
                    {currentSlide === idx && (
                      <div
                        key={`prog-${currentSlide}-${isPaused}`}
                        className={`h-full bg-[#D4AF37] rounded-full ${
                          isPaused ? 'w-full opacity-60' : 'animate-slide-progress'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Title Previews */}
            <div className="hidden md:flex items-center gap-4 text-xs">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setUserInteracted(true);
                    setCurrentSlide(idx);
                  }}
                  className={`text-left transition-colors cursor-pointer max-w-[180px] truncate ${
                    currentSlide === idx
                      ? 'text-[#164E3D] font-bold border-b border-[#164E3D]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {slide.title}
                </button>
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevSlide}
                className="w-9 h-9 rounded-xl border border-[#E2ECE7] bg-white hover:bg-[#F4F8F6] text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                className="w-9 h-9 rounded-xl border border-[#E2ECE7] bg-white hover:bg-[#F4F8F6] text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: VALUE PROPOSITION STRIP (4 FEATURE PILLS / CARDS)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Feature 1: Accredited Calibration */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm hover:border-[#164E3D] hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#EBF3F0] text-[#164E3D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Gauge className="w-6 h-6 text-[#164E3D]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                  ISO/IEC 17025
                </span>
                <h3 className="text-base font-bold text-[#164E3D]">Accredited Calibration</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Computerized uncertainty budgets, automated certificate logs, and full NIST/DKD metrological traceability for audit readiness.
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-[#164E3D]">
              <span>Learn calibration protocols</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 2: OEM Equipment Supply */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm hover:border-[#164E3D] hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#EBF3F0] text-[#164E3D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-[#164E3D]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                  Tier-1 Distribution
                </span>
                <h3 className="text-base font-bold text-[#164E3D]">OEM Equipment Supply</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Direct manufacturer distribution backed by factory warranties, authentic spare parts, and verified quality seals.
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-[#164E3D]">
              <span>View supply authorizations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 3: Rapid Technical Dispatch */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm hover:border-[#164E3D] hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#EBF3F0] text-[#164E3D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6 text-[#164E3D]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                  48-Hour Field Service
                </span>
                <h3 className="text-base font-bold text-[#164E3D]">Rapid Technical Dispatch</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Mobile metrology vans and certified instrumentation engineers ready across Lagos, Port Harcourt, and nationwide.
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-[#164E3D]">
              <span>Schedule mobile team</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 4: Certified Consumables */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm hover:border-[#164E3D] hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#EBF3F0] text-[#164E3D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FlaskConical className="w-6 h-6 text-[#164E3D]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                  ACS &amp; USP Grade
                </span>
                <h3 className="text-base font-bold text-[#164E3D]">Certified Consumables</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Analytical pure reagents and Class A borosilicate volumetric glassware supplied with Batch Certificates of Analysis (CoA).
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-[#164E3D]">
              <span>Browse batch reagents</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PRODUCT CATEGORIES GRID (4 LUXURY ROUNDED CARDS)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2ECE7] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
              <Layers className="w-4 h-4" />
              <span>Core Technological Pillars</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#164E3D] tracking-tight">
              Engineered Product Categories
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore our four core industrial and scientific portfolios, each backed by certified calibration protocols and direct warranty coverage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#164E3D] hover:text-[#AD8921] transition-colors cursor-pointer self-start md:self-auto"
          >
            <span>View Full 2026 Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Category 1: Weighing Products and Systems */}
          <div className="group rounded-2xl bg-white border border-[#E2ECE7] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="relative aspect-4/3 w-full bg-[#F4F8F6] overflow-hidden border-b border-[#E2ECE7]">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_b1rpztb1rpztb1rp__1__3c4a1bcb.jfif"
                  alt="Precision Weighing Products and Systems"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold text-[#164E3D] border border-slate-200 shadow-xs">
                  0.0001g to 5,000kg
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <span className="text-[11px] font-mono text-[#AD8921] font-bold uppercase tracking-wider block">
                  Category 01
                </span>
                <h3 className="text-lg font-bold text-[#164E3D] group-hover:text-[#AD8921] transition-colors">
                  Weighing Products and Systems
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Analytical balances, microbalances, moisture analyzers, industrial floor scales, and automated conveyor checkweighers.
                </p>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D]" />
                    <span>IsoCAL automatic internal calibration</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D]" />
                    <span>OIML R76 / GLP / GMP compliant</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse Weighing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category 2: Laboratory Equipment & Instrumentation */}
          <div className="group rounded-2xl bg-white border border-[#E2ECE7] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="relative aspect-4/3 w-full bg-[#F4F8F6] overflow-hidden border-b border-[#E2ECE7]">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_kbf03ikbf03ikbf0_ce47ed91.jfif"
                  alt="Laboratory Equipment & Instrumentation"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold text-[#164E3D] border border-slate-200 shadow-xs">
                  Turnkey Infrastructure
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <span className="text-[11px] font-mono text-[#AD8921] font-bold uppercase tracking-wider block">
                  Category 02
                </span>
                <h3 className="text-lg font-bold text-[#164E3D] group-hover:text-[#AD8921] transition-colors">
                  Laboratory Equipment &amp; Instrumentation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Scanning UV-Vis spectrophotometers, refrigerated centrifuges, biosafety cabinets, and VAV aerodynamic fume hoods.
                </p>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D]" />
                    <span>EN 14175 aerodynamic face velocity</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D]" />
                    <span>Double-beam split Czerny-Turner optics</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse Lab Equipment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category 3: Bioprocess Solutions & Fluid Monitoring */}
          <div className="group rounded-2xl bg-white border border-[#E2ECE7] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="relative aspect-4/3 w-full bg-[#F4F8F6] overflow-hidden border-b border-[#E2ECE7]">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_7umxig7umxig7umx_6b236d43.jfif"
                  alt="Bioprocess Solutions & Fluid Monitoring"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold text-[#164E3D] border border-slate-200 shadow-xs">
                  In-Line &amp; Sanitary
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <span className="text-[11px] font-mono text-[#AD8921] font-bold uppercase tracking-wider block">
                  Category 03
                </span>
                <h3 className="text-lg font-bold text-[#164E3D] group-hover:text-[#AD8921] transition-colors">
                  Bioprocess Solutions &amp; Fluid Monitoring
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Electromagnetic flowmeters, Coriolis mass meters, turbine sensors, differential transmitters, and jacketed fermentor vessels.
                </p>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D]" />
                    <span>ATEX / IECEx Zone 0/1 certified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D]" />
                    <span>Bidirectional slurry &amp; chemical flow</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse Fluid Systems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category 4: Laboratory Consumables, Glassware & Accessories */}
          <div className="group rounded-2xl bg-white border border-[#E2ECE7] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="relative aspect-4/3 w-full bg-[#F4F8F6] overflow-hidden border-b border-[#E2ECE7]">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_vuu9dcvuu9dcvuu9__1__035e4350.jfif"
                  alt="Laboratory Consumables, Glassware & Accessories"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold text-[#164E3D] border border-slate-200 shadow-xs">
                  ACS Pure &amp; Class A
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <span className="text-[11px] font-mono text-[#AD8921] font-bold uppercase tracking-wider block">
                  Category 04
                </span>
                <h3 className="text-lg font-bold text-[#164E3D] group-hover:text-[#AD8921] transition-colors">
                  Consumables, Glassware &amp; Accessories
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  DIN Class A borosilicate volumetric flasks, burettes, analytical pure reagents, HPLC vials, and micropipette suites.
                </p>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D]" />
                    <span>Batch Certificate of Analysis (CoA)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D]" />
                    <span>Thermal shock resistant borosilicate 3.3</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse Consumables</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FEATURED EQUIPMENT SHOWCASE (CAROUSEL / GRID WITH QUICK VIEW & RFQ)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2ECE7] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
              <Sparkles className="w-4 h-4" />
              <span>Engineered Precision Assets</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#164E3D] tracking-tight">
              Featured Equipment Showcase
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore highlighted measurement instruments currently available with instant RFQ quotation generation and calibration certs.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handlePrevShowcase}
              disabled={totalPages <= 1}
              className="w-10 h-10 rounded-xl border border-[#E2ECE7] bg-white hover:bg-[#F4F8F6] disabled:opacity-40 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Previous showcase items"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-mono text-xs font-bold text-[#164E3D] px-2">
              {equipmentPage + 1} / {Math.max(1, totalPages)}
            </span>
            <button
              type="button"
              onClick={handleNextShowcase}
              disabled={totalPages <= 1}
              className="w-10 h-10 rounded-xl border border-[#E2ECE7] bg-white hover:bg-[#F4F8F6] disabled:opacity-40 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Next showcase items"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {showcaseCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                equipmentCategory === cat.id
                  ? 'bg-[#164E3D] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-[#E2ECE7] hover:border-slate-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid Showcase (Items with Model badges, specs, quick view, add to rfq) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentShowcaseItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={currency}
              onAddToRfq={onAddToRfq}
              onViewDetails={onViewProductDetails}
              isInRfq={rfqProductIds.has(product.id)}
              onRequestQuote={() => (onOpenRfqAtStep ? onOpenRfqAtStep(2) : onNavigate('rfq'))}
            />
          ))}
        </div>

        {/* Bottom Catalog Link */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="btn-secondary py-3 px-6 text-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <span>View All {PRODUCTS.length} Equipment in Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: TECHNICAL SERVICES SUMMARY (6 SERVICE CARDS)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2ECE7] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
              <Wrench className="w-4 h-4" />
              <span>Full Lifecycle Engineering</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#164E3D] tracking-tight">
              Technical Metrology &amp; Field Services
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              From initial site mounting to ISO 17025 accredited calibration and preventive SLA maintenance, our certified metrologists ensure maximum uptime.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="btn-primary py-2.5 px-5 text-xs inline-flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <span>View All Service Scopes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => {
            const getIcon = (iconName: string) => {
              switch (iconName) {
                case 'Wrench':
                  return <Wrench className="w-6 h-6 text-[#164E3D]" />;
                case 'Gauge':
                  return <Gauge className="w-6 h-6 text-[#164E3D]" />;
                case 'ShieldCheck':
                  return <ShieldCheck className="w-6 h-6 text-[#164E3D]" />;
                case 'Cog':
                  return <Cog className="w-6 h-6 text-[#164E3D]" />;
                case 'GraduationCap':
                  return <GraduationCap className="w-6 h-6 text-[#164E3D]" />;
                case 'Award':
                  return <Award className="w-6 h-6 text-[#164E3D]" />;
                default:
                  return <Wrench className="w-6 h-6 text-[#164E3D]" />;
              }
            };

            return (
              <div
                key={service.id}
                className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm hover:border-[#164E3D] hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#EBF3F0] flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getIcon(service.iconName)}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      0{index + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#164E3D] group-hover:text-[#AD8921] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {service.subtitle}
                    </p>
                  </div>

                  {/* Scope bullets */}
                  <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {service.scope.slice(0, 2).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2ECE7] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {service.turnaroundTime}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('contact')}
                    className="text-xs font-bold text-[#164E3D] hover:text-[#AD8921] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Book Service</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: INDUSTRIES SERVED (VISUAL SECTOR GRID)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2ECE7] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
              <Building2 className="w-4 h-4" />
              <span>Sectors &amp; Applications</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#164E3D] tracking-tight">
              Industries Served Across West Africa
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Targeted instrumentation architectures complying with international pharmacopeia, API custody transfer, HACCP hygiene, and tertiary academic standards.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('industries')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#164E3D] hover:text-[#AD8921] transition-colors cursor-pointer self-start md:self-auto"
          >
            <span>Explore Industry Case Studies</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIES.map((industry) => {
            const getSectorIcon = (id: string) => {
              switch (id) {
                case 'pharma-biotech':
                  return <Pill className="w-5 h-5 text-[#164E3D]" />;
                case 'food-bev':
                  return <Utensils className="w-5 h-5 text-[#164E3D]" />;
                case 'petrochem':
                  return <Flame className="w-5 h-5 text-[#164E3D]" />;
                case 'academia-research':
                  return <GraduationCap className="w-5 h-5 text-[#164E3D]" />;
                case 'agri-env':
                  return <Droplets className="w-5 h-5 text-[#164E3D]" />;
                default:
                  return <Factory className="w-5 h-5 text-[#164E3D]" />;
              }
            };

            return (
              <div
                key={industry.id}
                className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF3F0] flex items-center justify-center">
                      {getSectorIcon(industry.id)}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      {industry.complianceHighlight.split(',')[0]}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#164E3D]">
                      {industry.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {industry.tagline}
                    </p>
                  </div>

                  {/* Concrete applications list */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-mono text-[#AD8921] font-bold uppercase tracking-wider block">
                      Common Deployments:
                    </span>
                    <div className="space-y-1 text-xs text-slate-600">
                      {industry.applications.slice(0, 3).map((app, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D]" />
                          <span>{app}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2ECE7] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-800 font-medium">
                    {industry.recommendedEquipment.length} Qualified Systems
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('industries')}
                    className="text-xs font-bold text-[#164E3D] hover:text-[#AD8921] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Solutions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: HIGH-IMPACT QUOTE CTA BANNER (WITH ATTACHMENT CAPABILITY)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#164E3D] via-[#103D30] to-[#0A261D] text-white p-8 sm:p-12 lg:p-14 shadow-2xl border border-emerald-800/60 relative overflow-hidden">
          {/* Subtle gold metallic light flare */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 cols: Copy & Registration */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-mono text-[#D4AF37] font-bold">RC 9898142 VERIFIED</span>
                <span>&bull;</span>
                <span>Fast 4-Hour Response SLA</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Ready to Engineer Your Facility with Proven Metrological Precision?
              </h2>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
                Submit your instrumentation schedule, engineering drawings, or tender specifications. Our commercial metrologists prepare compliant bills of materials with transparent CIF/DDP delivery terms.
              </p>

              {/* Direct Dial Hotline */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-emerald-200">
                <a
                  href="tel:+2348029844356"
                  className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-[#D4AF37]" />
                  <span className="font-mono text-sm font-bold text-white">+234 802 984 4356</span>
                </a>
                <span>&bull;</span>
                <a
                  href="mailto:Info@samstrusttech.com"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Info@samstrusttech.com
                </a>
              </div>
            </div>

            {/* Right 5 cols: Interactive Quick Spec / Document Attachment Box */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
              <div className="border-b border-white/15 pb-3">
                <span className="text-[11px] font-mono text-[#D4AF37] font-bold uppercase tracking-wider block">
                  Interactive Quotation Drawer
                </span>
                <h3 className="text-base font-bold text-white">Attach Specification Sheet</h3>
              </div>

              {quickInquirySent ? (
                <div className="p-4 rounded-xl bg-emerald-900/80 border border-emerald-500 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#D4AF37] mx-auto" />
                  <h4 className="text-sm font-bold text-white">Specifications Transferred!</h4>
                  <p className="text-xs text-emerald-200">
                    Redirecting to the official RFQ Builder to review your quotation dossier...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuickInquirySubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-emerald-200 mb-1">
                      Quick Notes / Equipment List
                    </label>
                    <textarea
                      rows={2}
                      value={quickInquiryNotes}
                      onChange={(e) => setQuickInquiryNotes(e.target.value)}
                      placeholder="e.g. Need 4x Coriolis flowmeters DN50 and 2x analytical balances..."
                      className="w-full px-3 py-2 rounded-xl bg-black/25 border border-white/20 text-xs text-white placeholder-emerald-300/50 focus:outline-none focus:border-[#D4AF37] resize-none"
                    />
                  </div>

                  {/* Document Attachment Button */}
                  <div>
                    <label className="block text-xs text-emerald-200 mb-1">
                      Attach P&amp;ID / Tender PDF (Optional)
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.dwg,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-300/40 hover:border-[#D4AF37] bg-white/5 hover:bg-white/10 text-xs text-emerald-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4 text-[#D4AF37]" />
                      <span className="truncate">
                        {attachedFileName ? `Attached: ${attachedFileName}` : 'Select PDF, DOCX or Spec Sheet'}
                      </span>
                    </button>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#D4AF37] hover:bg-[#E8C85E] text-[#0E3529] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>Launch Full RFQ</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('contact')}
                      className="py-3 px-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Contact Desk
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TRUST METRICS & TESTIMONIALS STRIP
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E2ECE7] pt-16 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {TRUST_METRICS.map((metric, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-[#E2ECE7] shadow-xs">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#164E3D] block tabular-nums">
                {metric.value}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1 block">
                {metric.label}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {metric.note}
              </span>
            </div>
          ))}
        </div>

        {/* Client Testimonial Cards */}
        <div className="space-y-4">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
              Verified Client Outcomes
            </span>
            <h3 className="text-xl font-bold text-[#164E3D] mt-1">
              Trusted by Leading Industrial Operators in Nigeria
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CLIENT_TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-xs flex flex-col justify-between"
              >
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#164E3D]">{t.author}</h4>
                    <span className="text-[11px] text-slate-500 block">{t.role}</span>
                    <span className="text-[10px] font-mono text-[#AD8921] block">{t.organization}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
