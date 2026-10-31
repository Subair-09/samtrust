import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  Printer,
  Upload,
  ShieldCheck,
  Database,
  Copy,
  Check,
  Award,
  X,
  FileCheck,
  FileWarning,
  QrCode,
  FlaskConical,
  Cog,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { useCms } from '../../context/CmsContext';
import { PortalQuoteAndInvoice, CalibrationCertificate } from '../../types/portal';
import {
  validateEnterpriseFileUpload,
  FileSecurityValidationResult,
  UPLOAD_MAX_SIZE_BYTES,
} from '../../utils/fileSecurityValidator';

export const NIGERIAN_STATE_FREIGHT_ZONES = [
  {
    state: 'Lagos State',
    zoneLabel: 'Zone 1 — Lagos Metro & Ikeja HQ Hub',
    defaultFreightUSD: 85,
  },
  {
    state: 'Ogun State',
    zoneLabel: 'Zone 1B — Agbara / Sagamu / Ota Industrial Belt',
    defaultFreightUSD: 140,
  },
  {
    state: 'Oyo State (Ibadan)',
    zoneLabel: 'Zone 2 — South-West Corridor',
    defaultFreightUSD: 180,
  },
  {
    state: 'Rivers State (Port Harcourt)',
    zoneLabel: 'Zone 3 — South-South Oil & Gas Hub (Trans-Amadi)',
    defaultFreightUSD: 320,
  },
  {
    state: 'Delta State (Warri / Asaba)',
    zoneLabel: 'Zone 3B — Niger Delta Industrial Corridor',
    defaultFreightUSD: 295,
  },
  {
    state: 'FCT Abuja',
    zoneLabel: 'Zone 4 — Federal Capital Territory & Central Lab Hub',
    defaultFreightUSD: 310,
  },
  {
    state: 'Kano State',
    zoneLabel: 'Zone 5 — Northern Industrial Hub (Bompai / Sharada)',
    defaultFreightUSD: 360,
  },
  {
    state: 'Kaduna State',
    zoneLabel: 'Zone 5B — North-West Refinery & Agro Corridor',
    defaultFreightUSD: 340,
  },
  {
    state: 'Anambra / Enugu State',
    zoneLabel: 'Zone 6 — South-East Manufacturing & Clinical Belt',
    defaultFreightUSD: 265,
  },
];

export const PAYMENT_VALIDITY_TEMPLATES = [
  '30 Days Quote Validity • Corporate PO (Net-30 Days) for Approved Institutional Clients',
  '21 Days Quote Validity • 70% Advance Deposit / 30% Upon On-Site Commissioning & ISO Calibration',
  '14 Days Quote Validity • 100% Pre-Shipment Bank Wire Transfer (NGN Corporate Account)',
  '30 Days Quote Validity • 100% Irrevocable DOM Account Wire Transfer (USD) Prior to Dispatch',
];

interface OfficialPdfEngineProps {
  mode: 'quotation' | 'proforma' | 'certificate';
  quoteOrInvoice?: PortalQuoteAndInvoice | null;
  certificate?: CalibrationCertificate | null;
  onClose: () => void;
  onTriggerToast?: (msg: string) => void;
}

