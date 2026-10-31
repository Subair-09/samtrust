import React, { useState } from 'react';
import { Phone, Mail, FileText, ChevronDown, Menu, X, ShoppingCart, ShieldCheck, BookOpen, Download, Lock } from 'lucide-react';
import { CurrencyCode, NavTab, RfqCartItem } from '../types';
import { CURRENCIES } from '../data/mockData';
import { useCms } from '../context/CmsContext';
import { usePortal } from '../context/PortalContext';

interface HeaderProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab, subpageSlug?: string) => void;
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  rfqItems: RfqCartItem[];
  onOpenRfqModal: () => void;
  onOpenTutorialModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  currency,
  onCurrencyChange,
  rfqItems,
  onOpenRfqModal,
  onOpenTutorialModal,
}) => {
  const { contactContent, subpages, currentUser: cmsUser, logout: logoutCms } = useCms();
  const { sessionState, currentPortalUser, logoutPortalSession } = usePortal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [hoveredNavTab, setHoveredNavTab] = useState<string | null>(null);

  const isAuthenticated = Boolean(cmsUser || (sessionState?.isAuthenticated && sessionState.expiresAtMs > Date.now()));

  const totalRfqCount = rfqItems.reduce((acc, item) => acc + item.quantity, 0);

  const navItems: { tab: NavTab; label: string }[] = [
    { tab: 'home', label: 'Home' },
    { tab: 'about', label: 'About Us' },
    { tab: 'products', label: 'Products' },
    { tab: 'services', label: 'Services' },
    { tab: 'industries', label: 'Industries' },
    { tab: 'rfq', label: 'RFQ / Quotation' },
    { tab: 'contact', label: 'Contact' },
  ];

  const handleMobileNav = (tab: NavTab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2ECE7] transition-all">
      {/* 1. TOP UTILITY BAR */}
      <div className="w-full bg-[#164E3D] text-white text-xs border-b border-[#123F32]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          {/* Left: Contact & Official Registration */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto py-1 no-scrollbar text-emerald-100">
            <a
              href={`tel:${contactContent.primaryPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors whitespace-nowrap"
              title="Call Samstrust Technologies Office"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="font-mono tabular-nums">{contactContent.primaryPhone}</span>
            </a>

            <span className="hidden sm:inline text-emerald-600/60" aria-hidden="true">|</span>

            <a
              href={`mailto:${contactContent.primaryEmail}`}
              className="hidden sm:flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors whitespace-nowrap"
              title="Email Samstrust Technologies"
            >
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{contactContent.primaryEmail}</span>
            </a>

            <span className="text-emerald-600/60" aria-hidden="true">|</span>

            <div className="flex items-center gap-1.5 text-xs text-emerald-100 whitespace-nowrap">
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>CAC: <strong className="font-mono text-white tracking-wide">{contactContent.rcNumber}</strong></span>
            </div>
          </div>

          {/* Right: Region & Currency Selector */}
          <div className="relative flex items-center gap-3 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono text-emerald-100 hover:text-white hover:bg-[#0E3529] transition-colors"
                aria-haspopup="listbox"
                aria-expanded={currencyDropdownOpen}
              >
                <span className="text-[#D4AF37] font-semibold">{CURRENCIES[currency].symbol}</span>
                <span className="font-medium">{currency}</span>
                <ChevronDown className={`w-3 h-3 text-emerald-300 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {currencyDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCurrencyDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-44 rounded-lg bg-white shadow-xl border border-[#E2ECE7] py-1.5 z-50 text-slate-800">
                    <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      Select Currency
                    </div>
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((cCode) => (
                      <button
                        key={cCode}
                        onClick={() => {
                          onCurrencyChange(cCode);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                          currency === cCode
                            ? 'bg-[#EBF3F0] text-[#164E3D] font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-4 font-mono font-bold text-[#AD8921]">{CURRENCIES[cCode].symbol}</span>
                          <span>{cCode}</span>
                        </span>
                        {currency === cCode && (
                          <span className="text-[11px] text-[#164E3D] font-mono">Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <span className="hidden md:inline-block text-[11px] text-emerald-200/70 font-mono">
              NG &bull; Regional Hub
            </span>

            {onOpenTutorialModal && (
              <>
                <button
                  type="button"
                  onClick={onOpenTutorialModal}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0E3529] transition-colors cursor-pointer"
                  title="View Platform Operational Tutorial & Download PDF"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="font-semibold">Guide (PDF)</span>
                </button>

                <span className="text-emerald-600/60 hidden sm:inline" aria-hidden="true">|</span>
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate(cmsUser ? 'admin' : 'portal')}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs bg-[#D4AF37] text-[#0E3529] font-bold shadow-xs cursor-pointer hover:bg-[#e5c247] transition-colors"
                  title="Access Authenticated Work Console"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0E3529]" />
                  <span>{cmsUser ? 'CMS Studio' : `${currentPortalUser?.name?.split(' ')[0] || 'Enterprise'} Portal`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logoutCms();
                    logoutPortalSession();
                    onNavigate('home');
                  }}
                  className="px-2 py-0.5 rounded text-xs text-emerald-200 hover:text-white hover:bg-[#0E3529] transition-colors cursor-pointer"
                  title="Sign Out of Session"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs text-emerald-200 hover:text-[#D4AF37] hover:bg-[#0E3529] transition-colors cursor-pointer"
                title="Secure Staff & Client Portal Access"
              >
                <Lock className="w-3 h-3 text-[#D4AF37]" />
                <span className="font-semibold">Staff Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark & Official Emblem */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3.5 group text-left cursor-pointer focus:outline-none shrink-0"
          >
            <img
              src="/assets/aistudio/favicon_d10ca84b.jfif"
              alt="Samstrust Emblem - Precision Flask & Industrial Gear"
              className="w-11 h-11 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#164E3D] leading-none group-hover:text-[#0D3327] transition-colors">
                SAMSTRUST
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-[#A17E22] uppercase mt-0.5">
                Technologies Limited
              </span>
            </div>
          </button>

          {/* Zone 2: Main Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-7 text-sm font-medium text-[#1A2E26]">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              const childSubpages = subpages.filter(
                (s) => s.published && s.showInNavigation && s.parentPage === item.tab
              );
              const hasSubpages = childSubpages.length > 0;

              return (
                <div
                  key={item.tab}
                  className="relative py-2"
                  onMouseEnter={() => setHoveredNavTab(item.tab)}
                  onMouseLeave={() => setHoveredNavTab(null)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.tab);
                      setHoveredNavTab(null);
                    }}
                    className={`inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-[#164E3D] cursor-pointer ${
                      isActive
                        ? 'text-[#164E3D] font-bold'
                        : 'text-[#536E63]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {hasSubpages && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          hoveredNavTab === item.tab ? 'rotate-180 text-[#D4AF37]' : 'text-slate-400'
                        }`}
                      />
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] rounded-full" />
                    )}
                  </button>

                  {/* Dropdown Menu for Subpages */}
                  {hasSubpages && hoveredNavTab === item.tab && (
                    <div className="absolute top-full left-0 pt-2 w-72 z-50 animate-fadeIn">
                      <div className="bg-white rounded-2xl shadow-xl border border-[#E2ECE7] p-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate(item.tab);
                            setHoveredNavTab(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#164E3D] hover:bg-[#EBF3F0] transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>{item.label} Overview</span>
                          <span className="text-[10px] text-slate-400 font-mono">Main</span>
                        </button>

                        <div className="border-t border-[#E2ECE7] my-1" />

                        <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Specialized Subpages
                        </div>

                        {childSubpages.map((subpage) => (
                          <button
                            key={subpage.id}
                            type="button"
                            onClick={() => {
                              onNavigate('subpage', subpage.slug);
                              setHoveredNavTab(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-[#164E3D] hover:bg-[#EBF3F0] transition-colors flex items-start gap-2 cursor-pointer group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                            <span className="line-clamp-2 leading-snug">{subpage.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Zone 3: Primary CTA & RFQ Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick RFQ Basket Button */}
            <button
              type="button"
              onClick={onOpenRfqModal}
              className="relative p-2.5 rounded-xl border border-[#E2ECE7] bg-white text-[#164E3D] hover:bg-[#F4F8F6] hover:border-[#164E3D]/30 transition-all cursor-pointer"
              title="View Quote Request List"
              aria-label="View Quotation Basket"
            >
              <ShoppingCart className="w-5 h-5 text-[#164E3D]" />
              {totalRfqCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-[#164E3D] font-bold text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-mono shadow-xs border border-white">
                  {totalRfqCount}
                </span>
              )}
            </button>

            {/* Primary Action Button: Request a Quote */}
            <button
              type="button"
              onClick={() => onNavigate('rfq')}
              className="hidden sm:inline-flex btn-primary"
            >
              <span>Request a Quote</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden p-2 rounded-xl text-[#164E3D] hover:bg-[#EBF3F0] transition-colors focus:outline-none"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE RESPONSIVE SLIDE-OVER DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0E3529]/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between border-l border-[#E2ECE7] z-50 animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E2ECE7] flex items-center justify-between bg-[#F4F8F6]">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/aistudio/favicon_d10ca84b.jfif"
                    alt="Samstrust Emblem"
                    className="w-8 h-8 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="font-bold text-[#164E3D] block text-base leading-none">SAMSTRUST</span>
                    <span className="text-[10px] text-[#A17E22] font-semibold tracking-wider uppercase">Technologies Ltd</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.tab;
                  const childSubpages = subpages.filter(
                    (s) => s.published && s.showInNavigation && s.parentPage === item.tab
                  );
                  return (
                    <div key={item.tab} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handleMobileNav(item.tab)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-[#EBF3F0] text-[#164E3D] border-l-4 border-[#D4AF37]'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-[#164E3D]'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && <span className="text-xs text-[#D4AF37] font-mono">&rarr;</span>}
                      </button>

                      {childSubpages.length > 0 && (
                        <div className="pl-6 pr-2 py-1 space-y-1">
                          {childSubpages.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                onNavigate('subpage', sub.slug);
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left py-1.5 px-3 rounded-lg text-xs text-slate-600 hover:text-[#164E3D] hover:bg-[#EBF3F0] transition-colors flex items-center gap-2"
                            >
                              <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                              <span className="line-clamp-1">{sub.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer & Direct Actions */}
            <div className="p-5 border-t border-[#E2ECE7] bg-[#F4F8F6] space-y-3">
              <button
                type="button"
                onClick={() => handleMobileNav('rfq')}
                className="w-full btn-primary text-center justify-center py-3"
              >
                Request a Quote
              </button>

              {isAuthenticated ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleMobileNav(cmsUser ? 'admin' : 'portal')}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37] text-[#0E3529] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#e5c247] transition-colors shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#0E3529]" />
                    <span>Enter {cmsUser ? 'CMS Studio' : 'Operations Portal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logoutCms();
                      logoutPortalSession();
                      setMobileMenuOpen(false);
                      onNavigate('home');
                    }}
                    className="w-full py-2 px-4 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold text-xs transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleMobileNav('login')}
                  className="w-full py-2.5 px-4 rounded-xl border border-emerald-800 bg-[#164E3D] text-[#D4AF37] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#0E3529] transition-colors"
                >
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  <span>Authorized Staff &amp; Client Login</span>
                </button>
              )}

              {onOpenTutorialModal && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTutorialModal();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-amber-300/40 bg-amber-50 text-[#0E3529] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#C5A059]" />
                  <span>Platform Guide &amp; PDF Manual</span>
                </button>
              )}

              <div className="pt-2 text-xs text-slate-500 space-y-1.5 font-mono">
                <a
                  href="tel:+2348029844356"
                  className="flex items-center gap-2 hover:text-[#164E3D] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>+234 802 984 4356</span>
                </a>
                <a
                  href="mailto:Info@samstrusttech.com"
                  className="flex items-center gap-2 hover:text-[#164E3D] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Info@samstrusttech.com</span>
                </a>
                <div className="text-[11px] text-slate-400 pt-1">
                  Corporate Registration RC: 9898142
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
