import React, { useState } from 'react';
import { NavTab } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useCms } from '../context/CmsContext';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  FileText,
  Building2,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Headphones,
  DollarSign,
  Briefcase,
} from 'lucide-react';

interface ContactViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const { contactContent } = useCms();

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Procurement');
  const [urgency, setUrgency] = useState('routine');
  const [subject, setSubject] = useState('Equipment Enquiry');
  const [message, setMessage] = useState('');

  // Anti-Spam Honeypot field (hidden from real users via CSS; bots will auto-fill it)
  const [honeypotField, setHoneypotField] = useState('');

  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [spamDetected, setSpamDetected] = useState(false);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check anti-spam honeypot
    if (honeypotField.trim().length > 0) {
      // Bot detected!
      setSpamDetected(true);
      return;
    }

    const ticketId = `ST-TKT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedTicket(ticketId);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hello Samstrust Technologies, I would like to make an inquiry regarding your metrology and equipment services.`
    );
    const cleanNum = (contactContent.whatsappNumber || '+2348029844356').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${text}`, '_blank');
  };

  const getCardIcon = (id: string) => {
    switch (id) {
      case 'tech-support':
        return <Headphones className="w-5 h-5 text-[#164E3D]" />;
      case 'sales-quotes':
        return <DollarSign className="w-5 h-5 text-[#164E3D]" />;
      case 'corporate-inquiries':
        return <Briefcase className="w-5 h-5 text-[#164E3D]" />;
      default:
        return <Phone className="w-5 h-5 text-[#164E3D]" />;
    }
  };

  const faqs = [
    {
      q: 'What is the turnaround time for on-site calibration across Nigeria?',
      a: 'For major industrial hubs (Lagos, Ogun, Port Harcourt, Warri, Abuja, and Kaduna), routine on-site metrology dispatches occur within 48 to 72 hours. For emergency shutdowns or uncalibrated critical instrumentation, our Rapid Response Mobile Teams mobilize within 12 hours.',
    },
    {
      q: 'Are Samstrust calibration certificates ISO/IEC 17025 accredited and audit-ready?',
      a: 'Yes. All calibrations executed in our metrology laboratory or via on-site calibrators adhere strictly to ISO/IEC 17025:2017 principles. Certificates provide full traceability chains to National Metrology Institutes (NMIs), including NIST and DKD, with complete measurement uncertainty budgets.',
    },
    {
      q: 'Can Samstrust supply OEM spare parts and replacement sensors for legacy plant equipment?',
      a: 'Yes. We maintain direct supply relationships with leading European, Japanese, and American instrumentation manufacturers. Our engineers can cross-reference legacy models and provide drop-in replacements with exact process flanges and digital protocol interfaces (HART, Foundation Fieldbus, Modbus).',
    },
    {
      q: 'What payment and procurement terms do you offer corporate and institutional clients?',
      a: 'We accept payments in Nigerian Naira (NGN), United States Dollars (USD), Euros (EUR), and British Pounds (GBP). For pre-qualified corporate clients, we provide commercial credit terms (Net-30 / Milestone-based) backed by formal purchase orders (PO) and corporate guarantees under RC 9898142.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Contact Us', active: true }]} onNavigate={onNavigate} />

      {/* 2. Top Header */}
      <div className="space-y-4 max-w-3xl border-b border-[#E2ECE7] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EBF3F0] text-xs font-mono text-[#164E3D] font-bold">
          <Building2 className="w-3.5 h-3.5 text-[#AD8921]" />
          <span>{contactContent.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#164E3D] tracking-tight leading-tight">
          {contactContent.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {contactContent.subtitle}
        </p>
      </div>

      {/* 3. DIRECT CONTACT CARDS (Technical Support, Sales & Quotes, Corporate Inquiries) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactContent.cards.map((card) => (
          <div
            key={card.id}
            className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm hover:border-[#164E3D] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#EBF3F0] flex items-center justify-center">
                  {getCardIcon(card.id)}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {card.badge}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#164E3D]">{card.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  {card.desc}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-1.5 text-xs">
              <a
                href={`tel:${card.phone.replace(/\s+/g, '')}`}
                className="font-mono font-bold text-[#164E3D] hover:text-[#AD8921] flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#AD8921]" />
                <span>{card.phone}</span>
              </a>
              <a
                href={`mailto:${card.email}`}
                className="font-mono text-slate-600 hover:text-[#164E3D] flex items-center gap-1.5 transition-colors truncate"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{card.email}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 4. DUAL SECTION: INTERACTIVE SUBMISSION FORM (WITH HONEYPOT) & LOCATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT 7 COLS: FORM WITH HONEYPOT PROTECTION */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2ECE7] shadow-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E2ECE7] pb-4">
            <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
              Direct Enquiry Desk
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#164E3D]">
              Send Us A Technical Or Commercial Message
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Encrypted transmission protected by automated anti-spam verification.
            </p>
          </div>

          {spamDetected ? (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="text-sm font-bold text-amber-900">Security Verification Warning</h4>
              <p className="text-xs text-amber-800">
                Automated submission detected. Please call our direct desk at +234 802 984 4356 if this was an error.
              </p>
            </div>
          ) : submittedTicket ? (
            <div className="p-6 rounded-2xl bg-[#EBF3F0] border border-emerald-300 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#164E3D] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#164E3D]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#AD8921] uppercase tracking-wider">
                  Transmission Confirmed
                </span>
                <h3 className="text-xl font-bold text-[#164E3D]">Enquiry Dispatched Successfully</h3>
                <p className="text-xs text-slate-700 mt-1">
                  Your ticket reference is <strong className="font-mono">{submittedTicket}</strong>. An application specialist from Samstrust Technologies has been notified and will reply within 4 business hours.
                </p>
              </div>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="px-5 py-2.5 rounded-xl bg-[#164E3D] text-white text-xs font-semibold hover:bg-[#1C5D49] transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* HIDDEN HONEYPOT FIELD (Spam Trap) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="company_website_trap">Leave this blank</label>
                <input
                  type="text"
                  id="company_website_trap"
                  name="company_website_trap"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypotField}
                  onChange={(e) => setHoneypotField(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Engr. Adebayo Lawal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Flour Mills of Nigeria"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="a.lawal@flourmills.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 802 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D]"
                  >
                    <option value="Procurement">Procurement</option>
                    <option value="Maintenance & Reliability">Maintenance &amp; Reliability</option>
                    <option value="Quality Assurance / QC">Quality Assurance / QC</option>
                    <option value="Plant Engineering">Plant Engineering</option>
                    <option value="Laboratory Administration">Laboratory Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Interest
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D]"
                  >
                    <option value="Equipment Enquiry">Equipment Procurement</option>
                    <option value="Calibration Booking">ISO 17025 Calibration</option>
                    <option value="Laboratory Consumables">Reagents &amp; Consumables</option>
                    <option value="Fume Hood Certification">Safety Hood Certification</option>
                    <option value="Automation & Integration">SCADA / PLC Integration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D]"
                  >
                    <option value="routine">Routine Inquiry (24h)</option>
                    <option value="priority">Priority Project (4h)</option>
                    <option value="emergency">Emergency Plant Shutdown</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Technical Scope *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your equipment requirements, process medium conditions, quantity, or specific calibration standards needed..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-500">
                  Protected with honeypot security &bull; Routed to <strong className="text-slate-700">{contactContent.primaryEmail}</strong>
                </span>

                <button
                  type="submit"
                  className="w-full sm:w-auto btn-primary py-2.5 px-6 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Enquiry</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT 5 COLS: OFFICE LOCATIONS & WHATSAPP DIRECT */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick WhatsApp Action Banner */}
          <div className="p-6 rounded-2xl bg-[#164E3D] text-white space-y-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-[#25D366] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 fill-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider block">
                  Instant Response
                </span>
                <h4 className="text-base font-bold text-white">WhatsApp Business Desk</h4>
              </div>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Connect directly with our on-duty instrumentation engineer for immediate pricing, datasheet requests, or urgent calibration bookings.
            </p>
            <button
              onClick={handleWhatsAppDirect}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Chat with Engineer on WhatsApp</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Regional Facilities */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#AD8921]" />
              <span>Operational Locations</span>
            </h3>

            <div className="space-y-4">
              {contactContent.locations.map((loc) => (
                <div key={loc.id} className="p-4 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#164E3D]">{loc.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {loc.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {loc.address}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-3">
                    <span>Tel: {loc.phone}</span>
                    <span>&bull;</span>
                    <span>{loc.hours}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. FAQ ACCORDION */}
      <div className="space-y-6 pt-6 border-t border-[#E2ECE7]">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#AD8921]">
            <HelpCircle className="w-4 h-4" />
            <span>Operational FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#164E3D]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-[#E2ECE7] bg-white overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-[#164E3D]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#164E3D]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-[#FAFBFB]">
                    {faq.a}
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