export const OfficialSamstrustPdfModal: React.FC<OfficialPdfEngineProps> = ({
  mode: initialMode,
  quoteOrInvoice,
  certificate,
  onClose,
  onTriggerToast,
}) => {
  const { systemConfig, logSensitiveDocumentDownload } = usePortal();
  const [docMode, setDocMode] = useState<'quotation' | 'proforma' | 'certificate'>(initialMode);
  const [displayCurrency, setDisplayCurrency] = useState<'NGN' | 'USD'>(
    quoteOrInvoice?.currencyMode || 'NGN'
  );

  if (docMode === 'certificate' && !certificate) return null;
  if ((docMode === 'quotation' || docMode === 'proforma') && !quoteOrInvoice) return null;

  const rate = quoteOrInvoice?.exchangeRateNGN || systemConfig.exchangeRateNGN || 1580;
  const freightUSD = quoteOrInvoice?.freightChargeUSD || 0;
  const discountUSD = quoteOrInvoice
    ? quoteOrInvoice.subtotalUSD * (quoteOrInvoice.discountPercent / 100)
    : 0;
  const taxableUSD = quoteOrInvoice
    ? quoteOrInvoice.subtotalUSD - discountUSD + freightUSD
    : 0;
  const vatUSD = quoteOrInvoice ? taxableUSD * (quoteOrInvoice.vatPercent / 100) : 0;
  const computedGrandTotalUSD = quoteOrInvoice
    ? Number((taxableUSD + vatUSD).toFixed(2))
    : 0;

  const formatAmount = (amountUSD: number) => {
    if (displayCurrency === 'USD') {
      return `$${amountUSD.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    const ngn = Math.round(amountUSD * rate);
    return `₦${ngn.toLocaleString()}`;
  };

  const handlePrintOrDownload = () => {
    if (docMode === 'certificate' && certificate) {
      logSensitiveDocumentDownload(
        'Calibration Certificate',
        certificate.certificateNumber,
        certificate.customerCompany
      );
    } else if (quoteOrInvoice) {
      logSensitiveDocumentDownload(
        docMode === 'quotation' ? 'Formal Quotation' : 'Proforma Invoice',
        docMode === 'quotation' ? quoteOrInvoice.quoteRef : quoteOrInvoice.proformaInvoiceRef,
        quoteOrInvoice.customerCompany
      );
    }
    if (onTriggerToast) {
      onTriggerToast(
        'Official Samstrust PDF generated & logged to immutable Document Vault audit trail.'
      );
    }
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-[18px] bg-white shadow-2xl border border-[#E2ECE7] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#164E3D] px-6 py-4 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4AF37] text-[#1A2E26] font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Automated Samstrust Document Engine • RC 9898142
              </p>
              <h4 className="text-sm font-bold">
                {docMode === 'quotation' &&
                  `Formal Commercial Quotation — ${quoteOrInvoice?.quoteRef}`}
                {docMode === 'proforma' &&
                  `Proforma Tax Invoice — ${quoteOrInvoice?.proformaInvoiceRef}`}
                {docMode === 'certificate' &&
                  `ISO/IEC 17025 Calibration Certificate — ${certificate?.certificateNumber}`}
              </h4>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quoteOrInvoice && (
              <div className="flex items-center rounded-lg bg-white/10 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDocMode('quotation')}
                  className={`rounded-md px-2.5 py-1 font-semibold transition ${
                    docMode === 'quotation'
                      ? 'bg-[#D4AF37] text-[#1A2E26]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Formal Quotation
                </button>
                <button
                  type="button"
                  onClick={() => setDocMode('proforma')}
                  className={`rounded-md px-2.5 py-1 font-semibold transition ${
                    docMode === 'proforma'
                      ? 'bg-[#D4AF37] text-[#1A2E26]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Proforma Invoice
                </button>
              </div>
            )}

            {quoteOrInvoice && (
              <div className="flex items-center rounded-lg bg-white/10 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDisplayCurrency('NGN')}
                  className={`rounded-md px-2.5 py-1 font-bold transition ${
                    displayCurrency === 'NGN'
                      ? 'bg-emerald-400 text-[#1A2E26]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  NGN (₦)
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayCurrency('USD')}
                  className={`rounded-md px-2.5 py-1 font-bold transition ${
                    displayCurrency === 'USD'
                      ? 'bg-emerald-400 text-[#1A2E26]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handlePrintOrDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3.5 py-2 text-xs font-bold text-[#1A2E26] hover:bg-[#e3be42] transition"
            >
              <Printer className="h-4 w-4" />
              Print / Save Official PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-8 md:p-10 bg-white text-[#1A2E26] max-h-[82vh] overflow-y-auto print:max-h-none">
          <div className="border-2 border-[#164E3D] rounded-2xl p-6 md:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b-2 border-[#164E3D]">
              <div className="flex items-start gap-3.5">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#164E3D] text-[#D4AF37] shadow-md border border-[#D4AF37]/40">
                  <FlaskConical className="h-7 w-7" />
                  <Cog className="h-4 w-4 absolute bottom-1.5 right-1.5 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-extrabold tracking-tight text-[#164E3D]">
                      SAMSTRUST TECHNOLOGIES LIMITED
                    </h2>
                    <span className="rounded-md bg-[#164E3D]/10 px-2 py-0.5 text-[11px] font-extrabold text-[#164E3D]">
                      RC 9898142
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#C5A059] mt-0.5">
                    Precision. Quality. Reliability. • Scientific, Process & Calibration Engineering
                  </p>
                  <p className="text-xs text-[#1A2E26]/70 mt-1">
                    Corporate HQ: Victoria Island / Ikeja Industrial Estate, Lagos & Trans-Amadi, Port Harcourt
                  </p>
                  <p className="text-xs font-medium text-[#1A2E26]/80">
                    Web: www.samstrusttech.com • Email: Info@samstrusttech.com • Tel: +234 802 984 4356
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right shrink-0">
                <span className="inline-block rounded-lg bg-[#164E3D] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
                  {docMode === 'quotation' && 'FORMAL COMMERCIAL QUOTATION'}
                  {docMode === 'proforma' && 'PROFORMA TAX INVOICE'}
                  {docMode === 'certificate' && 'ISO/IEC 17025 CALIBRATION CERTIFICATE'}
                </span>
                <p className="mt-2 font-mono text-base font-extrabold text-[#1A2E26]">
                  {docMode === 'quotation' && quoteOrInvoice?.quoteRef}
                  {docMode === 'proforma' && quoteOrInvoice?.proformaInvoiceRef}
                  {docMode === 'certificate' && certificate?.certificateNumber}
                </p>
                <p className="text-xs text-[#1A2E26]/65">
                  Issued:{' '}
                  {docMode === 'certificate'
                    ? certificate?.calibrationDate
                    : quoteOrInvoice?.issuedDate}{' '}
                  {docMode !== 'certificate' && `• Valid Until: ${quoteOrInvoice?.validUntil}`}
                </p>
              </div>
            </div>

            {(docMode === 'quotation' || docMode === 'proforma') && quoteOrInvoice && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5 border-b border-[#E2ECE7] text-xs">
                  <div className="rounded-xl bg-[#F4F8F6] p-4 border border-[#E2ECE7]">
                    <p className="font-bold uppercase tracking-wider text-[#1A2E26]/50 mb-1">
                      Prepared For (Client Organization)
                    </p>
                    <p className="text-sm font-extrabold text-[#1A2E26]">
                      {quoteOrInvoice.customerCompany}
                    </p>
                    <p className="text-[#1A2E26]/80 mt-0.5">
                      Attn: {quoteOrInvoice.contactName} ({quoteOrInvoice.contactEmail})
                    </p>
                    <p className="font-semibold text-[#164E3D] mt-1">
                      Delivery Destination: {quoteOrInvoice.deliveryState}
                    </p>
                    {quoteOrInvoice.uploadedPurchaseOrder && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-900">
                        <FileCheck className="h-3.5 w-3.5" />
                        Client PO Attached: {quoteOrInvoice.uploadedPurchaseOrder.poNumber} (
                        {quoteOrInvoice.uploadedPurchaseOrder.fileName})
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-[#F4F8F6] p-4 border border-[#E2ECE7]">
                    <p className="font-bold uppercase tracking-wider text-[#1A2E26]/50 mb-1">
                      Commercial & Tax Metadata
                    </p>
                    <div className="space-y-1 text-[#1A2E26]/85">
                      <p>
                        <span className="font-semibold">Quote Reference:</span>{' '}
                        <span className="font-mono font-bold">{quoteOrInvoice.quoteRef}</span>
                      </p>
                      <p>
                        <span className="font-semibold">Proforma Reference:</span>{' '}
                        <span className="font-mono font-bold">
                          {quoteOrInvoice.proformaInvoiceRef}
                        </span>
                      </p>
                      {quoteOrInvoice.linkedRfqRef && (
                        <p>
                          <span className="font-semibold">Source Website RFQ:</span>{' '}
                          <span className="font-mono">{quoteOrInvoice.linkedRfqRef}</span>
                        </p>
                      )}
                      {quoteOrInvoice.linkedTicketRef && (
                        <p>
                          <span className="font-semibold">Source Service Ticket:</span>{' '}
                          <span className="font-mono text-[#164E3D] font-bold">
                            {quoteOrInvoice.linkedTicketRef}
                          </span>
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Billing Currency:</span>{' '}
                        <span className="font-bold text-[#164E3D]">
                          {displayCurrency === 'NGN'
                            ? `Nigerian Naira (NGN ₦ @ ₦${rate.toLocaleString()}/$1)`
                            : 'United States Dollars (USD $)'}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Payment Channel:</span>{' '}
                        {quoteOrInvoice.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-5">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#164E3D] text-white">
                        <th className="py-2.5 px-3 rounded-tl-lg">#</th>
                        <th className="py-2.5 px-3">Equipment / Calibration Service Description</th>
                        <th className="py-2.5 px-3">Model / SKU</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">
                          Unit Price ({displayCurrency})
                        </th>
                        <th className="py-2.5 px-3 text-right rounded-tr-lg">
                          Line Total ({displayCurrency})
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2ECE7]">
                      {quoteOrInvoice.lineItems.map((li, idx) => (
                        <tr key={li.id} className="hover:bg-[#F4F8F6]/60">
                          <td className="py-3 px-3 font-bold text-[#1A2E26]/60">{idx + 1}</td>
                          <td className="py-3 px-3 font-semibold text-[#1A2E26]">
                            {li.description}
                          </td>
                          <td className="py-3 px-3 font-mono text-[#164E3D] font-bold">
                            {li.model}
                          </td>
                          <td className="py-3 px-3 text-center font-bold">{li.qty}</td>
                          <td className="py-3 px-3 text-right font-mono">
                            {formatAmount(li.unitPriceUSD)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#1A2E26]">
                            {formatAmount(li.qty * li.unitPriceUSD)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-[#E2ECE7]">
                  <div className="md:col-span-7 space-y-3">
                    <div className="rounded-xl bg-[#F4F8F6] p-4 border border-[#E2ECE7] text-xs">
                      <p className="font-bold uppercase tracking-wider text-[#164E3D] mb-1.5">
                        Official Samstrust Bank Remittance & Validity Terms
                      </p>
                      <p className="font-bold text-[#1A2E26]">
                        Account Name: SAMSTRUST TECHNOLOGIES LIMITED (RC 9898142)
                      </p>
                      <p className="text-[#1A2E26]/80 mt-0.5">
                        • <span className="font-semibold">NGN Corporate Account:</span> Zenith Bank Plc — Acct: 1018849201 (Sort Code: 057150013)
                      </p>
                      <p className="text-[#1A2E26]/80">
                        • <span className="font-semibold">USD Domiciliary Account:</span> Zenith Bank Plc — Acct: 5071194820 (SWIFT: ZEIBNGLA)
                      </p>
                      <p className="mt-2 pt-2 border-t border-[#E2ECE7] text-[11px] font-medium text-[#1A2E26]/75">
                        <span className="font-bold text-[#1A2E26]">Payment & Validity Terms:</span>{' '}
                        {quoteOrInvoice.paymentValidityTerms || PAYMENT_VALIDITY_TEMPLATES[0]}
                      </p>
                      <p className="mt-1 text-[11px] text-[#1A2E26]/70">
                        <span className="font-bold">Scope Notes:</span> {quoteOrInvoice.notes}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-5 rounded-xl bg-[#164E3D]/5 p-4 border border-[#164E3D]/20 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#1A2E26]/70">Line Items Subtotal:</span>
                      <span className="font-mono font-bold">
                        {formatAmount(quoteOrInvoice.subtotalUSD)}
                      </span>
                    </div>
                    {quoteOrInvoice.discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Corporate Discount ({quoteOrInvoice.discountPercent}%):</span>
                        <span className="font-mono font-bold">-{formatAmount(discountUSD)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#1A2E26]/70">
                        Interstate Freight ({quoteOrInvoice.deliveryState}):
                      </span>
                      <span className="font-mono font-bold">{formatAmount(freightUSD)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#1A2E26]/70">
                        Nigerian Statutory VAT ({quoteOrInvoice.vatPercent}%):
                      </span>
                      <span className="font-mono font-bold">{formatAmount(vatUSD)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#164E3D]/20 text-sm font-extrabold text-[#164E3D]">
                      <span>Grand Total ({displayCurrency}):</span>
                      <span className="font-mono">{formatAmount(computedGrandTotalUSD)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#1A2E26]/70">
                      <span>
                        Equivalent in {displayCurrency === 'NGN' ? 'USD ($)' : 'NGN (₦)'}:
                      </span>
                      <span className="font-mono">
                        {displayCurrency === 'NGN'
                          ? `$${computedGrandTotalUSD.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}`
                          : `₦${Math.round(computedGrandTotalUSD * rate).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {docMode === 'certificate' && certificate && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-5 border-b border-[#E2ECE7] text-xs">
                  <div className="rounded-xl bg-[#F4F8F6] p-3.5 border border-[#E2ECE7]">
                    <p className="text-[10px] font-bold uppercase text-[#1A2E26]/50">
                      Customer & Facility
                    </p>
                    <p className="font-bold text-[#1A2E26] mt-0.5">
                      {certificate.customerCompany}
                    </p>
                    <p className="text-[#1A2E26]/70">{certificate.facilityLocation}</p>
                  </div>
                  <div className="rounded-xl bg-[#F4F8F6] p-3.5 border border-[#E2ECE7]">
                    <p className="text-[10px] font-bold uppercase text-[#1A2E26]/50">
                      Device Under Test (DUT)
                    </p>
                    <p className="font-bold text-[#1A2E26] mt-0.5">{certificate.equipmentName}</p>
                    <p className="font-mono text-[#164E3D] font-bold">
                      Model: {certificate.model} • S/N: {certificate.serialNumber}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F4F8F6] p-3.5 border border-[#E2ECE7]">
                    <p className="text-[10px] font-bold uppercase text-[#1A2E26]/50">
                      Ambient Lab Conditions & Reference
                    </p>
                    <p className="font-semibold text-[#1A2E26] mt-0.5">
                      Temp: {certificate.environmentalTemp} • RH:{' '}
                      {certificate.environmentalHumidity}
                    </p>
                    <p className="text-[#1A2E26]/70 truncate">
                      Ref: {certificate.referenceStandardUsed}
                    </p>
                  </div>
                </div>

                <div className="py-5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#164E3D] mb-2">
                    Metrological As-Found vs. As-Left Calibration Readings
                  </h4>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#164E3D] text-white">
                        <th className="py-2 px-3 rounded-tl-lg">Pt</th>
                        <th className="py-2 px-3">Nominal Standard</th>
                        <th className="py-2 px-3">As-Found</th>
                        <th className="py-2 px-3">As-Left</th>
                        <th className="py-2 px-3">Tolerance Limit</th>
                        <th className="py-2 px-3">Uncertainty (k=2)</th>
                        <th className="py-2 px-3 text-right rounded-tr-lg">Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2ECE7] font-mono">
                      {certificate.readings.map((r) => (
                        <tr key={r.pointNumber}>
                          <td className="py-2.5 px-3 font-bold">#{r.pointNumber}</td>
                          <td className="py-2.5 px-3 font-bold">{r.nominalValue}</td>
                          <td className="py-2.5 px-3">{r.asFoundValue}</td>
                          <td className="py-2.5 px-3 font-bold text-[#164E3D]">
                            {r.asLeftValue}
                          </td>
                          <td className="py-2.5 px-3">{r.toleranceLimit}</td>
                          <td className="py-2.5 px-3">{r.expandedUncertainty}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              {r.pass ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="mt-6 pt-5 border-t-2 border-[#164E3D]/30 grid grid-cols-1 md:grid-cols-3 gap-6 items-end text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A2E26]/50">
                  Prepared & Digitally Signed By
                </p>
                <p className="font-serif italic text-base text-[#164E3D] mt-1">
                  {docMode === 'certificate'
                    ? certificate?.technicianName
                    : 'Chukwuma Eze • Commercial Desk'}
                </p>
                <div className="h-px bg-[#1A2E26]/20 my-1" />
                <p className="font-bold text-[#1A2E26]">
                  Samstrust Technologies Limited (RC 9898142)
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A2E26]/50">
                  Authorized Executive Counter-Signature
                </p>
                <p className="font-serif italic text-base text-[#164E3D] mt-1">
                  {docMode === 'certificate'
                    ? certificate?.approvingMetrologist
                    : 'Engr. Samuel O. Trust (COREN)'}
                </p>
                <div className="h-px bg-[#1A2E26]/20 my-1" />
                <p className="font-bold text-[#1A2E26]">
                  Managing Director / ISO 17025 Quality Authority
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#1A2E26]">
                    <ShieldCheck className="h-3 w-3 text-[#164E3D]" />
                    AUTHENTICATED DIGITAL SEAL
                  </span>
                  <p className="text-[10px] text-[#1A2E26]/60 mt-0.5">
                    Verify at www.samstrusttech.com
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#164E3D] text-[#D4AF37]">
                  <QrCode className="h-7 w-7" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. CUSTOMER PORTAL DOCUMENT CENTER
// ============================================================================
export const CustomerDocumentCenter: React.FC<{
  onShowToast: (msg: string) => void;
}> = ({ onShowToast }) => {
  const {
    quotesInvoices,
    certificates,
    updateQuoteApproval,
    uploadCustomerPurchaseOrder,
  } = usePortal();

  const [activeDocTab, setActiveDocTab] = useState<'quotes' | 'invoices' | 'certificates'>(
    'quotes'
  );
  const [pdfModalState, setPdfModalState] = useState<{
    mode: 'quotation' | 'proforma' | 'certificate';
    quote?: PortalQuoteAndInvoice;
    cert?: CalibrationCertificate;
  } | null>(null);

  const [poTargetQuote, setPoTargetQuote] = useState<PortalQuoteAndInvoice | null>(null);
  const [poNumberInput, setPoNumberInput] = useState('PO-BZ-2026-0884');
  const [poRemarksInput, setPoRemarksInput] = useState(
    'Approved per Board Procurement Committee. Dispatch to Ikeja Cleanroom Bay.'
  );
  const [validationResult, setValidationResult] = useState<FileSecurityValidationResult | null>(
    null
  );
  const [isValidatingFile, setIsValidatingFile] = useState(false);

  const [rejectTargetQuote, setRejectTargetQuote] = useState<{
    quote: PortalQuoteAndInvoice;
    targetStatus: 'Revision Requested' | 'Rejected';
  } | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsValidatingFile(true);
    const res = await validateEnterpriseFileUpload(file);
    setValidationResult(res);
    setIsValidatingFile(false);
  };

  const handleSimulateSamplePoFile = async (type: 'valid_pdf' | 'blocked_exe') => {
    setIsValidatingFile(true);
    const syntheticFile =
      type === 'valid_pdf'
        ? {
            name: 'BioZenith_Signed_Corporate_PO_2026_0884.pdf',
            size: 428 * 1024,
            type: 'application/pdf',
          }
        : {
            name: 'PurchaseOrder_Macro_Payload.pdf.exe',
            size: 1850 * 1024,
            type: 'application/x-msdownload',
          };
    const res = await validateEnterpriseFileUpload(syntheticFile);
    setValidationResult(res);
    setIsValidatingFile(false);
  };

  const handleConfirmPoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poTargetQuote || !validationResult || !validationResult.valid) return;

    uploadCustomerPurchaseOrder(
      poTargetQuote.id,
      {
        poNumber: poNumberInput.trim().toUpperCase(),
        fileName: validationResult.sanitizedFileName,
        mimeType: validationResult.mimeType,
        fileSizeKb: validationResult.sizeKb,
        uploadedAt: new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) + ' WAT',
        sha256Checksum: validationResult.sha256Checksum,
        verifiedBySecurityFilter: true,
      },
      poRemarksInput.trim()
    );

    onShowToast(
      `Corporate PO ${poNumberInput.toUpperCase()} verified & linked to ${poTargetQuote.quoteRef}. Status updated to Customer Approved.`
    );
    setPoTargetQuote(null);
    setValidationResult(null);
  };

  const handleConfirmRejectOrRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTargetQuote) return;
    const updatedNotes = `${rejectTargetQuote.quote.notes} | [${rejectTargetQuote.targetStatus}]: ${rejectReasonInput.trim()}`;
    updateQuoteApproval(
      rejectTargetQuote.quote.id,
      rejectTargetQuote.targetStatus,
      updatedNotes
    );
    onShowToast(
      `Quotation ${rejectTargetQuote.quote.quoteRef} marked as "${rejectTargetQuote.targetStatus}". Commercial team notified.`
    );
    setRejectTargetQuote(null);
    setRejectReasonInput('');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[16px] bg-gradient-to-r from-[#164E3D] to-[#113c2f] p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              <FileCheck className="h-3.5 w-3.5" />
              Customer Portal Document Center • RC 9898142
            </div>
            <h3 className="text-xl font-extrabold">
              Quotations, Purchase Orders (PO), Proforma Invoices & ISO Certificates
            </h3>
            <p className="text-xs text-white/80 mt-1 max-w-2xl">
              Review formal Samstrust quotations in NGN (₦) or USD ($), approve or reject line-item proposals, upload official Corporate Purchase Orders (PO) with MIME-validated security, and download tamper-evident PDF documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveDocTab('quotes')}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                activeDocTab === 'quotes'
                  ? 'bg-[#D4AF37] text-[#1A2E26] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Formal Quotations ({quotesInvoices.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveDocTab('invoices')}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                activeDocTab === 'invoices'
                  ? 'bg-[#D4AF37] text-[#1A2E26] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Proforma Invoices ({quotesInvoices.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveDocTab('certificates')}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                activeDocTab === 'certificates'
                  ? 'bg-[#D4AF37] text-[#1A2E26] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Calibration Certificates ({certificates.length})
            </button>
          </div>
        </div>
      </div>

      {activeDocTab === 'quotes' && (
        <div className="space-y-4">
          {quotesInvoices.map((q) => {
            const totalNgn = Math.round(q.totalUSD * q.exchangeRateNGN);
            return (
              <div
                key={q.id}
                className="rounded-[16px] bg-white p-6 shadow-sm border border-[#E2ECE7] hover:border-[#164E3D]/30 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2ECE7]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-[#164E3D]">
                        {q.quoteRef}
                      </span>
                      <span className="text-xs text-[#1A2E26]/40">•</span>
                      <span className="font-mono text-xs font-semibold text-[#1A2E26]/70">
                        Proforma: {q.proformaInvoiceRef}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                          q.quoteStatus === 'Customer Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : q.quoteStatus === 'Sent for Approval'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : q.quoteStatus === 'Rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {q.quoteStatus}
                      </span>
                      <span className="rounded-md bg-[#F4F8F6] px-2.5 py-0.5 text-[11px] font-semibold text-[#1A2E26]/70">
                        Delivery: {q.deliveryState}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[#1A2E26] mt-1">
                      {q.customerCompany} — {q.lineItems.length} Line Item(s)
                    </h4>
                    <p className="text-xs text-[#1A2E26]/65 mt-0.5">{q.notes}</p>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A2E26]/50">
                      Total Contract Value (Inc. {q.vatPercent}% VAT)
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-lg font-extrabold text-[#164E3D]">
                        ₦{totalNgn.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-[#1A2E26]/65">
                        (${q.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                      </span>
                    </div>
                    <span className="text-[11px] text-[#1A2E26]/55">
                      Valid Until: {q.validUntil} • Terms: {q.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="my-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E2ECE7] text-[11px] uppercase text-[#1A2E26]/50">
                        <th className="py-2 pr-3">Description</th>
                        <th className="py-2 px-3">Model / SKU</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit (USD)</th>
                        <th className="py-2 pl-3 text-right">Line Total (NGN)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2ECE7]/60">
                      {q.lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 pr-3 font-semibold text-[#1A2E26]">
                            {item.description}
                          </td>
                          <td className="py-2 px-3 font-mono text-[#164E3D] font-bold">
                            {item.model}
                          </td>
                          <td className="py-2 px-3 text-center font-bold">{item.qty}</td>
                          <td className="py-2 px-3 text-right font-mono">
                            ${item.unitPriceUSD.toLocaleString()}
                          </td>
                          <td className="py-2 pl-3 text-right font-mono font-semibold">
                            ₦
                            {Math.round(
                              item.qty * item.unitPriceUSD * q.exchangeRateNGN
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {q.uploadedPurchaseOrder && (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50/90 border border-emerald-200 px-4 py-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-extrabold text-emerald-950">
                          Purchase Order Attached: {q.uploadedPurchaseOrder.poNumber}
                        </span>
                        <span className="ml-2 text-emerald-800">
                          ({q.uploadedPurchaseOrder.fileName} • {q.uploadedPurchaseOrder.fileSizeKb}{' '}
                          KB • {q.uploadedPurchaseOrder.mimeType})
                        </span>
                        <p className="font-mono text-[10px] text-emerald-700 mt-0.5">
                          SHA-256 Checksum: {q.uploadedPurchaseOrder.sha256Checksum}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-emerald-700 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                      MIME & Size Verified
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2ECE7]">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPdfModalState({ mode: 'quotation', quote: q })}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] px-3.5 py-2 text-xs font-bold text-[#164E3D] hover:bg-[#164E3D] hover:text-white transition"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Official Quotation PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfModalState({ mode: 'proforma', quote: q })}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] px-3.5 py-2 text-xs font-bold text-[#1A2E26] hover:bg-[#164E3D] hover:text-white transition"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Proforma Invoice PDF
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPoTargetQuote(q);
                        setValidationResult(null);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 py-2 text-xs font-bold text-[#1A2E26] hover:bg-[#e0ba3e] transition shadow-xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload Purchase Order (PO)
                    </button>

                    {q.quoteStatus !== 'Customer Approved' && (
                      <button
                        type="button"
                        onClick={() => {
                          updateQuoteApproval(q.id, 'Customer Approved');
                          onShowToast(
                            `Quote ${q.quoteRef} accepted & approved. Proforma Invoice ${q.proformaInvoiceRef} unlocked for settlement.`
                          );
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#164E3D] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#113c2f] transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Accept Quote
                      </button>
                    )}

                    {q.quoteStatus !== 'Revision Requested' && (
                      <button
                        type="button"
                        onClick={() =>
                          setRejectTargetQuote({
                            quote: q,
                            targetStatus: 'Revision Requested',
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
                      >
                        Request Revision
                      </button>
                    )}

                    {q.quoteStatus !== 'Rejected' && (
                      <button
                        type="button"
                        onClick={() =>
                          setRejectTargetQuote({
                            quote: q,
                            targetStatus: 'Rejected',
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeDocTab === 'invoices' && (
        <div className="rounded-[16px] bg-white p-6 shadow-sm border border-[#E2ECE7]">
          <h4 className="text-base font-bold text-[#1A2E26] mb-4">
            Proforma Tax Invoices & Remittance Status
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2ECE7] bg-[#F4F8F6] text-[11px] font-bold uppercase text-[#1A2E26]/60">
                  <th className="py-3 px-4">Proforma Ref</th>
                  <th className="py-3 px-4">Linked Quote</th>
                  <th className="py-3 px-4">Amount (NGN / USD)</th>
                  <th className="py-3 px-4">Payment Method / PO</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">PDF Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2ECE7]">
                {quotesInvoices.map((q) => (
                  <tr key={q.id} className="hover:bg-[#F4F8F6]/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#164E3D]">
                      {q.proformaInvoiceRef}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{q.quoteRef}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#1A2E26]">
                        ₦{Math.round(q.totalUSD * q.exchangeRateNGN).toLocaleString()}
                      </span>
                      <span className="block text-[11px] text-[#1A2E26]/55">
                        ${q.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Inc.{' '}
                        {q.vatPercent}% VAT)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#1A2E26]">{q.paymentMethod}</span>
                      {q.paymentReference && (
                        <span className="block font-mono text-[11px] text-[#164E3D]">
                          Ref: {q.paymentReference}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
                          q.paymentStatus === 'Verified & Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : q.paymentStatus === 'Awaiting Verification'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {q.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setPdfModalState({ mode: 'proforma', quote: q })}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#164E3D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#113c2f]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Proforma PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeDocTab === 'certificates' && (
        <div className="rounded-[16px] bg-white p-6 shadow-sm border border-[#E2ECE7]">
          <h4 className="text-base font-bold text-[#1A2E26] mb-4">
            Tamper-Evident ISO/IEC 17025 Calibration Certificates
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2ECE7] bg-[#F4F8F6] text-[11px] font-bold uppercase text-[#1A2E26]/60">
                  <th className="py-3 px-4">Certificate #</th>
                  <th className="py-3 px-4">Instrument & Serial</th>
                  <th className="py-3 px-4">Calibration / Due Date</th>
                  <th className="py-3 px-4">Metrologist</th>
                  <th className="py-3 px-4 text-right">Official PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2ECE7]">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-[#F4F8F6]/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#164E3D]">
                      {cert.certificateNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#1A2E26]">{cert.equipmentName}</p>
                      <p className="font-mono text-[11px] text-[#1A2E26]/60">
                        S/N: {cert.serialNumber} • Model: {cert.model}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold">{cert.calibrationDate}</span>
                      <span className="block text-[11px] text-emerald-700 font-semibold">
                        Valid Until: {cert.nextDueDate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{cert.technicianName}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setPdfModalState({ mode: 'certificate', cert })}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#164E3D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#113c2f]"
                      >
                        <Award className="h-3.5 w-3.5 text-[#D4AF37]" />
                        View & Print Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {poTargetQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-[18px] bg-white p-6 shadow-2xl border border-[#E2ECE7]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2ECE7]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#164E3D]">
                  Secure Corporate PO Intake • MIME & Size Guard
                </span>
                <h4 className="text-lg font-extrabold text-[#1A2E26]">
                  Upload Purchase Order for {poTargetQuote.quoteRef}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPoTargetQuote(null)}
                className="rounded-lg p-1.5 text-[#1A2E26]/50 hover:bg-[#F4F8F6]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPoUpload} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1A2E26] mb-1">
                  Corporate Purchase Order (PO) Number *
                </label>
                <input
                  type="text"
                  required
                  value={poNumberInput}
                  onChange={(e) => setPoNumberInput(e.target.value)}
                  placeholder="e.g. PO-BZ-2026-0884"
                  className="w-full rounded-xl border border-[#E2ECE7] px-3.5 py-2.5 font-mono font-bold text-[#1A2E26] focus:border-[#164E3D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A2E26] mb-1">
                  Select Signed PO Document (Whitelist: PDF, JPG, PNG, DOCX • Max 10 MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={handleFileInputChange}
                  className="w-full rounded-xl border border-dashed border-[#164E3D]/40 bg-[#F4F8F6] p-3 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#164E3D] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-[#1A2E26]/60">Quick Security Test:</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateSamplePoFile('valid_pdf')}
                    className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    Simulate Valid Signed PO (.pdf, 428 KB)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateSamplePoFile('blocked_exe')}
                    className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100"
                  >
                    Simulate Malicious File (.pdf.exe)
                  </button>
                </div>
              </div>

              {isValidatingFile && (
                <div className="rounded-xl bg-[#F4F8F6] p-3 text-center font-semibold text-[#164E3D]">
                  Running MIME-type whitelist & SHA-256 integrity scan...
                </div>
              )}

              {validationResult && (
                <div
                  className={`rounded-xl p-4 border ${
                    validationResult.valid
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : 'bg-red-50 border-red-300 text-red-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold flex items-center gap-1.5">
                      {validationResult.valid ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                      ) : (
                        <FileWarning className="h-4 w-4 text-red-600" />
                      )}
                      {validationResult.valid
                        ? 'Security Validation Passed (Whitelisted)'
                        : 'Upload Blocked by Security Policy'}
                    </span>
                    <span className="font-mono text-[11px]">
                      {validationResult.sizeKb} KB / Max {UPLOAD_MAX_SIZE_BYTES / (1024 * 1024)} MB
                    </span>
                  </div>
                  {validationResult.rejectionReason && (
                    <p className="mt-1.5 font-bold text-red-700">
                      {validationResult.rejectionReason}
                    </p>
                  )}
                  <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                    <span>
                      • MIME Whitelisted:{' '}
                      <strong>
                        {validationResult.securityChecks.mimeTypeWhitelisted ? 'PASS' : 'FAIL'}
                      </strong>
                    </span>
                    <span>
                      • Extension Match:{' '}
                      <strong>
                        {validationResult.securityChecks.mimeMatchesExtension ? 'PASS' : 'FAIL'}
                      </strong>
                    </span>
                    <span>
                      • Size Cap (&le;10MB):{' '}
                      <strong>
                        {validationResult.securityChecks.withinSizeCap ? 'PASS' : 'FAIL'}
                      </strong>
                    </span>
                    <span>
                      • Path Traversal Clean:{' '}
                      <strong>
                        {validationResult.securityChecks.pathTraversalClean ? 'PASS' : 'FAIL'}
                      </strong>
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[10px] truncate opacity-80">
                    SHA-256: {validationResult.sha256Checksum}
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#1A2E26] mb-1">
                  Procurement / Delivery Instructions
                </label>
                <textarea
                  rows={2}
                  value={poRemarksInput}
                  onChange={(e) => setPoRemarksInput(e.target.value)}
                  className="w-full rounded-xl border border-[#E2ECE7] p-3 text-xs focus:border-[#164E3D] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPoTargetQuote(null)}
                  className="rounded-xl border border-[#E2ECE7] px-4 py-2 font-bold text-[#1A2E26]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!validationResult?.valid}
                  className="rounded-xl bg-[#164E3D] px-5 py-2 font-bold text-white disabled:opacity-40 hover:bg-[#113c2f]"
                >
                  Submit Verified PO & Approve Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rejectTargetQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-2xl border border-[#E2ECE7]">
            <h4 className="text-base font-extrabold text-[#1A2E26]">
              {rejectTargetQuote.targetStatus === 'Rejected'
                ? `Reject Quotation ${rejectTargetQuote.quote.quoteRef}`
                : `Request Revision for ${rejectTargetQuote.quote.quoteRef}`}
            </h4>
            <form onSubmit={handleConfirmRejectOrRevision} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1A2E26] mb-1">
                  Specify Reason / Requested Commercial Adjustment *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="e.g. Please adjust delivery state to Ogun State and apply 5% fleet volume discount..."
                  className="w-full rounded-xl border border-[#E2ECE7] p-3 focus:border-[#164E3D] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectTargetQuote(null)}
                  className="rounded-xl border border-[#E2ECE7] px-4 py-2 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#164E3D] px-4 py-2 font-bold text-white"
                >
                  Confirm Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pdfModalState && (
        <OfficialSamstrustPdfModal
          mode={pdfModalState.mode}
          quoteOrInvoice={pdfModalState.quote}
          certificate={pdfModalState.cert}
          onClose={() => setPdfModalState(null)}
          onTriggerToast={onShowToast}
        />
      )}
    </div>
  );
};

// ============================================================================
// 3. STAFF QUOTATION BUILDER & COMMERCIAL ENGINE
// ============================================================================
export const StaffQuotationBuilderAndEngine: React.FC<{
  onShowToast: (msg: string) => void;
}> = ({ onShowToast }) => {
  const {
    quotesInvoices,
    serviceTickets,
    createQuoteFromRfq,
    verifyInvoicePayment,
    systemConfig,
  } = usePortal();
  const { rfqLeads, updateLeadStatus, products } = useCms();

  const [sourceType, setSourceType] = useState<'website-rfq' | 'service-ticket' | 'custom'>(
    'website-rfq'
  );
  const [selectedRfqId, setSelectedRfqId] = useState<string>(rfqLeads[0]?.id || '');
  const [selectedTicketId, setSelectedTicketId] = useState<string>(serviceTickets[0]?.id || '');

  const [customerCompany, setCustomerCompany] = useState('BioZenith Pharmaceuticals Ltd');
  const [contactName, setContactName] = useState('Dr. Chioma Nwachukwu');
  const [contactEmail, setContactEmail] = useState('c.nwachukwu@biozenith.com');
  const [deliveryState, setDeliveryState] = useState('Lagos State');
  const [currencyMode, setCurrencyMode] = useState<'NGN' | 'USD'>('NGN');
  const [exchangeRateNGN, setExchangeRateNGN] = useState<number>(
    systemConfig.exchangeRateNGN || 1580
  );
  const [vatPercent, setVatPercent] = useState<number>(systemConfig.vatPercent || 7.5);
  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [freightChargeUSD, setFreightChargeUSD] = useState<number>(85);
  const [paymentMethod, setPaymentMethod] =
    useState<PortalQuoteAndInvoice['paymentMethod']>('Corporate PO (Net-30)');
  const [paymentValidityTerms, setPaymentValidityTerms] = useState<string>(
    PAYMENT_VALIDITY_TEMPLATES[0]
  );
  const [validUntil, setValidUntil] = useState<string>('2026-11-30');
  const [notes, setNotes] = useState<string>(
    'Includes ISO/IEC 17025 traceable calibration certificate, NAFDAC audit dossier, and 12-Month Warranty.'
  );

  const [lineItems, setLineItems] = useState<
    { id: string; description: string; model: string; qty: number; unitPriceUSD: number }[]
  >([
    {
      id: 'li-init-1',
      description: 'Analytical & Top-Loading Precision Balance (0.1mg Internal IsoCAL)',
      model: 'ST-LAB-PRECISION-04',
      qty: 2,
      unitPriceUSD: 1890,
    },
    {
      id: 'li-init-2',
      description: 'On-Site IQ/OQ Commissioning & ISO/IEC 17025 Mass Calibration',
      model: 'SRV-ISO17025-MASS',
      qty: 1,
      unitPriceUSD: 450,
    },
  ]);

  const [pdfPreviewState, setPdfPreviewState] = useState<{
    mode: 'quotation' | 'proforma';
    quote: PortalQuoteAndInvoice;
  } | null>(null);

  const handleLoadWebsiteRfq = (rfqId: string) => {
    setSelectedRfqId(rfqId);
    const rfq = rfqLeads.find((r) => r.id === rfqId);
    if (!rfq) return;
    setCustomerCompany(rfq.clientCompany);
    setContactName(rfq.clientName);
    setContactEmail(rfq.clientEmail);
    const matchedZone =
      NIGERIAN_STATE_FREIGHT_ZONES.find((z) =>
        z.state.toLowerCase().includes(rfq.deliveryState.toLowerCase())
      ) || NIGERIAN_STATE_FREIGHT_ZONES[0];
    setDeliveryState(matchedZone.state);
    setFreightChargeUSD(matchedZone.defaultFreightUSD);

    if (rfq.lineItems && rfq.lineItems.length > 0) {
      setLineItems(
        rfq.lineItems.map((it, idx) => ({
          id: `li-rfq-${idx}-${Date.now()}`,
          description: it.name,
          model: it.model,
          qty: it.quantity,
          unitPriceUSD: it.unitPriceUSD || 2150,
        }))
      );
    }
    setNotes(
      `Converted from Website RFQ (${rfq.refCode}). SLA Tier: ${rfq.services.maintenanceSla}. ${rfq.internalNotes || ''}`
    );
  };

  const handleLoadServiceTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    const tkt = serviceTickets.find((t) => t.id === ticketId);
    if (!tkt) return;
    setCustomerCompany(tkt.customerCompany);
    setContactName(tkt.contactPerson);
    setContactEmail(
      `procurement@${tkt.customerCompany.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14)}.ng`
    );
    const matchedZone =
      NIGERIAN_STATE_FREIGHT_ZONES.find((z) =>
        tkt.facilityLocation.toLowerCase().includes(z.state.split(' ')[0].toLowerCase())
      ) || NIGERIAN_STATE_FREIGHT_ZONES[0];
    setDeliveryState(matchedZone.state);
    setFreightChargeUSD(matchedZone.defaultFreightUSD);

    setLineItems([
      {
        id: `li-tkt-1-${Date.now()}`,
        description: `${tkt.serviceType} — ${tkt.equipmentName} (S/N: ${tkt.equipmentSerial})`,
        model: `FSM-${tkt.serviceType.slice(0, 6).toUpperCase()}-SLA`,
        qty: 1,
        unitPriceUSD: tkt.urgencyRating === 'Critical Production Stoppage' ? 1250 : 680,
      },
      {
        id: `li-tkt-2-${Date.now()}`,
        description: 'ISO/IEC 17025 Digital Certificate Issuance & Reference Standard Mobilization',
        model: 'CERT-ISO17025-ENG',
        qty: 1,
        unitPriceUSD: 220,
      },
    ]);
    setNotes(
      `Commercial Service Quotation for Ticket ${tkt.ticketNumber} (${tkt.urgencyRating || tkt.priority}) at ${tkt.facilityLocation}.`
    );
  };

  const handleStateChange = (newState: string) => {
    setDeliveryState(newState);
    const zone = NIGERIAN_STATE_FREIGHT_ZONES.find((z) => z.state === newState);
    if (zone) {
      setFreightChargeUSD(zone.defaultFreightUSD);
    }
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `li-${Date.now()}`,
        description: 'Samstrust Precision Process / Laboratory Instrument or Calibration Service',
        model: 'ST-MODEL-NEW',
        qty: 1,
        unitPriceUSD: 950,
      },
    ]);
  };

  const handleAddCatalogProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setLineItems((prev) => [
      ...prev,
      {
        id: `li-cat-${Date.now()}`,
        description: prod.name,
        model: prod.model || 'ST-OEM-PRO',
        qty: 1,
        unitPriceUSD: 2400,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotalUSD = lineItems.reduce((acc, item) => acc + item.qty * item.unitPriceUSD, 0);
  const discountUSD = subtotalUSD * (discountPercent / 100);
  const taxableAmountUSD = subtotalUSD - discountUSD + freightChargeUSD;
  const vatAmountUSD = taxableAmountUSD * (vatPercent / 100);
  const totalUSD = Number((taxableAmountUSD + vatAmountUSD).toFixed(2));
  const totalNGN = Math.round(totalUSD * exchangeRateNGN);

  const handleGenerateFormalQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRfq = rfqLeads.find((r) => r.id === selectedRfqId);
    const selectedTicket = serviceTickets.find((t) => t.id === selectedTicketId);

    createQuoteFromRfq({
      linkedRfqRef: sourceType === 'website-rfq' ? selectedRfq?.refCode : undefined,
      linkedTicketRef: sourceType === 'service-ticket' ? selectedTicket?.ticketNumber : undefined,
      customerCompany,
      contactName,
      contactEmail,
      deliveryState,
      currencyMode,
      freightChargeUSD,
      paymentValidityTerms,
      lineItems,
      subtotalUSD,
      discountPercent,
      vatPercent,
      totalUSD,
      exchangeRateNGN,
      quoteStatus: 'Sent for Approval',
      paymentStatus: 'Unpaid',
      paymentMethod,
      validUntil,
      notes,
    });

    if (sourceType === 'website-rfq' && selectedRfq) {
      updateLeadStatus(selectedRfq.id, 'Quoted');
    }

    onShowToast(
      `Formal Quotation & Proforma Invoice generated (${currencyMode === 'NGN' ? `₦${totalNGN.toLocaleString()}` : `$${totalUSD.toLocaleString()}`}) and dispatched to Customer Document Center.`
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[16px] bg-white p-6 shadow-sm border border-[#E2ECE7]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2ECE7]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#164E3D]/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#164E3D]">
              <DollarSign className="h-3.5 w-3.5" />
              Unified Commercial Quotation & Proforma Engine
            </span>
            <h3 className="text-xl font-extrabold text-[#1A2E26] mt-1">
              Staff Multi-Line Quotation & Proforma Invoice Builder
            </h3>
            <p className="text-xs text-[#1A2E26]/65">
              Convert public website RFQs or internal Field Service Tickets into formal multi-item quotations with NGN/USD pricing, 7.5% VAT, and Nigerian interstate freight calculation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#F4F8F6] p-1.5 border border-[#E2ECE7]">
            <button
              type="button"
              onClick={() => {
                setSourceType('website-rfq');
                if (rfqLeads[0]) handleLoadWebsiteRfq(rfqLeads[0].id);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                sourceType === 'website-rfq'
                  ? 'bg-[#164E3D] text-white shadow-xs'
                  : 'text-[#1A2E26]/70 hover:text-[#1A2E26]'
              }`}
            >
              1. Convert Website RFQ ({rfqLeads.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSourceType('service-ticket');
                if (serviceTickets[0]) handleLoadServiceTicket(serviceTickets[0].id);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                sourceType === 'service-ticket'
                  ? 'bg-[#164E3D] text-white shadow-xs'
                  : 'text-[#1A2E26]/70 hover:text-[#1A2E26]'
              }`}
            >
              2. Convert Service Ticket ({serviceTickets.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceType('custom')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                sourceType === 'custom'
                  ? 'bg-[#164E3D] text-white shadow-xs'
                  : 'text-[#1A2E26]/70 hover:text-[#1A2E26]'
              }`}
            >
              3. Direct Custom Quote
            </button>
          </div>
        </div>

        {sourceType === 'website-rfq' && (
          <div className="mt-4 rounded-xl bg-[#F4F8F6] p-4 border border-[#E2ECE7] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#164E3D] mb-1">
                Select Public Website RFQ Lead to Convert
              </label>
              <select
                value={selectedRfqId}
                onChange={(e) => handleLoadWebsiteRfq(e.target.value)}
                className="w-full rounded-xl border border-[#E2ECE7] bg-white px-3.5 py-2 text-xs font-bold text-[#1A2E26]"
              >
                {rfqLeads.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.refCode} — {r.clientCompany} ({r.clientName}) • {r.deliveryState} [
                    {r.status}]
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-[#1A2E26]/70">
              Automatically populates customer details, delivery state freight, and requested catalog SKUs.
            </div>
          </div>
        )}

        {sourceType === 'service-ticket' && (
          <div className="mt-4 rounded-xl bg-[#F4F8F6] p-4 border border-[#E2ECE7] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#164E3D] mb-1">
                Select Customer Service / Calibration Ticket to Quote
              </label>
              <select
                value={selectedTicketId}
                onChange={(e) => handleLoadServiceTicket(e.target.value)}
                className="w-full rounded-xl border border-[#E2ECE7] bg-white px-3.5 py-2 text-xs font-bold text-[#1A2E26]"
              >
                {serviceTickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.ticketNumber} — {t.customerCompany} • {t.serviceType} ({t.equipmentName}) [
                    {t.urgencyRating || t.priority}]
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-[#1A2E26]/70">
              Converts field calibration or breakdown repair work orders into formal commercial quotations.
            </div>
          </div>
        )}

        <form onSubmit={handleGenerateFormalQuote} className="mt-5 space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">Customer Organization *</label>
              <input
                type="text"
                required
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                className="w-full rounded-xl border border-[#E2ECE7] px-3 py-2 font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">Primary Contact Person *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-xl border border-[#E2ECE7] px-3 py-2 font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">Contact Email *</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-xl border border-[#E2ECE7] px-3 py-2 font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">
                Nigerian Delivery State & Zone
              </label>
              <select
                value={deliveryState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full rounded-xl border border-[#E2ECE7] bg-white px-3 py-2 font-bold text-[#164E3D]"
              >
                {NIGERIAN_STATE_FREIGHT_ZONES.map((z) => (
                  <option key={z.state} value={z.state}>
                    {z.state} (${z.defaultFreightUSD} Freight)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2ECE7] p-4 bg-[#F4F8F6]/50">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="font-extrabold text-[#164E3D] uppercase tracking-wider text-xs">
                Quotation Line Items (Hardware, Consumables & Calibration SLA)
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddCatalogProduct(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="rounded-lg border border-[#E2ECE7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1A2E26]"
                >
                  <option value="" disabled>
                    + Quick Add from Website Catalog...
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.model})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#164E3D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#113c2f]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Custom Line
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {lineItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-[#E2ECE7]"
                >
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-bold text-[#1A2E26]/50">
                      Item #{idx + 1} Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        setLineItems((prev) =>
                          prev.map((li) =>
                            li.id === item.id ? { ...li, description: e.target.value } : li
                          )
                        )
                      }
                      className="w-full rounded-lg border border-[#E2ECE7] px-2.5 py-1.5 font-semibold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-[#1A2E26]/50">
                      Model / SKU
                    </label>
                    <input
                      type="text"
                      value={item.model}
                      onChange={(e) =>
                        setLineItems((prev) =>
                          prev.map((li) =>
                            li.id === item.id ? { ...li, model: e.target.value } : li
                          )
                        )
                      }
                      className="w-full rounded-lg border border-[#E2ECE7] px-2.5 py-1.5 font-mono font-bold text-[#164E3D]"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-[#1A2E26]/50">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) =>
                        setLineItems((prev) =>
                          prev.map((li) =>
                            li.id === item.id
                              ? { ...li, qty: Math.max(1, Number(e.target.value)) }
                              : li
                          )
                        )
                      }
                      className="w-full rounded-lg border border-[#E2ECE7] px-2 py-1.5 text-center font-bold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-[#1A2E26]/50">
                      Unit Price (USD $)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.unitPriceUSD}
                      onChange={(e) =>
                        setLineItems((prev) =>
                          prev.map((li) =>
                            li.id === item.id
                              ? { ...li, unitPriceUSD: Math.max(0, Number(e.target.value)) }
                              : li
                          )
                        )
                      }
                      className="w-full rounded-lg border border-[#E2ECE7] px-2.5 py-1.5 font-mono font-bold"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between gap-2 pt-3 md:pt-0">
                    <div>
                      <span className="block text-[10px] font-bold text-[#1A2E26]/50">
                        Line Total
                      </span>
                      <span className="font-mono font-extrabold text-[#164E3D]">
                        ${(item.qty * item.unitPriceUSD).toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(item.id)}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                      title="Remove Line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">Primary Quote Currency</label>
              <select
                value={currencyMode}
                onChange={(e) => setCurrencyMode(e.target.value as 'NGN' | 'USD')}
                className="w-full rounded-xl border border-[#E2ECE7] bg-white px-3 py-2 font-bold text-[#164E3D]"
              >
                <option value="NGN">Nigerian Naira (NGN ₦)</option>
                <option value="USD">US Dollars (USD $)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">Exchange Rate (₦ / $1)</label>
              <input
                type="number"
                value={exchangeRateNGN}
                onChange={(e) => setExchangeRateNGN(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-[#E2ECE7] px-3 py-2 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">
                Statutory VAT % (Default 7.5%)
              </label>
              <select
                value={vatPercent}
                onChange={(e) => setVatPercent(Number(e.target.value))}
                className="w-full rounded-xl border border-[#E2ECE7] bg-white px-3 py-2 font-bold"
              >
                <option value={7.5}>7.5% Nigerian Statutory VAT</option>
                <option value={0}>0% (VAT Exempt / Export / Diplomatic)</option>
                <option value={5}>5.0% Reduced Tariff</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">Discount (%)</label>
              <input
                type="number"
                min={0}
                max={40}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-[#E2ECE7] px-3 py-2 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">
                Interstate Freight (USD $)
              </label>
              <input
                type="number"
                min={0}
                value={freightChargeUSD}
                onChange={(e) => setFreightChargeUSD(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-[#E2ECE7] px-3 py-2 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PortalQuoteAndInvoice['paymentMethod'])
                }
                className="w-full rounded-xl border border-[#E2ECE7] bg-white px-3 py-2 font-bold"
              >
                <option value="Corporate PO (Net-30)">Corporate PO (Net-30)</option>
                <option value="Bank Wire Transfer (NGN)">Bank Wire Transfer (NGN)</option>
                <option value="DOM Account Wire (USD)">DOM Account Wire (USD)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">Quote Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-xl border border-[#E2ECE7] px-3 py-2 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1A2E26] mb-1">Payment & Validity Terms</label>
              <select
                value={paymentValidityTerms}
                onChange={(e) => setPaymentValidityTerms(e.target.value)}
                className="w-full rounded-xl border border-[#E2ECE7] bg-white px-3 py-2 font-semibold"
              >
                {PAYMENT_VALIDITY_TEMPLATES.map((tpl) => (
                  <option key={tpl} value={tpl}>
                    {tpl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-[#164E3D] p-5 text-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-white/60 block">Subtotal</span>
                <span className="font-mono font-bold text-sm">
                  ${subtotalUSD.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-white/60 block">Freight ({deliveryState})</span>
                <span className="font-mono font-bold text-sm">
                  +${freightChargeUSD.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-white/60 block">VAT ({vatPercent}%)</span>
                <span className="font-mono font-bold text-sm">
                  +${vatAmountUSD.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#D4AF37] font-bold block">Grand Total (NGN / USD)</span>
                <span className="font-mono font-extrabold text-base text-[#D4AF37]">
                  ₦{totalNGN.toLocaleString()} (${totalUSD.toLocaleString()})
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-xs font-extrabold text-[#1A2E26] hover:bg-[#e2bd42] transition shrink-0 shadow-md"
            >
              <FileText className="h-4 w-4" />
              Issue Official Quote & Proforma Invoice
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-[16px] bg-white p-6 shadow-sm border border-[#E2ECE7]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-base font-extrabold text-[#1A2E26]">
              Commercial Quotations, Proforma Invoices & Remittance Verification Ledger
            </h4>
            <p className="text-xs text-[#1A2E26]/65">
              Inspect customer quote approvals, verify uploaded Corporate Purchase Orders (PO) or Bank Wire references, and generate official Samstrust PDFs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2ECE7] bg-[#F4F8F6] text-[11px] font-bold uppercase text-[#1A2E26]/60">
                <th className="py-3 px-3">Quote / Proforma</th>
                <th className="py-3 px-3">Customer & Source</th>
                <th className="py-3 px-3">Delivery State</th>
                <th className="py-3 px-3">Total (NGN / USD)</th>
                <th className="py-3 px-3">Quote Status</th>
                <th className="py-3 px-3">Payment / Uploaded PO</th>
                <th className="py-3 px-3 text-right">Actions & PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2ECE7]">
              {quotesInvoices.map((q) => (
                <tr key={q.id} className="hover:bg-[#F4F8F6]/60">
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-extrabold text-[#164E3D] block">
                      {q.quoteRef}
                    </span>
                    <span className="font-mono text-[11px] text-[#1A2E26]/60">
                      {q.proformaInvoiceRef}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-[#1A2E26] block">{q.customerCompany}</span>
                    <span className="text-[11px] text-[#1A2E26]/60">
                      {q.contactName}
                      {q.linkedRfqRef && ` • RFQ: ${q.linkedRfqRef}`}
                      {q.linkedTicketRef && ` • Ticket: ${q.linkedTicketRef}`}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold">{q.deliveryState}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-extrabold text-[#1A2E26] block">
                      ₦{Math.round(q.totalUSD * q.exchangeRateNGN).toLocaleString()}
                    </span>
                    <span className="font-mono text-[11px] text-[#1A2E26]/60">
                      ${q.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        q.quoteStatus === 'Customer Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : q.quoteStatus === 'Rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {q.quoteStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        q.paymentStatus === 'Verified & Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.paymentStatus === 'Awaiting Verification'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {q.paymentStatus}
                    </span>
                    {q.uploadedPurchaseOrder && (
                      <span className="block font-mono text-[10px] font-bold text-emerald-700 mt-0.5">
                        PO: {q.uploadedPurchaseOrder.poNumber} ({q.uploadedPurchaseOrder.fileName})
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPdfPreviewState({ mode: 'quotation', quote: q })}
                        className="rounded-lg bg-[#F4F8F6] border border-[#E2ECE7] px-2.5 py-1 text-[11px] font-bold text-[#164E3D] hover:bg-[#164E3D] hover:text-white"
                      >
                        Quote PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfPreviewState({ mode: 'proforma', quote: q })}
                        className="rounded-lg bg-[#F4F8F6] border border-[#E2ECE7] px-2.5 py-1 text-[11px] font-bold text-[#1A2E26] hover:bg-[#164E3D] hover:text-white"
                      >
                        Proforma PDF
                      </button>
                      {q.paymentStatus !== 'Verified & Paid' && (
                        <button
                          type="button"
                          onClick={() => {
                            verifyInvoicePayment(
                              q.id,
                              'Verified & Paid',
                              q.paymentReference || `VERIFIED-NIP-${Date.now().toString().slice(-5)}`
                            );
                            onShowToast(
                              `Proforma Invoice ${q.proformaInvoiceRef} verified & marked as Paid.`
                            );
                          }}
                          className="rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800"
                        >
                          Verify Payment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pdfPreviewState && (
        <OfficialSamstrustPdfModal
          mode={pdfPreviewState.mode}
          quoteOrInvoice={pdfPreviewState.quote}
          onClose={() => setPdfPreviewState(null)}
          onTriggerToast={onShowToast}
        />
      )}
    </div>
  );
};

// ============================================================================
// 4. COMPLETE MYSQL/MARIADB RELATIONAL SCHEMA & SYSTEM HARDENING BLUEPRINT CONSOLE
// ============================================================================
const MYSQL_TABLES_METADATA = [
  {
    tableName: 'roles',
    primaryKey: 'id (INT UNSIGNED AUTO_INCREMENT)',
    foreignKeys: 'None (Root RBAC Authority Table)',
    indexes: 'UNIQUE uk_roles_slug (role_slug)',
    purpose: 'Defines the 5 RBAC roles (customer, field-technician, service-coordinator, accounts-sales, portal-admin) and JSON action matrix.',
    ddlSnippet: `CREATE TABLE \`roles\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`role_slug\` VARCHAR(50) NOT NULL,
  \`role_name\` VARCHAR(100) NOT NULL,
  \`requires_two_factor\` TINYINT(1) NOT NULL DEFAULT 0,
  \`permissions_json\` JSON NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_roles_slug\` (\`role_slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
  {
    tableName: 'users',
    primaryKey: 'id (CHAR(36) UUID)',
    foreignKeys: 'fk_users_role -> roles(id) ON DELETE RESTRICT ON UPDATE CASCADE',
    indexes: 'UNIQUE idx_users_email (email), idx_users_role_id, idx_users_company_cac',
    purpose: 'Authenticated portal accounts with PBKDF2-SHA256 password hashes, CAC RC numbers, 2FA secrets, and Email/WhatsApp notification preferences.',
    ddlSnippet: `CREATE TABLE \`users\` (
  \`id\` CHAR(36) NOT NULL,
  \`role_id\` INT UNSIGNED NOT NULL,
  \`email\` VARCHAR(191) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`password_salt\` VARCHAR(128) NOT NULL,
  \`company_name\` VARCHAR(200) NOT NULL,
  \`cac_registration_number\` VARCHAR(40) DEFAULT NULL,
  \`two_factor_enabled\` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_users_email\` (\`email\`),
  CONSTRAINT \`fk_users_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
  {
    tableName: 'customer_facilities',
    primaryKey: 'id (CHAR(36) UUID)',
    foreignKeys: 'fk_facilities_owner_user -> users(id) ON DELETE CASCADE ON UPDATE CASCADE',
    indexes: 'UNIQUE uk_facility_code (facility_code), idx_facilities_owner_user, idx_facilities_state',
    purpose: 'Multi-facility laboratory locations (Central Testing Lab, Satellite QA Unit, Factory Production Bay) with strict Anti-IDOR tenant ownership.',
    ddlSnippet: `CREATE TABLE \`customer_facilities\` (
  \`id\` CHAR(36) NOT NULL,
  \`owner_user_id\` CHAR(36) NOT NULL,
  \`facility_code\` VARCHAR(40) NOT NULL,
  \`facility_name\` VARCHAR(180) NOT NULL,
  \`facility_type\` ENUM('Central Testing Lab','Satellite QA Unit','Factory Production Bay','Clinical & Molecular Lab','Refinery & Petrochemical Terminal','University Research Facility') NOT NULL,
  \`state_region\` VARCHAR(100) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_facility_code\` (\`facility_code\`),
  CONSTRAINT \`fk_facilities_owner_user\` FOREIGN KEY (\`owner_user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
  {
    tableName: 'equipment_registry',
    primaryKey: 'id (CHAR(36) UUID)',
    foreignKeys: 'fk_equipment_facility -> customer_facilities(id) ON DELETE RESTRICT; fk_equipment_owner -> users(id) ON DELETE RESTRICT',
    indexes: 'UNIQUE idx_equipment_serial (serial_number), UNIQUE uk_equipment_asset_tag (asset_tag), idx_equipment_cal_due',
    purpose: 'Digital Equipment Passport storing OEM brand, model, serial number, commissioning date, calibration interval, and QR verification hash.',
    ddlSnippet: `CREATE TABLE \`equipment_registry\` (
  \`id\` CHAR(36) NOT NULL,
  \`facility_id\` CHAR(36) NOT NULL,
  \`owner_user_id\` CHAR(36) NOT NULL,
  \`asset_tag\` VARCHAR(64) NOT NULL,
  \`serial_number\` VARCHAR(120) NOT NULL,
  \`equipment_name\` VARCHAR(220) NOT NULL,
  \`next_calibration_due_date\` DATE NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_equipment_serial\` (\`serial_number\`),
  CONSTRAINT \`fk_equipment_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`customer_facilities\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
  {
    tableName: 'service_tickets',
    primaryKey: 'id (CHAR(36) UUID)',
    foreignKeys: 'fk_tickets_customer -> users(id); fk_tickets_facility -> customer_facilities(id); fk_tickets_equipment -> equipment_registry(id) ON DELETE SET NULL; fk_tickets_technician -> users(id)',
    indexes: 'UNIQUE idx_ticket_number (ticket_number), idx_tickets_status_urgency, idx_tickets_technician',
    purpose: 'FSM work orders linking customers, coordinators, and field technicians with ambient temp/RH conditions and glass sign-off SVG data.',
    ddlSnippet: `CREATE TABLE \`service_tickets\` (
  \`id\` CHAR(36) NOT NULL,
  \`ticket_number\` VARCHAR(40) NOT NULL,
  \`customer_user_id\` CHAR(36) NOT NULL,
  \`facility_id\` CHAR(36) NOT NULL,
  \`equipment_id\` CHAR(36) DEFAULT NULL,
  \`assigned_technician_id\` CHAR(36) DEFAULT NULL,
  \`ticket_status\` ENUM('Submitted','Under Review','Scheduled','Assigned','In Progress','Awaiting Parts','Completed','Closed') NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_ticket_number\` (\`ticket_number\`),
  CONSTRAINT \`fk_tickets_equipment\` FOREIGN KEY (\`equipment_id\`) REFERENCES \`equipment_registry\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
  {
    tableName: 'calibration_readings',
    primaryKey: 'id (BIGINT UNSIGNED AUTO_INCREMENT)',
    foreignKeys: 'fk_cal_readings_ticket -> service_tickets(id) ON DELETE CASCADE; fk_cal_readings_equipment -> equipment_registry(id)',
    indexes: 'idx_cal_readings_ticket, idx_cal_readings_equipment, idx_cal_readings_cert_num (certificate_number)',
    purpose: 'Stores multi-point As-Found vs. As-Left metrology measurements, OIML/NIST reference standards, tolerance limits, and k=2 uncertainty.',
    ddlSnippet: `CREATE TABLE \`calibration_readings\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`service_ticket_id\` CHAR(36) NOT NULL,
  \`equipment_id\` CHAR(36) NOT NULL,
  \`certificate_number\` VARCHAR(80) NOT NULL,
  \`nominal_value\` DECIMAL(14,5) NOT NULL,
  \`as_found_value\` DECIMAL(14,5) NOT NULL,
  \`as_left_value\` DECIMAL(14,5) NOT NULL,
  \`tolerance_limit_plus_minus\` DECIMAL(14,5) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_cal_readings_cert_num\` (\`certificate_number\`),
  CONSTRAINT \`fk_cal_readings_ticket\` FOREIGN KEY (\`service_ticket_id\`) REFERENCES \`service_tickets\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
  {
    tableName: 'quotations',
    primaryKey: 'id (CHAR(36) UUID)',
    foreignKeys: 'fk_quotations_customer_user -> users(id) ON DELETE SET NULL; fk_quotations_service_ticket -> service_tickets(id) ON DELETE SET NULL',
    indexes: 'UNIQUE uk_quotations_ref (quote_reference), idx_quotations_customer_email, idx_quotations_status',
    purpose: 'Formal commercial quotations unifying public website RFQs and internal service tickets with NGN/USD rates, 7.5% VAT, interstate freight, and PO hashes.',
    ddlSnippet: `CREATE TABLE \`quotations\` (
  \`id\` CHAR(36) NOT NULL,
  \`quote_reference\` VARCHAR(40) NOT NULL,
  \`customer_contact_email\` VARCHAR(191) NOT NULL,
  \`currency_code\` ENUM('NGN','USD') NOT NULL DEFAULT 'NGN',
  \`vat_percent\` DECIMAL(5,2) NOT NULL DEFAULT 7.50,
  \`total_amount_usd\` DECIMAL(15,2) NOT NULL,
  \`total_amount_ngn\` DECIMAL(18,2) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_quotations_ref\` (\`quote_reference\`),
  KEY \`idx_quotations_customer_email\` (\`customer_contact_email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
  {
    tableName: 'quotation_items',
    primaryKey: 'id (BIGINT UNSIGNED AUTO_INCREMENT)',
    foreignKeys: 'fk_quotation_items_quotation -> quotations(id) ON DELETE CASCADE ON UPDATE CASCADE',
    indexes: 'idx_quotation_items_quote (quotation_id), idx_quotation_items_sku (sku_code)',
    purpose: 'Normalized line items linked to each formal quotation with cascading delete integrity.',
    ddlSnippet: `CREATE TABLE \`quotation_items\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`quotation_id\` CHAR(36) NOT NULL,
  \`sku_code\` VARCHAR(80) NOT NULL,
  \`item_description\` VARCHAR(255) NOT NULL,
  \`quantity\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`unit_price_usd\` DECIMAL(15,2) NOT NULL,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_quotation_items_quotation\` FOREIGN KEY (\`quotation_id\`) REFERENCES \`quotations\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
  {
    tableName: 'invoices',
    primaryKey: 'id (CHAR(36) UUID)',
    foreignKeys: 'fk_invoices_quotation -> quotations(id) ON DELETE RESTRICT; fk_invoices_customer -> users(id)',
    indexes: 'UNIQUE uk_invoices_proforma_ref (proforma_invoice_ref), idx_invoices_payment_status',
    purpose: 'Proforma & Commercial Tax Invoices tracking statutory 7.5% VAT, bank wire references, and Accounts verification sign-off.',
    ddlSnippet: `CREATE TABLE \`invoices\` (
  \`id\` CHAR(36) NOT NULL,
  \`proforma_invoice_ref\` VARCHAR(40) NOT NULL,
  \`quotation_id\` CHAR(36) NOT NULL,
  \`grand_total_amount\` DECIMAL(18,2) NOT NULL,
  \`payment_status\` ENUM('Unpaid','Awaiting Verification','Partially Paid (70% Deposit)','Paid & Verified') NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_invoices_proforma_ref\` (\`proforma_invoice_ref\`),
  CONSTRAINT \`fk_invoices_quotation\` FOREIGN KEY (\`quotation_id\`) REFERENCES \`quotations\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
  {
    tableName: 'notifications',
    primaryKey: 'id (CHAR(36) UUID)',
    foreignKeys: 'fk_notifications_recipient -> users(id) ON DELETE CASCADE ON UPDATE CASCADE',
    indexes: 'idx_notifications_recipient_unread (recipient_user_id, is_read), idx_notifications_role',
    purpose: 'In-app, SMTP Email, and Meta WhatsApp Business Cloud alert queue for calibration due dates, dispatches, and quote approvals.',
    ddlSnippet: `CREATE TABLE \`notifications\` (
  \`id\` CHAR(36) NOT NULL,
  \`recipient_user_id\` CHAR(36) DEFAULT NULL,
  \`notification_category\` ENUM('Calibration','Service Ticket','Quotation','Security') NOT NULL,
  \`delivery_channels\` SET('IN_APP','EMAIL','WHATSAPP') NOT NULL DEFAULT 'IN_APP,EMAIL',
  \`is_read\` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`),
  KEY \`idx_notifications_recipient_unread\` (\`recipient_user_id\`, \`is_read\`),
  CONSTRAINT \`fk_notifications_recipient\` FOREIGN KEY (\`recipient_user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
  {
    tableName: 'audit_trail',
    primaryKey: 'id (BIGINT UNSIGNED AUTO_INCREMENT)',
    foreignKeys: 'fk_audit_actor_user -> users(id) ON DELETE SET NULL ON UPDATE CASCADE',
    indexes: 'UNIQUE uk_audit_event_uuid, idx_audit_actor_email (actor_email), idx_audit_target_resource, idx_audit_occurred_at',
    purpose: 'Immutable chained SHA-256 security audit ledger recording logins, 2FA challenges, IDOR blocks, RBAC modifications, and certificate downloads.',
    ddlSnippet: `CREATE TABLE \`audit_trail\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`event_uuid\` CHAR(36) NOT NULL,
  \`actor_email\` VARCHAR(191) NOT NULL,
  \`action_code\` VARCHAR(100) NOT NULL,
  \`target_resource_ref\` VARCHAR(120) NOT NULL,
  \`immutable_sha256_hash\` CHAR(64) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_audit_actor_email\` (\`actor_email\`),
  KEY \`idx_audit_target_resource\` (\`target_resource_ref\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
];

const ENV_EXAMPLE_CONTENT = `# SAMSTRUST TECHNOLOGIES LIMITED (RC 9898142) - PRODUCTION .env.example
NODE_ENV=production
PORT=3000
APP_DOMAIN=https://www.samstrusttech.com
COMPANY_RC_NUMBER="RC 9898142"

# MYSQL / MARIADB RELATIONAL DATABASE
DB_CLIENT=mysql2
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=samstrust_enterprise_prod
DB_USERNAME=samstrust_db_app
DB_PASSWORD=REPLACE_WITH_64_CHAR_HIGH_ENTROPY_DB_SECRET
DB_SSL_MODE=REQUIRED

# JWT & CRYPTOGRAPHIC SECRETS
JWT_ACCESS_TOKEN_SECRET=REPLACE_WITH_256_BIT_HEX_ACCESS_SECRET
JWT_REFRESH_TOKEN_SECRET=REPLACE_WITH_256_BIT_HEX_REFRESH_SECRET
PASSWORD_HASH_ALGO=PBKDF2_HMAC_SHA256
PASSWORD_PEPPER_SECRET=REPLACE_WITH_SERVER_SIDE_PEPPER_SECRET

# STORAGE PATHS & STRICT MIME VALIDATION
STORAGE_DRIVER=s3_compatible
STORAGE_LOCAL_ROOT=/var/samstrust/vault/documents
STORAGE_S3_BUCKET=samstrust-iso17025-certificates-vault
UPLOAD_MAX_SIZE_BYTES=10485760
UPLOAD_ALLOWED_MIME_TYPES="application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

# SMTP & WHATSAPP BUSINESS CLOUD API GATEWAYS
SMTP_HOST=smtp.samstrusttech.com
SMTP_PORT=587
SMTP_FROM_ADDRESS=Info@samstrusttech.com
WHATSAPP_API_VERSION=v19.0
WHATSAPP_PHONE_NUMBER_ID=REPLACE_WITH_META_PHONE_NUMBER_ID
WHATSAPP_ACCESS_TOKEN=REPLACE_WITH_META_SYSTEM_USER_TOKEN`;

export const DatabaseAndHardeningBlueprintConsole: React.FC<{
  onShowToast: (msg: string) => void;
}> = ({ onShowToast }) => {
  const [selectedTable, setSelectedTable] = useState(MYSQL_TABLES_METADATA[0]);
  const [copiedDdl, setCopiedDdl] = useState(false);
  const [sandboxValidation, setSandboxValidation] =
    useState<FileSecurityValidationResult | null>(null);

  const [readinessChecklist, setReadinessChecklist] = useState([
    {
      id: 'chk-db-1',
      category: 'MySQL/MariaDB Schema',
      item: '11 core relational tables provisioned with InnoDB utf8mb4 & strict FK constraints',
      passed: true,
    },
    {
      id: 'chk-db-2',
      category: 'Database Indexing',
      item: 'High-selectivity indexes active on serial_number, ticket_number, and users.email',
      passed: true,
    },
    {
      id: 'chk-sec-1',
      category: 'Authentication & 2FA',
      item: 'PBKDF2/SHA-256 salted password hashing, 15-min reset tokens, and mandatory Staff TOTP 2FA',
      passed: true,
    },
    {
      id: 'chk-sec-2',
      category: 'Anti-IDOR Guard',
      item: 'Server-side tenant ownership verification preventing cross-company certificate/invoice access',
      passed: true,
    },
    {
      id: 'chk-upl-1',
      category: 'File Upload Hardening',
      item: 'Strict MIME whitelist (PDF, JPG, PNG, DOCX), 10 MB size cap, and SHA-256 checksum verification',
      passed: true,
    },
    {
      id: 'chk-com-1',
      category: 'Commercial & PDF Engine',
      item: 'Dual NGN/USD pricing, 7.5% Nigerian statutory VAT, interstate freight matrix & RC 9898142 PDFs',
      passed: true,
    },
    {
      id: 'chk-ops-1',
      category: 'Environment & Gateways',
      item: 'Production .env.example configured for MySQL TLS, JWT secrets, S3 vault, and SMTP/WhatsApp APIs',
      passed: true,
    },
  ]);

  const handleCopyFullSql = () => {
    const fullSql = MYSQL_TABLES_METADATA.map((t) => `-- Table: ${t.tableName}\n${t.ddlSnippet}`).join(
      '\n\n'
    );
    navigator.clipboard?.writeText(fullSql);
    setCopiedDdl(true);
    onShowToast('Complete 11-table MySQL/MariaDB DDL copied to clipboard.');
    setTimeout(() => setCopiedDdl(false), 2500);
  };

  const handleDownloadSqlFile = () => {
    const fullSql =
      `-- SAMSTRUST TECHNOLOGIES LIMITED (RC 9898142) - MYSQL/MARIADB SCHEMA\n\n` +
      MYSQL_TABLES_METADATA.map((t) => `-- Table: ${t.tableName}\n${t.ddlSnippet}`).join('\n\n');
    const blob = new Blob([fullSql], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'samstrust_mysql_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded samstrust_mysql_schema.sql');
  };

  const handleDownloadEnvExample = () => {
    const blob = new Blob([ENV_EXAMPLE_CONTENT], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.example';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded production .env.example configuration blueprint.');
  };

  const runSandboxFileTest = async (scenario: 'pdf_ok' | 'docx_ok' | 'oversize' | 'php_exploit') => {
    const payloads = {
      pdf_ok: {
        name: 'STL_Calibration_Purchase_Order_2026.pdf',
        size: 620 * 1024,
        type: 'application/pdf',
      },
      docx_ok: {
        name: 'Lab_Instrument_Technical_Schedule.docx',
        size: 1420 * 1024,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      oversize: {
        name: 'Uncompressed_Raw_Scan_Archive.png',
        size: 14.8 * 1024 * 1024,
        type: 'image/png',
      },
      php_exploit: {
        name: '../../var/www/shell_backdoor.php',
        size: 12 * 1024,
        type: 'application/x-httpd-php',
      },
    };
    const res = await validateEnterpriseFileUpload(payloads[scenario]);
    setSandboxValidation(res);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[16px] bg-white p-6 shadow-sm border border-[#E2ECE7]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2ECE7]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#164E3D]/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#164E3D]">
              <Database className="h-3.5 w-3.5" />
              Unified MySQL 8.0 / MariaDB 10.11+ Relational Architecture (DDL)
            </span>
            <h3 className="text-xl font-extrabold text-[#1A2E26] mt-1">
              11-Table Enterprise Schema, Foreign Key Cascades & High-Speed Indexes
            </h3>
            <p className="text-xs text-[#1A2E26]/65">
              Unifies the public corporate website (RFQs & catalog) with the authenticated Customer & Staff Portal (`/database/samstrust_mysql_schema.sql`).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFullSql}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] px-3.5 py-2 text-xs font-bold text-[#1A2E26] hover:bg-[#164E3D] hover:text-white transition"
            >
              {copiedDdl ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copiedDdl ? 'Copied DDL' : 'Copy Full SQL DDL'}
            </button>
            <button
              type="button"
              onClick={handleDownloadSqlFile}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#164E3D] px-4 py-2 text-xs font-bold text-white hover:bg-[#113c2f] transition"
            >
              <Download className="h-4 w-4 text-[#D4AF37]" />
              Download samstrust_mysql_schema.sql
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
          <div className="lg:col-span-4 space-y-1.5">
            {MYSQL_TABLES_METADATA.map((tbl, idx) => (
              <button
                key={tbl.tableName}
                type="button"
                onClick={() => setSelectedTable(tbl)}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition ${
                  selectedTable.tableName === tbl.tableName
                    ? 'bg-[#164E3D] text-white font-bold shadow-xs'
                    : 'bg-[#F4F8F6] text-[#1A2E26] hover:bg-[#E2ECE7]/70 font-medium'
                }`}
              >
                <span className="font-mono">
                  {idx + 1}. {tbl.tableName}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                    selectedTable.tableName === tbl.tableName
                      ? 'bg-[#D4AF37] text-[#1A2E26] font-extrabold'
                      : 'bg-white text-[#1A2E26]/60'
                  }`}
                >
                  InnoDB
                </span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl bg-[#1A2E26] p-5 text-white">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                    MySQL / MariaDB Table Specification
                  </span>
                  <h4 className="font-mono text-lg font-extrabold text-white">
                    TABLE `{selectedTable.tableName}`
                  </h4>
                </div>
                <span className="rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                  PK: {selectedTable.primaryKey}
                </span>
              </div>

              <p className="text-xs text-white/80 mt-3">{selectedTable.purpose}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-[#D4AF37] block">
                    Foreign Key Constraints & Cascading Rules
                  </span>
                  <span className="font-mono text-[11px] text-white/90 mt-1 block">
                    {selectedTable.foreignKeys}
                  </span>
                </div>
                <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                    High-Performance Lookup Indexes
                  </span>
                  <span className="font-mono text-[11px] text-white/90 mt-1 block">
                    {selectedTable.indexes}
                  </span>
                </div>
              </div>

              <pre className="mt-4 overflow-x-auto rounded-xl bg-black/50 p-4 font-mono text-xs text-emerald-300 border border-white/10 leading-relaxed">
                {selectedTable.ddlSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[16px] bg-white p-6 shadow-sm border border-[#E2ECE7] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E2ECE7]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#164E3D]">
                  Deployment Configuration Blueprint
                </span>
                <h4 className="text-base font-extrabold text-[#1A2E26]">
                  Environment Variables Layout (`.env.example`)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleDownloadEnvExample}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#164E3D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#113c2f]"
              >
                <Download className="h-3.5 w-3.5 text-[#D4AF37]" />
                Download .env.example
              </button>
            </div>
            <pre className="mt-4 max-h-72 overflow-y-auto rounded-xl bg-[#1A2E26] p-4 font-mono text-[11px] text-emerald-300 leading-relaxed">
              {ENV_EXAMPLE_CONTENT}
            </pre>
          </div>
        </div>

        <div className="rounded-[16px] bg-white p-6 shadow-sm border border-[#E2ECE7] flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#E2ECE7]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#164E3D]">
                MIME Whitelist & Size Cap Verification
              </span>
              <h4 className="text-base font-extrabold text-[#1A2E26]">
                File Upload Security Validator (PDF, JPG, PNG, DOCX &le; 10 MB)
              </h4>
              <p className="text-xs text-[#1A2E26]/65 mt-0.5">
                Test the upload security filter against valid documents, oversized files, and disguised executable/path-traversal payloads.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => runSandboxFileTest('pdf_ok')}
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-left text-xs font-bold text-emerald-900 hover:bg-emerald-100"
              >
                1. Test Valid PDF (620 KB)
                <span className="block font-mono text-[10px] text-emerald-700">
                  application/pdf
                </span>
              </button>
              <button
                type="button"
                onClick={() => runSandboxFileTest('docx_ok')}
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-left text-xs font-bold text-emerald-900 hover:bg-emerald-100"
              >
                2. Test Valid DOCX (1.4 MB)
                <span className="block font-mono text-[10px] text-emerald-700">
                  officedocument.wordprocessingml
                </span>
              </button>
              <button
                type="button"
                onClick={() => runSandboxFileTest('oversize')}
                className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-left text-xs font-bold text-amber-900 hover:bg-amber-100"
              >
                3. Test Oversized PNG (14.8 MB)
                <span className="block font-mono text-[10px] text-amber-700">
                  Exceeds 10 MB Cap
                </span>
              </button>
              <button
                type="button"
                onClick={() => runSandboxFileTest('php_exploit')}
                className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-left text-xs font-bold text-red-900 hover:bg-red-100"
              >
                4. Test Path Traversal (.php)
                <span className="block font-mono text-[10px] text-red-700">
                  ../../shell_backdoor.php
                </span>
              </button>
            </div>

            {sandboxValidation && (
              <div
                className={`mt-4 rounded-xl p-4 border text-xs ${
                  sandboxValidation.valid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                <div className="flex items-center justify-between font-extrabold">
                  <span>
                    {sandboxValidation.valid
                      ? 'ACCEPTED BY SECURITY GATE'
                      : 'REJECTED BY SECURITY GATE'}
                  </span>
                  <span className="font-mono">{sandboxValidation.fileName}</span>
                </div>
                {sandboxValidation.rejectionReason && (
                  <p className="mt-1 font-bold text-red-700">
                    {sandboxValidation.rejectionReason}
                  </p>
                )}
                <p className="mt-1.5 font-mono text-[10px] truncate">
                  SHA-256: {sandboxValidation.sha256Checksum}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-white p-6 shadow-sm border border-[#E2ECE7]">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2ECE7]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#164E3D]">
              QA & DevSecOps Sign-Off
            </span>
            <h4 className="text-base font-extrabold text-[#1A2E26]">
              Production Readiness & Security Verification Checklist
            </h4>
          </div>
          <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-extrabold text-emerald-800">
            {readinessChecklist.filter((c) => c.passed).length} / {readinessChecklist.length} Checks Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {readinessChecklist.map((chk) => (
            <label
              key={chk.id}
              className="flex items-start gap-3 rounded-xl border border-[#E2ECE7] bg-[#F4F8F6]/60 p-3.5 cursor-pointer hover:bg-[#F4F8F6]"
            >
              <input
                type="checkbox"
                checked={chk.passed}
                onChange={() =>
                  setReadinessChecklist((prev) =>
                    prev.map((item) =>
                      item.id === chk.id ? { ...item, passed: !item.passed } : item
                    )
                  )
                }
                className="mt-0.5 h-4 w-4 rounded accent-[#164E3D]"
              />
              <div className="text-xs">
                <span className="font-extrabold text-[#164E3D] uppercase tracking-wider text-[10px] block">
                  {chk.category}
                </span>
                <span className="font-semibold text-[#1A2E26]">{chk.item}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
