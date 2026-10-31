import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  X,
  Search,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  Package,
  Wrench,
  FileSpreadsheet,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Printer,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { generateAndPrintTutorialPdf } from '../utils/generateTutorialPdf';

interface TutorialGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: any) => void;
}

type GuideSection =
  | 'overview'
  | 'catalog'
  | 'rfq'
  | 'services'
  | 'admin-rbac'
  | 'cms-modules'
  | 'pipeline'
  | 'faq';

export const TutorialGuideModal: React.FC<TutorialGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [activeSection, setActiveSection] = useState<GuideSection>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const sections: { id: GuideSection; title: string; icon: React.ReactNode; tag: string }[] = [
    {
      id: 'overview',
      title: '1. Platform Overview',
      icon: <Layers className="w-4 h-4" />,
      tag: 'Architecture',
    },
    {
      id: 'catalog',
      title: '2. Catalog & Data Sheets',
      icon: <Package className="w-4 h-4" />,
      tag: 'Public Portal',
    },
    {
      id: 'rfq',
      title: '3. 4-Step RFQ Engine',
      icon: <FileText className="w-4 h-4" />,
      tag: 'Quotation Flow',
    },
    {
      id: 'services',
      title: '4. ISO 17025 Services',
      icon: <Wrench className="w-4 h-4" />,
      tag: 'Metrology',
    },
    {
      id: 'admin-rbac',
      title: '5. CMS Authentication & Roles',
      icon: <ShieldCheck className="w-4 h-4" />,
      tag: 'Security & RBAC',
    },
    {
      id: 'cms-modules',
      title: '6. Slider, Catalog & FAQs',
      icon: <SlidersHorizontal className="w-4 h-4" />,
      tag: 'CMS Controls',
    },
    {
      id: 'pipeline',
      title: '7. Lead Pipeline & CSV Export',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      tag: 'Sales Operations',
    },
    {
      id: 'faq',
      title: '8. Troubleshooting & SOPs',
      icon: <HelpCircle className="w-4 h-4" />,
      tag: 'Reference',
    },
  ];

  const handleDownloadPdf = () => {
    generateAndPrintTutorialPdf();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#E2ECE7] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4.5 bg-[#164E3D] text-white flex items-center justify-between border-b border-[#123F32]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Official Technical SOP &bull; RC 9898142
                </span>
                <span className="bg-emerald-900 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  v2.4.0
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Samstrust Technologies &bull; Platform Operational Tutorial
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#D4AF37] text-[#0E3529] hover:bg-[#E8C85E] font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              title="Download or Print PDF Manual"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Guide</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900 transition-colors cursor-pointer"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Callout Bar */}
        <div className="bg-[#F4F8F6] px-6 py-2.5 border-b border-[#E2ECE7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1A2E26]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>
              Follow this step-by-step tutorial to master public quotations, catalog navigation, and administrative CMS operations.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="text-xs font-semibold text-[#164E3D] hover:text-[#0E3529] underline flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Direct PDF Printout</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Left Navigation & Right Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-full md:w-64 border-r border-[#E2ECE7] bg-slate-50/60 p-3 sm:p-4 flex flex-col gap-1 overflow-y-auto shrink-0 max-h-48 md:max-h-none">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1">
              Tutorial Modules
            </div>
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#164E3D] text-white shadow-sm font-semibold'
                      : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={isActive ? 'text-[#D4AF37]' : 'text-slate-400'}>
                      {sec.icon}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 opacity-60 ${
                      isActive ? 'text-[#D4AF37] rotate-90 md:rotate-0' : ''
                    }`}
                  />
                </button>
              );
            })}

            <div className="mt-auto pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white border border-[#E2ECE7] text-xs font-semibold text-[#164E3D] hover:bg-[#F4F8F6] shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Save Offline PDF</span>
              </button>
            </div>
          </div>

          {/* Right Scrollable Content Pane */}
          <div className="flex-1 p-6 overflow-y-auto text-slate-800 space-y-6">
            {/* MODULE 1: PLATFORM OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-[#E2ECE7] pb-3">
                  <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">
                    Module 1 &bull; System Architecture
                  </span>
                  <h3 className="text-xl font-bold text-[#164E3D] mt-0.5">
                    Platform Structure &amp; Dual Environments
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Samstrust Technologies Limited operates a dual-layer corporate platform engineered for industrial clients, regulatory inspectors, and internal operations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#164E3D] mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      Public Corporate Portal
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      Client-facing portal with dynamic hero promotions, searchable inventory catalog, multi-currency switcher, ISO 17025 service booking, and 4-step tender RFQ engine.
                    </p>
                    <ul className="text-xs space-y-1 text-slate-700 font-mono">
                      <li>&bull; URL: / (Home, Products, Services, RFQ)</li>
                      <li>&bull; Access: Public &amp; Mobile Responsive</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#92400e] mb-2">
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                      Administrative CMS Portal
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      Protected backend interface with Role-Based Access Control (RBAC) allowing marketing and sales teams to manage slides, products, specs, and leads without coding.
                    </p>
                    <ul className="text-xs space-y-1 text-slate-700 font-mono">
                      <li>&bull; URL: /admin (or Footer CMS Link)</li>
                      <li>&bull; Access: Role-Protected (Super Admin, Editor, Sales)</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#164E3D] mb-2">
                    Quick Operational Checklist
                  </h4>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Currency selector switches pricing between NGN (₦), USD ($), EUR (€), and GBP (£) in real time.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Every RFQ submission automatically generates a unique tracking code (e.g. <code>RFQ-SAM-2026-XXXX</code>).</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All CMS updates are persisted locally and synchronize instantaneously with the public views.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 2: CATALOG & DATA SHEETS */}
            {activeSection === 'catalog' && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-[#E2ECE7] pb-3">
                  <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">
                    Module 2 &bull; Client Browsing
                  </span>
                  <h3 className="text-xl font-bold text-[#164E3D] mt-0.5">
                    Product Catalog &amp; Technical Data Sheets
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    How clients search instrumentation, inspect specifications, and download engineering data sheets.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-[#164E3D] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Search by SKU, Model or Category</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Navigate to <strong>Products</strong>. Use the filter bar to isolate categories such as <em>Flow &amp; Pressure</em>, <em>Laboratory Equipment</em>, or <em>Cleanroom Consumables</em>, or enter model search queries (e.g. <code>Proline Promass 300</code>).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-[#164E3D] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Inspect Product Detail Modal</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Click on any product card. The modal displays high-resolution multi-angle photos, verified accuracy tolerances, compliance certifications (ATEX, IECEx, ISO 17025), and delivery lead times.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-[#164E3D] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Download Official Technical Data Sheet (PDF)</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Click the <strong>"Download Technical Data Sheet (PDF)"</strong> button in the modal. The system compiles an engineering spec sheet with tolerances and corporate verification.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-[#164E3D] text-white flex items-center justify-center font-bold text-xs shrink-0">4</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Add to RFQ Cart</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Click <strong>"Add to RFQ"</strong> to queue the instrument into the RFQ Cart. You can queue multiple line items and adjust quantities before final submission.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 3: 4-STEP RFQ ENGINE */}
            {activeSection === 'rfq' && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-[#E2ECE7] pb-3">
                  <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">
                    Module 3 &bull; Quotation Engine
                  </span>
                  <h3 className="text-xl font-bold text-[#164E3D] mt-0.5">
                    Submitting a 4-Step Request for Quotation (RFQ)
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    The enterprise quotation workflow designed for engineering firms, oil &amp; gas contractors, and research institutions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#164E3D] mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">1</span>
                      Step 1: Customer &amp; Entity Details
                    </div>
                    <p className="text-xs text-slate-600">
                      Enter Company Name, CAC RC or Tax ID, Contact Person, Corporate Email, Phone, and Nigerian Delivery State &amp; Street Address.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#164E3D] mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">2</span>
                      Step 2: Line Items &amp; Tolerances
                    </div>
                    <p className="text-xs text-slate-600">
                      Select items from catalog or add custom equipment lines. Specify required quantities and engineering tolerances (e.g., &plusmn;0.1% mass flow).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#164E3D] mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">3</span>
                      Step 3: Service Scope Add-ons
                    </div>
                    <p className="text-xs text-slate-600">
                      Optionally check Factory Acceptance Testing (FAT), On-Site Turnkey Installation, Traceable Calibration Certificates, or Operator Training.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#164E3D] mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">4</span>
                      Step 4: Tender Document Upload
                    </div>
                    <p className="text-xs text-slate-600">
                      Upload tender specifications or drawings (PDF, DOCX, PNG up to 10MB) and review the complete dossier before final submission.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                  <div>
                    <strong>Confirmation &amp; Tracking Code Guarantee:</strong>
                    <div className="mt-0.5 text-amber-800">
                      Upon submission, a unique code (e.g., <code>RFQ-SAM-2026-XXXX</code>) is issued with expected response time of <strong>24–48 business hours</strong>. The lead immediately surfaces in the Sales Pipeline.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: SERVICES & CALIBRATION */}
            {activeSection === 'services' && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-[#E2ECE7] pb-3">
                  <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">
                    Module 4 &bull; Technical Services
                  </span>
                  <h3 className="text-xl font-bold text-[#164E3D] mt-0.5">
                    ISO/IEC 17025 Metrology &amp; Service Booking
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Booking laboratory calibrations, on-site mobile van audits, and preventive maintenance.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <p>
                    Samstrust maintains traceable reference standards accredited under <strong>ISO/IEC 17025</strong>. Clients can request service via the public <strong>Services</strong> page.
                  </p>
                  <ol className="space-y-2 list-decimal pl-5">
                    <li>
                      <strong>Select Service Domain:</strong> Choose between Flow Meter Proving, Pressure Gauge &amp; Transducer Calibration, Cleanroom Particle Counter Validation, or Preventive Maintenance Contracts.
                    </li>
                    <li>
                      <strong>Specify Location:</strong> Select <em>On-Site Field Metrology</em> (mobile laboratory deployed to customer facility) or <em>In-House Metrology Depot</em> (equipment shipped to Lagos/Port Harcourt facility).
                    </li>
                    <li>
                      <strong>Provide Serial Numbers &amp; Schedule:</strong> Input instrument tag IDs and preferred maintenance window dates.
                    </li>
                    <li>
                      <strong>Automated Lead Creation:</strong> Requests are auto-tagged as <code>Service Inquiry</code> in the admin lead pipeline with priority flags.
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* MODULE 5: CMS AUTHENTICATION & RBAC */}
            {activeSection === 'admin-rbac' && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-[#E2ECE7] pb-3">
                  <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">
                    Module 5 &bull; Administrative Security
                  </span>
                  <h3 className="text-xl font-bold text-[#164E3D] mt-0.5">
                    CMS Authentication &amp; Role-Based Access Control (RBAC)
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Accessing <code>/admin</code> and switching between corporate personas.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-700">
                    The CMS includes an interactive 1-click persona switcher on the login screen to test and operate all three security roles:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-white">
                      <div className="font-bold text-xs text-[#164E3D] flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Super Admin
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 mb-2">Dr. Samuel O. (MD)</div>
                      <div className="text-[11px] text-slate-600 leading-snug">
                        Unrestricted access to all modules: Slider, Products, Specs, FAQs, Leads, and full CSV exporting.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-blue-200 bg-white">
                      <div className="font-bold text-xs text-blue-800 flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Marketing Editor
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 mb-2">Chioma E. (Content Lead)</div>
                      <div className="text-[11px] text-slate-600 leading-snug">
                        Can manage homepage slides, product descriptions, specs, and FAQs. Restricted from sales pipeline.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-amber-200 bg-white">
                      <div className="font-bold text-xs text-amber-800 flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        Sales Reviewer
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 mb-2">Tunde B. (Sales Eng.)</div>
                      <div className="text-[11px] text-slate-600 leading-snug">
                        Dedicated pipeline access: view client submissions, update status, view documents, and export to CSV.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700">
                    <strong>Tip:</strong> In the Admin view, you can switch personas anytime using the role badge dropdown at the top right without logging out.
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 6: CMS MANAGEMENT SUITES */}
            {activeSection === 'cms-modules' && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-[#E2ECE7] pb-3">
                  <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">
                    Module 6 &bull; Content Administration
                  </span>
                  <h3 className="text-xl font-bold text-[#164E3D] mt-0.5">
                    Managing Hero Slides, Products &amp; FAQs
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    How marketing staff update live website content without touching code.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <div className="p-3.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[#164E3D]" />
                      Hero Slider Manager
                    </h4>
                    <p className="text-slate-600 mb-2">
                      Control the rotating hero banner on the homepage.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Use <strong>Move Up / Move Down</strong> to change banner display sequence.</li>
                      <li>Click <strong>Edit</strong> to modify slide title, subtitle, CTA button label, and destination tab.</li>
                      <li>Toggle active state to hide seasonal banners without deleting.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#164E3D]" />
                      Product Catalog &amp; Specification Manager
                    </h4>
                    <p className="text-slate-600 mb-2">
                      Full CRUD interface for inventory instruments and consumables.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Click <strong>"Add New Product"</strong> to launch the modal.</li>
                      <li>Add technical attributes via the dynamic key-value spec editor (e.g. <code>Accuracy: ±0.05%</code>).</li>
                      <li>Edit base pricing in NGN, category, manufacturer brand, and stock status.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#164E3D]" />
                      Pages Content Studio (About, Services, Industries &amp; Contact)
                    </h4>
                    <p className="text-slate-600 mb-2">
                      Full WYSIWYG editing hub for all core landing pages with instant live site reflection.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>About Us:</strong> Modify corporate mission, vision, 3 core value pillars, ISO standards, and leadership team credentials.</li>
                      <li><strong>Services:</strong> Update technical service scopes, turnaround times, calibration uncertainty ranges, and AMC SLA tiers.</li>
                      <li><strong>Industries:</strong> Edit sector architectures, equipment recommendations, and audited case studies.</li>
                      <li><strong>Contact:</strong> Update official hotlines, primary email, CAC RC 9898142 number, and regional facility branches.</li>
                      <li><strong>Live Preview &amp; Reset:</strong> Jump directly to live view on the site or restore factory template text with one click.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#164E3D]" />
                      Services &amp; FAQ Accordion Manager
                    </h4>
                    <p className="text-slate-600 mb-2">
                      Manage technical FAQs and calibration service packages.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Add or edit questions categorized under <em>Calibration</em>, <em>Orders</em>, or <em>Compliance</em>.</li>
                      <li>Update turnaround times and pricing guidance.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 7: PIPELINE & CSV */}
            {activeSection === 'pipeline' && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-[#E2ECE7] pb-3">
                  <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">
                    Module 7 &bull; Sales Engineering Hub
                  </span>
                  <h3 className="text-xl font-bold text-[#164E3D] mt-0.5">
                    Lead &amp; RFQ Pipeline Viewer &amp; CSV Export
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Reviewing tender submissions, updating status stages, and exporting to accounting spreadsheets.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <p>
                    Every RFQ completed on the public site immediately drops into the <strong>Lead &amp; RFQ Pipeline</strong> with an unassigned <code>New</code> status tag.
                  </p>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <h4 className="font-bold text-slate-900 mb-2">Step-by-Step Lead Processing:</h4>
                    <ol className="list-decimal pl-5 space-y-1.5">
                      <li>
                        <strong>Filter by Status:</strong> Click tabs (<em>All</em>, <em>New</em>, <em>Assigned</em>, <em>Quoted</em>, <em>Closed</em>) to see current workload.
                      </li>
                      <li>
                        <strong>Inspect Dossier:</strong> Click any lead to expand client details, requested quantities, delivery state, and uploaded tender files.
                      </li>
                      <li>
                        <strong>Update Stage:</strong> Once a quotation proposal is prepared, change status to <code>Quoted</code>.
                      </li>
                      <li>
                        <strong>One-Click CSV Export:</strong> Click the green <strong>"Export to CSV"</strong> button. The browser immediately downloads a formatted spreadsheet (<code>.csv</code>) compatible with Microsoft Excel, Google Sheets, or ERP systems.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 8: TROUBLESHOOTING */}
            {activeSection === 'faq' && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-[#E2ECE7] pb-3">
                  <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">
                    Module 8 &bull; Operational SOPs &amp; Support
                  </span>
                  <h3 className="text-xl font-bold text-[#164E3D] mt-0.5">
                    Troubleshooting &amp; Contact Escalation
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Quick resolution guides for common operational scenarios.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-xs text-slate-900">How do I generate a PDF from the printable view?</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      When clicking <strong>Download PDF Guide</strong> or <strong>Technical Data Sheet</strong>, your browser opens the print dialog. In the destination dropdown, select <strong>"Save as PDF"</strong> and click Save.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-xs text-slate-900">What happens if a user submits an RFQ without documents?</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Step 4 file upload is optional. Users can complete submissions with only technical requirements in Step 2. Sales reviewers can follow up via email or phone for additional drawings if required.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-xs text-slate-900">Official Company Support &amp; Verification</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Company: Samstrust Technologies Limited (RC 9898142)<br />
                      Email: <a href="mailto:Info@samstrusttech.com" className="text-[#164E3D] underline">Info@samstrusttech.com</a><br />
                      Direct Support: <a href="tel:+2348029844356" className="text-[#164E3D] underline">+234 802 984 4356</a><br />
                      Domain: <a href="https://www.samstrusttech.com" target="_blank" rel="noreferrer" className="text-[#164E3D] underline">www.samstrusttech.com</a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-[#E2ECE7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-800 font-semibold">CAC RC: 9898142</span>
            <span>&bull;</span>
            <span>Precision. Quality. Reliability.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-[#164E3D] text-white hover:bg-[#0E3529] font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Download Official PDF Guide</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
