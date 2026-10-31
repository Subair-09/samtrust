import React, { useState } from 'react';
import { NavTab } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useCms } from '../context/CmsContext';
import {
  SERVICES,
  CALIBRATION_SCOPES_DATA,
  CERTIFICATE_ISSUANCE_STEPS,
  AMC_SLA_TIERS,
} from '../data/mockData';
import {
  Gauge,
  Wrench,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Award,
  Send,
  Cog,
  GraduationCap,
  Sparkles,
  FileText,
  PhoneCall,
  Check,
  Scale,
  Flame,
  Droplets,
  AlertTriangle,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';

interface ServicesViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onNavigate }) => {
  // Service booking form states
  const [selectedServiceType, setSelectedServiceType] = useState('Calibration & Verification');
  const [assetDomain, setAssetDomain] = useState('Pressure & Vacuum');
  const [instrumentCount, setInstrumentCount] = useState(5);
  const [facilityLocation, setFacilityLocation] = useState('Lagos Industrial Zone');
  const [urgencyMode, setUrgencyMode] = useState('standard');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [bookingTicket, setBookingTicket] = useState<string | null>(null);

  const { servicesContent, faqs, addRfqLead } = useCms();
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  // Active calibration tab
  const [activeCalibScope, setActiveCalibScope] = useState(
    servicesContent.calibrationScopes[0]?.id || 'mass'
  );

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tkt = `ST-SRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingTicket(tkt);

    // Auto-push service booking into CMS Leads Pipeline
    addRfqLead({
      refCode: tkt,
      clientName,
      clientCompany,
      clientEmail,
      clientPhone,
      deliveryState: facilityLocation || 'Lagos',
      deliveryAddress: `Field Service Booking: ${facilityLocation}`,
      status: 'New',
      totalUSD: instrumentCount * 220,
      itemsCount: instrumentCount,
      lineItems: [
        {
          id: `srv-${Date.now()}`,
          name: `${selectedServiceType} (${assetDomain})`,
          model: `Scope: ${instrumentCount} Assets`,
          quantity: instrumentCount,
          unitPriceUSD: 220,
        },
      ],
      services: {
        fatRequired: false,
        installationRequired: selectedServiceType.includes('Commissioning'),
        isoCalibrationRequired: true,
        trainingRequired: false,
        maintenanceSla: 'gold',
        deliveryTimeline: urgencyMode === 'urgent' ? 'Immediate Emergency (12h)' : 'Standard Dispatch (48-72h)',
      },
      documentsAttached: [],
      internalNotes: serviceNotes ? `Site conditions: ${serviceNotes}` : undefined,
    });
  };

  const currentScope =
    servicesContent.calibrationScopes.find((s) => s.id === activeCalibScope) ||
    servicesContent.calibrationScopes[0];

  const renderServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-[#C5A059]" />;
      case 'Gauge':
        return <Gauge className="w-5 h-5 text-[#C5A059]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#C5A059]" />;
      case 'Cog':
        return <Cog className="w-5 h-5 text-[#C5A059]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-[#C5A059]" />;
      case 'Award':
        return <Award className="w-5 h-5 text-[#C5A059]" />;
      default:
        return <Wrench className="w-5 h-5 text-[#C5A059]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Engineering & Calibration Services', active: true }]} onNavigate={onNavigate} />

      {/* 2. Top Header */}
      <div className="space-y-4 max-w-3xl border-b border-[#E2ECE7] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EBF3F0] text-xs font-mono text-[#164E3D] font-bold">
          <Gauge className="w-3.5 h-3.5 text-[#AD8921]" />
          <span>{servicesContent.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#164E3D] tracking-tight leading-tight">
          {servicesContent.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {servicesContent.subtitle}
        </p>
      </div>

      {/* 3. CALIBRATION SERVICES: SCOPE & DOMAINS */}
      <div className="rounded-3xl bg-white border border-[#E2ECE7] shadow-xl p-6 sm:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2ECE7] pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
              ISO/IEC 17025 Traceability Scope
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#164E3D]">
              Accredited Scope of Calibration
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Select a metrological discipline below to review calibration ranges, apparatus, and uncertainty capabilities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">NIST &bull; DKD &bull; NPL TRACEABLE</span>
          </div>
        </div>

        {/* Scope Domain Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {servicesContent.calibrationScopes.map((scope) => (
            <button
              key={scope.id}
              onClick={() => setActiveCalibScope(scope.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                activeCalibScope === scope.id
                  ? 'bg-[#164E3D] text-white border-[#164E3D] shadow-md'
                  : 'bg-[#F8FAF9] text-slate-700 border-[#E2ECE7] hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold block opacity-70">
                Scope
              </span>
              <h3 className="text-sm font-bold mt-1 line-clamp-1">{scope.domain}</h3>
            </button>
          ))}
        </div>

        {/* Selected Scope Deep Dive Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2ECE7] pb-4">
            <div>
              <span className="text-xs font-mono text-[#AD8921] font-bold uppercase tracking-wider">
                Measurement Standards &bull; {currentScope.standards}
              </span>
              <h3 className="text-xl font-bold text-[#164E3D]">{currentScope.domain}</h3>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-[#E2ECE7] text-xs font-mono font-bold text-[#164E3D]">
              Range: {currentScope.range}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Reference Standard Apparatus</span>
              <p className="text-slate-800 leading-relaxed font-medium">{currentScope.apparatus}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Calibration Uncertainty (CMC)</span>
              <p className="text-[#164E3D] font-mono font-bold leading-relaxed">{currentScope.uncertainty}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Certificate Deliverables</span>
              <p className="text-slate-800 leading-relaxed">{currentScope.deliverables}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CERTIFICATE ISSUANCE PROCESS EXPLANATION (5-STEP PROCESS) */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
            Methodological Rigor
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#164E3D]">
            ISO/IEC 17025 Certificate Issuance Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From intake to computerized uncertainty calculation, every asset follows a standardized, tamper-evident validation procedure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {CERTIFICATE_ISSUANCE_STEPS.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#E2ECE7] shadow-xs relative flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="font-mono text-2xl font-extrabold text-[#AD8921] block">
                  {item.step}
                </span>
                <h4 className="text-sm font-bold text-[#164E3D] mt-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {item.desc}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Audited Step</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MAINTENANCE CONTRACTS (SLA OPTIONS: AMC VS. ON-DEMAND) */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2ECE7] pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
              Uptime Guarantees
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#164E3D]">
              Annual Maintenance Contracts (AMC) vs. On-Demand Callout
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Choose between structured continuous reliability contracts or emergency ad-hoc technical mobilizations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
              Guaranteed SLAs
            </span>
          </div>
        </div>

        {/* 3 Tier AMC Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {servicesContent.amcTiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                tier.recommended
                  ? 'bg-white border-2 border-[#164E3D] shadow-xl'
                  : 'bg-white border border-[#E2ECE7] shadow-sm'
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#164E3D] text-[#D4AF37] font-mono text-[10px] font-bold uppercase tracking-wider">
                  Recommended for Industrial Plants
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                    {tier.tagline}
                  </span>
                  <h3 className="text-xl font-bold text-[#164E3D] mt-1">{tier.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{tier.coverage}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Response Time SLA</span>
                  <span className="font-mono text-base font-extrabold text-[#164E3D]">{tier.responseSLA}</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Visits:</strong> {tier.plannedVisits}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Calibration:</strong> {tier.calibrationDiscount}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Spares:</strong> {tier.spareParts}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Callouts:</strong> {tier.emergencyCallouts}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Reporting:</strong> {tier.reporting}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedServiceType(`AMC Contract - ${tier.name}`);
                    const element = document.getElementById('service-booking-form');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    tier.recommended
                      ? 'btn-primary'
                      : 'bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-white'
                  }`}
                >
                  <span>Select {tier.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency On-Demand Callout Callout Strip */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-amber-950">
                Emergency On-Demand Callout (Non-Contract Clients)
              </h4>
              <p className="text-xs text-amber-900/80 mt-1 max-w-2xl leading-relaxed">
                Facing an uncalibrated meter failure or sudden plant shutdown? Our emergency metrology vans mobilize within 12 hours nationwide on standard commercial terms.
              </p>
            </div>
          </div>
          <a
            href="tel:+2348029844356"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs shrink-0"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency 24/7 Hotline</span>
          </a>
        </div>
      </div>

      {/* 5B. COMPREHENSIVE SERVICE PACKAGES SHOWCASE */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
            Turnkey Engineering Execution
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#164E3D]">
            Engineering &amp; Field Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Certified technical service packages executed by factory-trained metrologists with calibrated test equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesContent.services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-2xl border border-[#E2ECE7] shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF3F0] flex items-center justify-center">
                    {renderServiceIcon(srv.iconName)}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                    {srv.turnaroundTime}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#164E3D]">{srv.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{srv.subtitle}</p>
                </div>

                <div className="text-[11px] font-mono text-[#AD8921] font-semibold border-t border-slate-100 pt-2">
                  Standard: {srv.standards}
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                  {srv.scope.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedServiceType(srv.title);
                    const el = document.getElementById('service-booking-form');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#EBF3F0] hover:bg-[#164E3D] text-[#164E3D] hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Book {srv.title.split(' ')[0]}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. DEDICATED SERVICE BOOKING REQUEST INTERFACE */}
      <div id="service-booking-form" className="rounded-3xl bg-white border border-[#E2ECE7] shadow-xl p-6 sm:p-10 space-y-6">
        <div className="border-b border-[#E2ECE7] pb-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
            <Clock className="w-4 h-4" />
            <span>Direct Field Dispatch Scheduler</span>
          </div>
          <h2 className="text-2xl font-bold text-[#164E3D]">
            Book Calibration, Maintenance or Commissioning Deployment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete the operational parameters to receive a certified engineer dispatch schedule and mobilization quote.
          </p>
        </div>

        {bookingTicket ? (
          <div className="p-8 rounded-2xl bg-[#EBF3F0] border border-emerald-300 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-[#164E3D] mx-auto" />
            <div>
              <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider">
                Deployment Request Logged
              </span>
              <h3 className="text-xl font-bold text-[#164E3D]">
                Booking Reference: <span className="font-mono">{bookingTicket}</span>
              </h3>
              <p className="text-xs text-slate-700 mt-1 max-w-lg mx-auto">
                Our Senior Metrology Engineer has received your deployment dossier for <strong>{selectedServiceType}</strong> ({assetDomain}) at {facilityLocation}. An engineer will reach you at {clientPhone} within 4 business hours.
              </p>
            </div>
            <button
              onClick={() => setBookingTicket(null)}
              className="btn-primary py-2.5 px-6 text-xs cursor-pointer"
            >
              Schedule Another Service
            </button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Category *
                </label>
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                >
                  <option value="Calibration & Verification">ISO 17025 Calibration</option>
                  <option value="Installation & Commissioning">Installation &amp; Commissioning</option>
                  <option value="Preventive Maintenance">Preventive Maintenance Contract</option>
                  <option value="Overhaul Repair & Rebuild">Overhaul Repair &amp; Valve Rebuild</option>
                  <option value="Operator Training Workshop">Operator Technical Training</option>
                  <option value="Compliance Gap Audit">Metrology Compliance Gap Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Measurement Discipline
                </label>
                <select
                  value={assetDomain}
                  onChange={(e) => setAssetDomain(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                >
                  <option value="Pressure & Vacuum">Pressure &amp; Vacuum Instruments</option>
                  <option value="Temperature & Thermal">Temperature Sensors &amp; Baths</option>
                  <option value="Flow Volume & Custody">Liquid/Gas Flowmeters &amp; Skids</option>
                  <option value="Mass & Analytical Balances">Mass, Balances &amp; Scales</option>
                  <option value="Fume Hood & Cleanroom">Fume Hood Airflow &amp; Cleanroom</option>
                  <option value="Gas Detectors & Safety">Toxic/Combustible Gas Alarms</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency / Dispatch Window
                </label>
                <select
                  value={urgencyMode}
                  onChange={(e) => setUrgencyMode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                >
                  <option value="standard">Standard Field Routine (3-5 Days)</option>
                  <option value="express">Express Scheduled Deployment (48h)</option>
                  <option value="emergency">Emergency Breakdown (12-24h SLA)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant / Facility Delivery Site *
                </label>
                <input
                  type="text"
                  required
                  value={facilityLocation}
                  onChange={(e) => setFacilityLocation(e.target.value)}
                  placeholder="e.g. Ikeja Industrial Estate, Lagos or Port Harcourt Terminal"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Approximate Instrument Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={instrumentCount}
                  onChange={(e) => setInstrumentCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs font-mono text-slate-800 focus:outline-none focus:border-[#164E3D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Officer Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Engr. Kayode"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="Company name"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="email@company.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+234 802 000 0000"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Equipment Details / Process Conditions / Hazardous Area Notes
              </label>
              <textarea
                rows={3}
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                placeholder="List instrument models, pressure ranges, medium temperature, whether assets are ATEX zoned, or special calibration tolerances..."
                className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#E2ECE7]">
              <span className="text-[11px] text-slate-500">
                Dispatched under CAC RC 9898142 with ISO/IEC 17025 calibration certificates.
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto btn-primary py-2.5 px-6 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Service Booking Dossier</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 7. FREQUENTLY ASKED QUESTIONS (MANAGED VIA CMS) */}
      <div className="rounded-3xl bg-white border border-[#E2ECE7] shadow-xl p-6 sm:p-10 space-y-8">
        <div className="border-b border-[#E2ECE7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
              <HelpCircle className="w-4 h-4" />
              <span>Technical &amp; Commercial Knowledge Base</span>
            </div>
            <h2 className="text-2xl font-bold text-[#164E3D]">
              Frequently Asked Technical Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Authoritative answers on ISO/IEC 17025 accreditation, turnaround times, uncertainty budgets, and billing terms.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#EBF3F0] text-[#164E3D] font-bold self-start sm:self-auto">
            {faqs.length} Answers Available
          </span>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen ? 'border-[#164E3D] bg-[#F8FAF9]' : 'border-[#E2ECE7] bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EBF3F0] text-[#164E3D]">
                      {faq.category}
                    </span>
                    <span className="text-sm font-bold text-[#164E3D]">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#164E3D]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                    <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Standard: ISO/IEC 17025:2017 Traceable</span>
                      <span>Updated: {faq.lastUpdated}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
