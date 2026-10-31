import React, { useState } from 'react';
import { RfqCartItem, CurrencyCode, NavTab } from '../types';
import { CURRENCIES } from '../data/mockData';
import { useCms } from '../context/CmsContext';
import { generateRfqReferenceCode, NIGERIAN_STATES } from '../utils/rfqValidation';
import { OfficialSamstrustPdfModal } from '../views/portal/CommercialAndArchitectureModule';
import { buildAutomatedInvoiceFromLead } from '../utils/invoiceGenerator';
import { PortalQuoteAndInvoice } from '../types/portal';
import { LeadRfqItem } from '../types/cms';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Send,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  ArrowRight,
  FileText,
  Layers,
} from 'lucide-react';

interface RFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfqItems: RfqCartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearRfq: () => void;
  currency: CurrencyCode;
  onNavigateToRfqStep?: (step: number) => void;
  onNavigate?: (tab: NavTab) => void;
}

export const RFQModal: React.FC<RFQModalProps> = ({
  isOpen,
  onClose,
  rfqItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearRfq,
  currency,
  onNavigateToRfqStep,
  onNavigate,
}) => {
  const { addRfqLead } = useCms();

  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryState, setDeliveryState] = useState('Lagos State');
  const [projectLocation, setProjectLocation] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [requireIsoCerts, setRequireIsoCerts] = useState(true);

  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<LeadRfqItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [invoiceModalState, setInvoiceModalState] = useState<{
    mode: 'proforma' | 'quotation';
    quote: PortalQuoteAndInvoice;
  } | null>(null);

  if (!isOpen) return null;

  const curr = CURRENCIES[currency];

  const estimatedTotalUSD = rfqItems.reduce(
    (acc, item) => acc + item.product.basePriceUSD * item.quantity,
    0
  );
  const convertedTotal = Math.round(estimatedTotalUSD * curr.rate);
  const formattedTotal = new Intl.NumberFormat('en-US').format(convertedTotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rfqItems.length === 0) return;

    // Generate automated unique reference code (RFQ-SAM-2026-XXXX)
    const ref = generateRfqReferenceCode();
    const nowStr = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });

    const newLeadPayload: LeadRfqItem = {
      id: `lead-${Date.now()}`,
      refCode: ref,
      clientName: clientName.trim() || 'Authorized Procurement Representative',
      clientCompany: clientCompany.trim() || 'Corporate Client',
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      deliveryState: deliveryState || 'Lagos State',
      deliveryAddress: projectLocation.trim() || `${deliveryState} Industrial Facility`,
      status: 'New',
      totalUSD: Math.round(estimatedTotalUSD),
      itemsCount: rfqItems.reduce((acc, item) => acc + item.quantity, 0),
      lineItems: rfqItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        model: item.product.model,
        quantity: item.quantity,
        specs: `${item.product.accuracy} | Range: ${item.product.measurementRange} | ${item.product.compliance}`,
        unitPriceUSD: item.product.basePriceUSD,
        isCustom: false,
      })),
      services: {
        fatRequired: false,
        installationRequired: true,
        isoCalibrationRequired: requireIsoCerts,
        trainingRequired: false,
        maintenanceSla: 'gold',
        deliveryTimeline: '2-4 Weeks Standard',
      },
      documentsAttached: [],
      internalNotes: customNotes
        ? `Quick RFQ Basket Submission: ${customNotes}`
        : 'Submitted via Quick Product Quote Basket',
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    // Push directly into CMS Lead & RFQ Pipeline Viewer!
    addRfqLead({
      refCode: newLeadPayload.refCode,
      clientName: newLeadPayload.clientName,
      clientCompany: newLeadPayload.clientCompany,
      clientEmail: newLeadPayload.clientEmail,
      clientPhone: newLeadPayload.clientPhone,
      deliveryState: newLeadPayload.deliveryState,
      deliveryAddress: newLeadPayload.deliveryAddress,
      status: 'New',
      totalUSD: newLeadPayload.totalUSD,
      itemsCount: newLeadPayload.itemsCount,
      lineItems: newLeadPayload.lineItems,
      services: newLeadPayload.services,
      documentsAttached: newLeadPayload.documentsAttached,
      internalNotes: newLeadPayload.internalNotes,
    });

    setSubmittedLead(newLeadPayload);
    setSubmittedRef(ref);
  };

  const handleCopySummary = () => {
    if (!submittedRef) return;
    const summary = `SAMSTRUST TECHNOLOGIES LIMITED (RC 9898142)
Official Request for Quotation
Reference: ${submittedRef}
Client: ${clientName} (${clientCompany})
Email: ${clientEmail} | Phone: ${clientPhone}
Delivery State: ${deliveryState} (${projectLocation || 'Standard Facility'})
ISO 17025 Certification: ${requireIsoCerts ? 'Yes, Required' : 'Standard Factory'}

Items Requested:
${rfqItems.map((item, i) => `${i + 1}. ${item.product.name} [Model: ${item.product.model}] - Qty: ${item.quantity} (Guide Val: ${curr.symbol}${new Intl.NumberFormat('en-US').format(Math.round(item.product.basePriceUSD * item.quantity * curr.rate))})`).join('\n')}

Estimated Equipment Guide Total: ${curr.symbol}${formattedTotal}
Special Technical Notes: ${customNotes || 'None'}
Status: Logged in Lead & RFQ Pipeline Viewer`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setSubmittedLead(null);
    onClearRfq();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0E3529]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2ECE7] overflow-hidden z-10 max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 border-b border-[#E2ECE7] flex items-center justify-between bg-[#164E3D] text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Request for Quotation (RFQ) Basket
              </h2>
              <span className="text-[11px] text-emerald-200 font-mono block">
                Synced with Lead &amp; RFQ Pipeline Viewer &bull; RC 9898142
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
            aria-label="Close RFQ dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submittedRef ? (
            /* Submission Success State */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-[#EBF3F0] text-[#164E3D] rounded-full flex items-center justify-center mx-auto border-2 border-[#164E3D]/30 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-[#164E3D]" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#AD8921] block">
                  Logged in Lead &amp; RFQ Pipeline Viewer
                </span>
                <h3 className="text-2xl font-bold text-[#164E3D]">RFQ Submitted Successfully</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Your quotation request has been recorded in the Lead &amp; RFQ Pipeline Viewer and routed to our engineering sales desk (<strong className="text-slate-900">{clientEmail}</strong>).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] max-w-md mx-auto text-left space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>RFQ Reference ID:</span>
                  <span className="font-bold text-[#164E3D] text-sm">{submittedRef}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Corporate Entity:</span>
                  <span className="text-slate-900">{clientCompany || clientName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Delivery State:</span>
                  <span className="text-slate-900">{deliveryState}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Guide Total:</span>
                  <span className="font-bold text-[#AD8921]">{curr.symbol}{formattedTotal}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>ISO 17025 Calibration:</span>
                  <span className="text-emerald-700 font-semibold">{requireIsoCerts ? 'Included' : 'Standard'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {submittedLead && (
                  <button
                    type="button"
                    onClick={() => {
                      const doc = buildAutomatedInvoiceFromLead(submittedLead);
                      setInvoiceModalState({ mode: 'proforma', quote: doc });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#164E3D] text-[#D4AF37] hover:bg-[#123e31] text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <span>Instant Pro-Forma Tax Invoice (PDF)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#E2ECE7] bg-white text-[#164E3D] hover:bg-[#F4F8F6] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#10B981]" />
                      <span>Copied Summary</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy RFQ Summary</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto btn-primary text-xs py-2.5 px-6 cursor-pointer"
                >
                  Done &amp; Clear RFQ
                </button>
              </div>
            </div>
          ) : (
            /* Active Form State */
            <div className="space-y-5">
              {/* Step Jump Banner for Full 4-Step Engine */}
              {onNavigateToRfqStep && (
                <div className="p-3.5 rounded-xl bg-[#EBF3F0] border border-emerald-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-[#164E3D] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#AD8921]" />
                      <span>Need Multi-Step Engineering Configuration (Steps 1–4)?</span>
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      Configure FAT, SLA tiers, or attach P&amp;ID drawings in the full RFQ engine:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {[
                      { step: 2, label: 'Step 2: Items' },
                      { step: 3, label: 'Step 3: SLA' },
                      { step: 4, label: 'Step 4: Submit' },
                    ].map((s) => (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToRfqStep(s.step);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#164E3D] text-[#164E3D] hover:text-white border border-[#164E3D]/20 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#164E3D]">
                    Selected Instrumentation ({rfqItems.length})
                  </h3>
                  {rfqItems.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearRfq}
                      className="text-xs text-rose-600 hover:text-rose-800 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                {rfqItems.length === 0 ? (
                  <div className="p-8 text-center bg-[#F4F8F6] rounded-xl border border-dashed border-[#E2ECE7] space-y-3">
                    <p className="text-sm font-medium text-slate-600">Your quotation list is empty</p>
                    <p className="text-xs text-slate-500">
                      Browse our Products catalog and click "Add to Quote" to specify flowmeters, transmitters, balances, or safety systems.
                    </p>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigate('products');
                        }}
                        className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Browse Equipment Catalog</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-[#E2ECE7] max-h-52 overflow-y-auto pr-1">
                    {rfqItems.map(({ product, quantity }) => {
                      const itemVal = Math.round(product.basePriceUSD * quantity * curr.rate);
                      return (
                        <div key={product.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover border border-[#E2ECE7] shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-[#1A2E26] block truncate">
                                {product.name}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                                <span>{product.model}</span>
                                <span>&bull;</span>
                                <span className="text-[#AD8921] font-semibold">
                                  {curr.symbol}{new Intl.NumberFormat('en-US').format(itemVal)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center border border-[#E2ECE7] rounded-lg bg-white overflow-hidden">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                                className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 py-1 text-xs font-mono font-bold text-[#164E3D]">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                                className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(product.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Total Guide Valuation */}
              {rfqItems.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#FAFDFB] border border-[#E2ECE7] flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Estimated Guide Total:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-[#AD8921]">{curr.symbol}</span>
                    <span className="text-lg font-bold font-mono text-[#164E3D] tabular-nums">
                      {formattedTotal}
                    </span>
                  </div>
                </div>
              )}

              {/* Client & Technical Specifications Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-[#E2ECE7]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#164E3D]">
                  Corporate Engineering Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Engr. Babatunde Alabi"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2ECE7] focus:border-[#164E3D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Company / Facility *</label>
                    <input
                      type="text"
                      required
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="e.g. Atlantic Refining Ltd"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2ECE7] focus:border-[#164E3D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="babatunde@atlanticrefining.com"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2ECE7] focus:border-[#164E3D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Direct Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+234 802 000 0000"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2ECE7] focus:border-[#164E3D] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Destination State *</label>
                    <select
                      value={deliveryState}
                      onChange={(e) => setDeliveryState(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E2ECE7] bg-white focus:border-[#164E3D] focus:outline-none"
                    >
                      {NIGERIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Facility / Site Address</label>
                    <input
                      type="text"
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      placeholder="e.g. Plot 14 Trans-Amadi Industrial Layout"
                      className="w-full px-3 py-2 rounded-lg border border-[#E2ECE7] focus:border-[#164E3D] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-slate-600 font-medium mb-1">
                    Special Engineering Specifications / Pipe Sizes / Medium
                  </label>
                  <textarea
                    rows={2}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Provide details on operating pressure, fluid viscosity, hazardous zone rating (ATEX/IECEx), or required flange standards..."
                    className="w-full px-3 py-2 rounded-lg border border-[#E2ECE7] focus:border-[#164E3D] focus:outline-none"
                  />
                </div>

                {/* ISO 17025 Checkbox */}
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={requireIsoCerts}
                    onChange={(e) => setRequireIsoCerts(e.target.checked)}
                    className="rounded border-[#E2ECE7] text-[#164E3D] focus:ring-[#164E3D] w-4 h-4"
                  />
                  <span>
                    Require <strong>ISO/IEC 17025 Traceable Calibration Certificate</strong> upon dispatch
                  </span>
                </label>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={rfqItems.length === 0}
                    className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 text-[#D4AF37]" />
                    <span>Transmit Formal RFQ to Lead Pipeline</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Instant Pro-Forma PDF Modal */}
      {invoiceModalState && (
        <OfficialSamstrustPdfModal
          mode={invoiceModalState.mode}
          quoteOrInvoice={invoiceModalState.quote}
          onClose={() => setInvoiceModalState(null)}
          onTriggerToast={(msg) => console.log(msg)}
        />
      )}
    </div>
  );
};
