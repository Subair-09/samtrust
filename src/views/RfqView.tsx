import React, { useState, useRef, useMemo, useEffect } from 'react';
import { RfqCartItem, CurrencyCode, ProductItem, NavTab } from '../types';
import { CURRENCIES, PRODUCTS } from '../data/mockData';
import { useCms } from '../context/CmsContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  RfqLineItem,
  RfqFormData,
  NIGERIAN_STATES,
  validateRfqStep,
  generateRfqReferenceCode,
} from '../utils/rfqValidation';
import {
  FileText,
  Trash2,
  Plus,
  Minus,
  Send,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  ArrowRight,
  Building,
  Clock,
  Sparkles,
  Layers,
  Upload,
  Paperclip,
  Printer,
  AlertCircle,
  Wrench,
  Gauge,
  GraduationCap,
  CheckCircle,
  ArrowLeft,
  FileCheck,
  MessageSquare,
  Search,
} from 'lucide-react';
import { OfficialSamstrustPdfModal } from './portal/CommercialAndArchitectureModule';
import { buildAutomatedInvoiceFromLead } from '../utils/invoiceGenerator';
import { PortalQuoteAndInvoice } from '../types/portal';
import { LeadRfqItem } from '../types/cms';

interface RfqViewProps {
  rfqItems: RfqCartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearRfq: () => void;
  onAddToRfq: (product: ProductItem) => void;
  currency: CurrencyCode;
  onNavigate: (tab: NavTab) => void;
  initialStep?: number | null;
  onClearInitialStep?: () => void;
}

export const RfqView: React.FC<RfqViewProps> = ({
  rfqItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearRfq,
  onAddToRfq,
  currency,
  onNavigate,
  initialStep,
  onClearInitialStep,
}) => {
  const { addRfqLead, products: cmsProducts, categories: cmsCategories } = useCms();

  // Stepper state: 1, 2, 3, 4, or 5 (Confirmation View)
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (initialStep && initialStep >= 1 && initialStep <= 4) {
      return initialStep;
    }
    return rfqItems.length > 0 ? 2 : 1;
  });

  useEffect(() => {
    if (initialStep && initialStep >= 1 && initialStep <= 4) {
      setCurrentStep(initialStep);
      setStepErrors({});
      if (onClearInitialStep) {
        onClearInitialStep();
      }
    }
  }, [initialStep, onClearInitialStep]);

  const [submittedLeadRecord, setSubmittedLeadRecord] = useState<LeadRfqItem | null>(null);
  const [invoiceModalState, setInvoiceModalState] = useState<{
    mode: 'proforma' | 'quotation';
    quote: PortalQuoteAndInvoice;
  } | null>(null);

  // Form Data State
  const [companyName, setCompanyName] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Procurement & Instrumentation Lead');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryState, setDeliveryState] = useState('Lagos State');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Step 2 Custom Line Items & Quick Catalog Filter
  const [customItems, setCustomItems] = useState<RfqLineItem[]>([]);
  const [customName, setCustomName] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customSpecs, setCustomSpecs] = useState('');
  const [step2SearchQuery, setStep2SearchQuery] = useState('');
  const [step2Category, setStep2Category] = useState('all');

  // Step 3 Services
  const [fatRequired, setFatRequired] = useState(false);
  const [installationRequired, setInstallationRequired] = useState(true);
  const [isoCalibrationRequired, setIsoCalibrationRequired] = useState(true);
  const [trainingRequired, setTrainingRequired] = useState(false);
  const [maintenanceSla, setMaintenanceSla] = useState<'none' | 'silver' | 'gold' | 'platinum'>('gold');
  const [deliveryTimeline, setDeliveryTimeline] = useState('2-4 Weeks Standard');

  // Step 4 Document Upload & Special Instructions
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('DDP Delivered Duty Paid (Facility Site)');
  const [honeypotField, setHoneypotField] = useState('');

  // Validation Errors
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Confirmation State
  const [submittedRefCode, setSubmittedRefCode] = useState<string | null>(null);
  const [submittedTimestamp, setSubmittedTimestamp] = useState<string>('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const curr = CURRENCIES[currency];

  const availableCatalogProducts = useMemo(() => {
    const list = cmsProducts && cmsProducts.length > 0 ? cmsProducts : PRODUCTS;
    return list.filter((p) => {
      if (step2Category !== 'all' && p.category !== step2Category) return false;
      if (step2SearchQuery.trim()) {
        const q = step2SearchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cmsProducts, step2Category, step2SearchQuery]);

  // Convert global cart items into unified RFQ line items
  const catalogLineItems: RfqLineItem[] = useMemo(() => {
    return rfqItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      model: item.product.model,
      quantity: item.quantity,
      specs: `${item.product.accuracy} | Range: ${item.product.measurementRange} | ${item.product.compliance}`,
      unitPriceUSD: item.product.basePriceUSD,
      isCustom: false,
    }));
  }, [rfqItems]);

  const allLineItems = useMemo(() => {
    return [...catalogLineItems, ...customItems];
  }, [catalogLineItems, customItems]);

  const estimatedTotalUSD = useMemo(() => {
    return allLineItems.reduce((acc, item) => acc + item.unitPriceUSD * item.quantity, 0);
  }, [allLineItems]);

  const convertedTotal = Math.round(estimatedTotalUSD * curr.rate);
  const formattedTotal = new Intl.NumberFormat('en-US').format(convertedTotal);

  // Custom Item Adder
  const handleAddCustomItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (customName.trim()) {
      const newItem: RfqLineItem = {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        model: customModel.trim() || 'Custom Specification',
        quantity: customQty,
        specs: customSpecs.trim() || 'Custom technical tolerance per attached drawings',
        unitPriceUSD: 0,
        isCustom: true,
      };
      setCustomItems((prev) => [...prev, newItem]);
      setCustomName('');
      setCustomModel('');
      setCustomQty(1);
      setCustomSpecs('');
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next.items;
        return next;
      });
      return newItem;
    }
    return null;
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateCustomQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCustomItem(id);
      return;
    }
    setCustomItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  // File Upload Handler (10MB limit)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSizeBytes) {
        setStepErrors((prev) => ({
          ...prev,
          documentFile: 'File exceeds 10MB maximum limit. Please upload a smaller document.',
        }));
        return;
      }
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      });
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next.documentFile;
        return next;
      });
    }
  };

  // Step Navigation (Steps 1 -> 2 -> 3 -> 4)
  const handleJumpToStep = (targetStep: number) => {
    setStepErrors({});
    setCurrentStep(targetStep);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleNextStep = () => {
    let itemsForStep2 = allLineItems;
    // If on Step 2 and user typed a custom item without clicking "Add Line", auto-add it
    if (currentStep === 2 && customName.trim()) {
      const autoAdded = handleAddCustomItem();
      if (autoAdded) {
        itemsForStep2 = [...allLineItems, autoAdded];
      }
    }

    const currentData: Partial<RfqFormData> = {
      companyName,
      contactName,
      email,
      phone,
      deliveryState,
      deliveryAddress,
      items: itemsForStep2,
      deliveryTimeline,
      documentFile: attachedFile,
      honeypotField,
    };

    const result = validateRfqStep(currentStep, currentData);
    if (!result.isValid) {
      setStepErrors(result.errors);
      return;
    }

    setStepErrors({});
    setCurrentStep((prev) => Math.min(4, prev + 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStepErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Final Submission (Step 4 -> Step 5 & Lead Pipeline)
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalLineItems = allLineItems;
    if (customName.trim()) {
      const autoAdded = handleAddCustomItem();
      if (autoAdded) {
        finalLineItems = [...allLineItems, autoAdded];
      }
    }

    // Validate required contact particulars and items right on Step 4
    const errors: Record<string, string> = {};
    if (!companyName || companyName.trim().length < 2) {
      errors.companyName = 'Please enter your Company / Organization name.';
    }
    if (!contactName || contactName.trim().length < 2) {
      errors.contactName = 'Please enter the Contact Person name.';
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid corporate email address.';
    }
    if (!phone || phone.trim().length < 6) {
      errors.phone = 'Please provide a direct telephone or WhatsApp number.';
    }
    if (finalLineItems.length === 0) {
      errors.items = 'Please add at least one catalog instrument or bespoke specification to submit.';
    }

    const step4Check = validateRfqStep(4, {
      documentFile: attachedFile,
      honeypotField,
    });
    Object.assign(errors, step4Check.errors);

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors({});

    // Automated unique reference tracking code: RFQ-SAM-2026-XXXX
    const generatedCode = generateRfqReferenceCode();
    const nowFormatted = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    setSubmittedRefCode(generatedCode);
    setSubmittedTimestamp(nowFormatted);

    const effectiveAddress =
      deliveryAddress.trim() || `${deliveryState} Industrial / Laboratory Facility`;
    const totalValUSD = Math.round(
      finalLineItems.reduce((acc, item) => acc + item.unitPriceUSD * item.quantity, 0)
    );
    const totalUnitsCount = finalLineItems.reduce((acc, item) => acc + item.quantity, 0);

    // Auto-push into CMS Lead & RFQ Pipeline Viewer
    const newLead: LeadRfqItem = {
      id: `LEAD-${Date.now()}`,
      refCode: generatedCode,
      clientName: contactName.trim(),
      clientCompany: companyName.trim(),
      clientEmail: email.trim(),
      clientPhone: phone.trim(),
      deliveryState,
      deliveryAddress: effectiveAddress,
      status: 'New',
      createdAt: nowFormatted,
      updatedAt: nowFormatted,
      totalUSD: totalValUSD,
      itemsCount: totalUnitsCount,
      lineItems: finalLineItems.map((item) => ({
        id: item.id,
        name: item.name,
        model: item.model,
        quantity: item.quantity,
        specs: item.specs,
        unitPriceUSD: item.unitPriceUSD,
        isCustom: item.isCustom,
      })),
      services: {
        fatRequired,
        installationRequired,
        isoCalibrationRequired,
        trainingRequired,
        maintenanceSla,
        deliveryTimeline,
      },
      documentsAttached: attachedFile ? [attachedFile.name] : [],
      internalNotes: specialInstructions
        ? `Client instructions: ${specialInstructions} | Delivery Terms: ${deliveryTerms}`
        : `Delivery Terms: ${deliveryTerms}`,
    };

    addRfqLead({
      refCode: newLead.refCode,
      clientName: newLead.clientName,
      clientCompany: newLead.clientCompany,
      clientEmail: newLead.clientEmail,
      clientPhone: newLead.clientPhone,
      deliveryState: newLead.deliveryState,
      deliveryAddress: newLead.deliveryAddress,
      status: 'New',
      totalUSD: newLead.totalUSD,
      itemsCount: newLead.itemsCount,
      lineItems: newLead.lineItems,
      services: newLead.services,
      documentsAttached: newLead.documentsAttached,
      internalNotes: newLead.internalNotes,
    });
    setSubmittedLeadRecord(newLead);

    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Transcript formatting for copying / sharing
  const getOfficialTranscript = () => {
    return `SAMSTRUST TECHNOLOGIES LIMITED (CAC RC 9898142)
Official Request for Quotation Dossier
Reference Code: ${submittedRefCode}
Date & Time: ${submittedTimestamp} WAT
Portal: www.samstrusttech.com | Direct Line: +234 802 984 4356 | Email: Info@samstrusttech.com
--------------------------------------------------------------------------------
1. CLIENT & COMPANY DETAILS:
Company / Organization: ${companyName}
RC / Tax ID: ${rcNumber || taxId || 'Not specified'}
Contact Person: ${contactName} (${contactRole})
Email: ${email}
Phone / WhatsApp: ${phone}
Delivery State: ${deliveryState}
Delivery / Facility Site: ${deliveryAddress || `${deliveryState} Facility`}

2. EQUIPMENT & CONSUMABLE SCHEDULE:
${allLineItems
  .map(
    (item, idx) => `${idx + 1}. [${item.model}] ${item.name}
   - Specifications / Tolerances: ${item.specs || 'Standard OEM'}
   - Quantity: ${item.quantity} Units
   - Guide Pricing: ${curr.symbol}${new Intl.NumberFormat('en-US').format(Math.round(item.unitPriceUSD * item.quantity * curr.rate))}`
  )
  .join('\n')}

ESTIMATED INDICATIVE VALUE: ${curr.symbol}${formattedTotal} (Excludes shipping & field mobilization)

3. SERVICE REQUIREMENTS:
- Factory Acceptance Test (FAT): ${fatRequired ? 'Yes, Required with Witness Inspection' : 'Standard Factory Test'}
- On-Site Installation & Commissioning: ${installationRequired ? 'Yes, Certified Metrologist Deployment' : 'Client Self-Mount'}
- ISO/IEC 17025 Calibration Certificate: ${isoCalibrationRequired ? 'Yes, Accredited with Uncertainty Budgets' : 'Standard Factory Report'}
- Operator Competency Training: ${trainingRequired ? 'Yes, 1-2 Day Workshop with Certificates' : 'Self-Study Manuals'}
- Maintenance SLA Option: ${maintenanceSla.toUpperCase()} Tier
- Target Delivery Timeline: ${deliveryTimeline}
- Delivery Terms: ${deliveryTerms}

4. ATTACHED SPECIFICATIONS & INSTRUCTIONS:
- Attached Document: ${attachedFile ? `${attachedFile.name} (${Math.round(attachedFile.size / 1024)} KB)` : 'None'}
- Special Engineering Notes: ${specialInstructions || 'Standard Samstrust metrology protocols apply.'}

TRANSMISSION STATUS: Logged in Samstrust Lead & RFQ Pipeline Viewer.
TIMELINE: Formal commercial quotation delivered within 24-48 business hours.`;
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(getOfficialTranscript());
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2500);
  };

  const handleWhatsAppDispatch = () => {
    const text = encodeURIComponent(
      `Hello Samstrust Technologies Limited (RC 9898142),\n\nI have submitted an official RFQ dossier.\nReference Code: ${submittedRefCode}\nCompany: ${companyName}\nContact: ${contactName} (${phone})\nDelivery State: ${deliveryState}\nItems Requested: ${allLineItems.length} lines\n\nPlease confirm receipt and assign our quotation engineer.`
    );
    window.open(`https://wa.me/2348029844356?text=${text}`, '_blank');
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const handleResetFlow = () => {
    onClearRfq();
    setCustomItems([]);
    setSubmittedRefCode(null);
    setSubmittedLeadRecord(null);
    setCurrentStep(1);
    setAttachedFile(null);
    setStepErrors({});
  };

  // Step indicator metadata
  const stepsList = [
    {
      num: 1,
      title: 'Company Details',
      subtitle: companyName ? companyName : 'Client & Delivery Info',
      icon: <Building className="w-4 h-4" />,
    },
    {
      num: 2,
      title: 'Item Selection',
      subtitle: `${allLineItems.length} Instrument Line(s)`,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      num: 3,
      title: 'Services & SLA',
      subtitle: `${maintenanceSla.toUpperCase()} SLA • ${deliveryTimeline.split(' ')[0]}`,
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      num: 4,
      title: 'Documents & Submit',
      subtitle: 'Final Review & Pipeline Sync',
      icon: <FileCheck className="w-4 h-4" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: 'Request for Quotation (RFQ)', active: true }]}
        onNavigate={onNavigate}
      />

      {/* 2. Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E2ECE7] pb-6">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EBF3F0] text-xs font-mono text-[#164E3D] font-bold">
            <FileText className="w-3.5 h-3.5 text-[#AD8921]" />
            <span>MULTI-STEP PROPOSAL ENGINE &bull; SYNCED WITH LEAD &amp; RFQ PIPELINE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#164E3D] tracking-tight leading-tight">
            Request for Quotation Application Engine
          </h1>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            Configure complete equipment schedules, custom engineering tolerances, and accredited field calibration contracts across Steps 1 to 4. Every submission is automatically logged into the Lead &amp; RFQ Pipeline Viewer.
          </p>
        </div>

        {currentStep <= 4 && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="px-4 py-2.5 rounded-xl border border-[#164E3D]/30 bg-white hover:bg-[#EBF3F0] text-[#164E3D] text-xs font-bold transition-colors cursor-pointer"
            >
              + Browse Product Catalog
            </button>
            {allLineItems.length > 0 && currentStep < 4 && (
              <button
                type="button"
                onClick={() => handleJumpToStep(4)}
                className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c29d2b] text-[#0E3529] text-xs font-extrabold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Skip to Step 4: Final Submit ({allLineItems.length} Items)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE STEP PROGRESS INDICATOR (STEPS 1 - 4 ARE ALL CLICKABLE) */}
      {currentStep <= 4 && (
        <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Click any step below (Step 01 to Step 04) to configure your quotation:</span>
            <span className="font-mono font-bold text-[#164E3D]">
              Active Schedule: {allLineItems.length} SKU(s) &bull; {curr.symbol}
              {formattedTotal}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stepsList.map((step) => {
              const isCurrent = currentStep === step.num;
              const isCompleted =
                step.num === 1
                  ? Boolean(companyName && contactName && email && phone)
                  : step.num === 2
                  ? allLineItems.length > 0
                  : currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => handleJumpToStep(step.num)}
                  className={`text-left p-3.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer border ${
                    isCurrent
                      ? 'bg-[#164E3D] text-white border-[#164E3D] shadow-md'
                      : isCompleted
                      ? 'bg-[#EBF3F0] text-[#164E3D] border-emerald-300 hover:bg-emerald-100'
                      : 'bg-[#F8FAF9] text-slate-700 border-[#E2ECE7] hover:border-[#164E3D] hover:bg-white'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-white/20 text-[#D4AF37]'
                        : isCompleted
                        ? 'bg-[#164E3D] text-white'
                        : 'bg-white border border-[#E2ECE7] text-[#164E3D]'
                    }`}
                  >
                    {isCompleted && !isCurrent ? <Check className="w-4 h-4" /> : `0${step.num}`}
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-mono font-bold block opacity-75">
                      Step 0{step.num}
                    </span>
                    <span className="text-xs font-bold truncate block">{step.title}</span>
                    <span
                      className={`text-[10px] truncate block mt-0.5 ${
                        isCurrent ? 'text-emerald-200' : 'text-slate-500'
                      }`}
                    >
                      {step.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 1: CUSTOMER & COMPANY DETAILS
         ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-[#E2ECE7] shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
          <div className="border-b border-[#E2ECE7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                Step 1 of 4
              </span>
              <h2 className="text-2xl font-bold text-[#164E3D]">Customer &amp; Corporate Details</h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide your organization and facility delivery details in Nigeria, or jump directly to Step 2 to select items first.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleJumpToStep(2)}
              className="px-4 py-2 rounded-xl bg-[#EBF3F0] hover:bg-emerald-100 text-[#164E3D] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>Go to Step 2: Item Selection ({allLineItems.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization Legal Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Dangote Refineries / Nigerian Breweries Plc"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none ${
                  stepErrors.companyName
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-[#E2ECE7] bg-[#F8FAF9] focus:border-[#164E3D] focus:bg-white'
                }`}
              />
              {stepErrors.companyName && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{stepErrors.companyName}</span>
                </p>
              )}
            </div>

            {/* RC Number / Tax ID */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CAC RC Number (Optional)
                </label>
                <input
                  type="text"
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                  placeholder="RC 123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 font-mono focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  FIRS Tax ID / TIN (Optional)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="10928374-0001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 font-mono focus:outline-none focus:border-[#164E3D] focus:bg-white"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person (Title &amp; Full Name) *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Engr. Babatunde Adeleke"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none ${
                  stepErrors.contactName
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-[#E2ECE7] bg-[#F8FAF9] focus:border-[#164E3D] focus:bg-white'
                }`}
              />
              {stepErrors.contactName && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{stepErrors.contactName}</span>
                </p>
              )}
            </div>

            {/* Department / Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Operational Role
              </label>
              <input
                type="text"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                placeholder="Head of Instrumentation / QA Director"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Corporate Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="b.adeleke@company.com"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none ${
                  stepErrors.email
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-[#E2ECE7] bg-[#F8FAF9] focus:border-[#164E3D] focus:bg-white'
                }`}
              />
              {stepErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{stepErrors.email}</span>
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Direct Telephone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 802 984 4356"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none ${
                  stepErrors.phone
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-[#E2ECE7] bg-[#F8FAF9] focus:border-[#164E3D] focus:bg-white'
                }`}
              />
              {stepErrors.phone && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{stepErrors.phone}</span>
                </p>
              )}
            </div>

            {/* Delivery State in Nigeria */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination State in Nigeria *
              </label>
              <select
                value={deliveryState}
                onChange={(e) => setDeliveryState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D]"
              >
                {NIGERIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery / Plant Site Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facility / Plant Delivery Address *
              </label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Plot 14, Commercial Avenue, Ikeja Industrial Estate"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none ${
                  stepErrors.deliveryAddress
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-[#E2ECE7] bg-[#F8FAF9] focus:border-[#164E3D] focus:bg-white'
                }`}
              />
              {stepErrors.deliveryAddress && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{stepErrors.deliveryAddress}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E2ECE7]">
            <span className="text-xs text-slate-500">Step 1 of 4 &bull; Customer Data</span>
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto btn-primary py-2.5 px-6 text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Step 2: Item Selection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: ITEM SELECTION & SCOPE
         ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-[#E2ECE7] shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
          <div className="border-b border-[#E2ECE7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                Step 2 of 4
              </span>
              <h2 className="text-2xl font-bold text-[#164E3D]">Item Selection &amp; Equipment Scope</h2>
              <p className="text-xs text-slate-500 mt-1">
                Review products added from the catalog, pick additional equipment below, or specify bespoke instruments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {allLineItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClearRfq();
                    setCustomItems([]);
                  }}
                  className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Items</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Step 3: Services &amp; SLA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {stepErrors.items && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{stepErrors.items}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const defaultConsultItem: RfqLineItem = {
                    id: `custom-${Date.now()}`,
                    name: 'General Process Instrumentation & Calibration Consultation',
                    model: 'SAM-CONSULT-17025',
                    quantity: 1,
                    specs: 'Site survey, metrology audit & equipment sizing recommendation',
                    unitPriceUSD: 450,
                    isCustom: true,
                  };
                  setCustomItems((prev) => [...prev, defaultConsultItem]);
                  setStepErrors({});
                  setCurrentStep(3);
                }}
                className="px-3.5 py-2 rounded-lg bg-[#164E3D] text-white font-bold text-xs whitespace-nowrap hover:bg-[#123e31] cursor-pointer"
              >
                + Add Standard Engineering Consultation &amp; Continue
              </button>
            </div>
          )}

          {/* Current Schedule Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#AD8921]" />
                <span>Current Schedule of Line Items ({allLineItems.length})</span>
              </h3>
              <span className="font-mono text-xs font-bold text-[#164E3D]">
                Subtotal: {curr.symbol}
                {formattedTotal}
              </span>
            </div>

            {allLineItems.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-[#E2ECE7] bg-[#F8FAF9] text-center space-y-3">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">
                  No equipment added to quotation schedule yet
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click <strong>"+ Add to Quotation"</strong> on any catalog instrument below, or enter a bespoke specification in the form underneath.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#E2ECE7] overflow-hidden divide-y divide-[#E2ECE7]">
                {allLineItems.map((item) => {
                  const lineTotalUSD = item.unitPriceUSD * item.quantity;
                  const lineTotalCurr = Math.round(lineTotalUSD * curr.rate);
                  const formattedLine = new Intl.NumberFormat('en-US').format(lineTotalCurr);

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F8FAF9] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#AD8921]">
                          <span>{item.model}</span>
                          <span>&bull;</span>
                          <span>{item.isCustom ? 'Bespoke Item' : 'Catalog Instrument'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#164E3D]">{item.name}</h4>
                        <p className="text-xs text-slate-500 max-w-xl">{item.specs}</p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
                        {/* Quantity controls */}
                        <div className="flex items-center rounded-lg border border-[#E2ECE7] bg-white p-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              item.isCustom
                                ? handleUpdateCustomQty(item.id, item.quantity - 1)
                                : onUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              item.isCustom
                                ? handleUpdateCustomQty(item.id, item.quantity + 1)
                                : onUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line Value */}
                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-slate-900 block tabular-nums">
                            {item.unitPriceUSD > 0 ? `${curr.symbol}${formattedLine}` : 'Quote on Spec'}
                          </span>
                          <span className="text-[10px] text-slate-400">Guide Value</span>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            item.isCustom
                              ? handleRemoveCustomItem(item.id)
                              : onRemoveItem(item.id)
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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

          {/* Live CMS Catalog Picker Section */}
          <div className="space-y-4 pt-4 border-t border-[#E2ECE7]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                  Add Equipment From Live Catalog ({availableCatalogProducts.length} Available):
                </span>
                <span className="text-[11px] text-slate-500">
                  Click any product below to add it directly to your quotation schedule.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={step2SearchQuery}
                    onChange={(e) => setStep2SearchQuery(e.target.value)}
                    placeholder="Filter catalog items..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>
                <select
                  value={step2Category}
                  onChange={(e) => setStep2Category(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-700 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {cmsCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
              {availableCatalogProducts.map((prod) => {
                const existingInCart = rfqItems.find((r) => r.product.id === prod.id);
                const itemPrice = new Intl.NumberFormat('en-US').format(
                  Math.round(prod.basePriceUSD * curr.rate)
                );
                return (
                  <div
                    key={prod.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      existingInCart
                        ? 'border-emerald-400 bg-[#EBF3F0]/60'
                        : 'border-[#E2ECE7] bg-[#F8FAF9] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#E2ECE7] bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-[#AD8921] block">
                          {prod.model}
                        </span>
                        <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{prod.name}</h5>
                        <span className="text-[11px] text-[#164E3D] font-mono font-bold block mt-0.5">
                          {curr.symbol}
                          {itemPrice}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onAddToRfq(prod);
                        setStepErrors((prev) => {
                          const next = { ...prev };
                          delete next.items;
                          return next;
                        });
                      }}
                      className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        existingInCart
                          ? 'bg-[#164E3D] text-white hover:bg-[#123e31]'
                          : 'bg-white border border-[#E2ECE7] hover:border-[#164E3D] text-[#164E3D]'
                      }`}
                    >
                      {existingInCart ? (
                        <>
                          <Check className="w-3 h-3 text-[#D4AF37]" />
                          <span>In Schedule (Qty: {existingInCart.quantity} &bull; +1)</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 text-[#AD8921]" />
                          <span>Add to Quotation</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bespoke / Custom Equipment Specification Adder */}
          <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#AD8921]" />
              <h3 className="text-sm font-bold text-[#164E3D]">
                Add Bespoke Or Non-Catalog Equipment Specification
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Enter non-standard pressure ranges, specialized flange dimensions, hazardous area ratings, or custom reagent formulations.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Equipment / Instrument Description
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. 6-inch ANSI 600# Flanged Ultrasonic Meter or HPLC Autosampler"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Target Model / Brand
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. Krohne / Promass / Custom"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Technical Tolerances / Wetted Parts / Process Conditions
                  </label>
                  <input
                    type="text"
                    value={customSpecs}
                    onChange={(e) => setCustomSpecs(e.target.value)}
                    placeholder="e.g. Hastelloy C wetted parts, 0.05% accuracy, 150 bar design pressure"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={customQty}
                      onChange={(e) => setCustomQty(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs font-mono text-center text-slate-800 focus:outline-none focus:border-[#164E3D]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomItem()}
                      className="px-4 py-2 rounded-xl bg-[#164E3D] hover:bg-[#1C5D49] text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                    >
                      Add Line
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E2ECE7]">
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 1: Company Details</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto btn-primary py-2.5 px-6 text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Step 3: Service Options</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: SERVICE REQUIREMENTS & SLA
         ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-[#E2ECE7] shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
          <div className="border-b border-[#E2ECE7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                Step 3 of 4
              </span>
              <h2 className="text-2xl font-bold text-[#164E3D]">
                Engineering Services &amp; SLA Requirements
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select accredited calibration, factory acceptance testing, on-site commissioning, or operator training.
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>Step 4: Documents &amp; Final Submit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Interactive Service Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1: FAT */}
            <div
              onClick={() => setFatRequired(!fatRequired)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                fatRequired
                  ? 'bg-[#EBF3F0] border-emerald-400 shadow-sm'
                  : 'bg-white border-[#E2ECE7] hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                  fatRequired
                    ? 'bg-[#164E3D] border-[#164E3D] text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {fatRequired && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#164E3D]" />
                  <h4 className="text-sm font-bold text-[#164E3D]">
                    Factory Acceptance Test (FAT)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Formal pre-dispatch witness testing, hydrostatic pressure test report, and dimensional sign-off at our Lagos staging facility.
                </p>
              </div>
            </div>

            {/* 2: Installation & Commissioning */}
            <div
              onClick={() => setInstallationRequired(!installationRequired)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                installationRequired
                  ? 'bg-[#EBF3F0] border-emerald-400 shadow-sm'
                  : 'bg-white border-[#E2ECE7] hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                  installationRequired
                    ? 'bg-[#164E3D] border-[#164E3D] text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {installationRequired && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#164E3D]" />
                  <h4 className="text-sm font-bold text-[#164E3D]">
                    On-Site Installation &amp; Commissioning
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mechanical pipe fitting, wiring, power-up cold loop checking, and integration into plant DCS/SCADA architectures.
                </p>
              </div>
            </div>

            {/* 3: ISO/IEC 17025 Calibration */}
            <div
              onClick={() => setIsoCalibrationRequired(!isoCalibrationRequired)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                isoCalibrationRequired
                  ? 'bg-[#EBF3F0] border-emerald-400 shadow-sm'
                  : 'bg-white border-[#E2ECE7] hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                  isoCalibrationRequired
                    ? 'bg-[#164E3D] border-[#164E3D] text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isoCalibrationRequired && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#164E3D]" />
                  <h4 className="text-sm font-bold text-[#164E3D]">
                    ISO/IEC 17025 Traceable Calibration Certificate
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Individual accredited certificates with computerized uncertainty budgets, NIST/DKD traceability, and tamper-evident QR seals.
                </p>
              </div>
            </div>

            {/* 4: Operator Training */}
            <div
              onClick={() => setTrainingRequired(!trainingRequired)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                trainingRequired
                  ? 'bg-[#EBF3F0] border-emerald-400 shadow-sm'
                  : 'bg-white border-[#E2ECE7] hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                  trainingRequired
                    ? 'bg-[#164E3D] border-[#164E3D] text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {trainingRequired && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#164E3D]" />
                  <h4 className="text-sm font-bold text-[#164E3D]">
                    Operator &amp; Maintenance Technical Training
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1 to 2-day on-site practical workshop for plant operators, routine calibration checks, and maintenance sign-off dossiers.
                </p>
              </div>
            </div>
          </div>

          {/* Maintenance SLA Selector */}
          <div className="space-y-3 pt-4 border-t border-[#E2ECE7]">
            <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
              Annual Maintenance Contract (AMC) SLA Option:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { id: 'none', label: 'No AMC Contract', desc: 'Standard OEM factory warranty only' },
                { id: 'silver', label: 'Silver SLA (48h)', desc: '2 scheduled PM visits + 10% calibration discount' },
                { id: 'gold', label: 'Gold SLA (12h)', desc: '4 quarterly audits + 2 breakdown callouts included' },
                { id: 'platinum', label: 'Platinum SLA (4h)', desc: '24/7 dedicated coverage + on-site consignment spares' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setMaintenanceSla(opt.id as any)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    maintenanceSla === opt.id
                      ? 'bg-[#164E3D] text-white border-[#164E3D] shadow-xs'
                      : 'bg-[#F8FAF9] text-slate-700 border-[#E2ECE7] hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold">{opt.label}</h5>
                    <p
                      className={`text-[11px] mt-1 leading-snug ${
                        maintenanceSla === opt.id ? 'text-emerald-100' : 'text-slate-500'
                      }`}
                    >
                      {opt.desc}
                    </p>
                  </div>
                  {maintenanceSla === opt.id && (
                    <div className="pt-2 flex items-center gap-1 text-[10px] font-mono text-[#D4AF37]">
                      <Check className="w-3 h-3" />
                      <span>Selected Tier</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Target Delivery Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2ECE7]">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Delivery Schedule *
              </label>
              <select
                value={deliveryTimeline}
                onChange={(e) => setDeliveryTimeline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D]"
              >
                <option value="Immediate Stock (1-3 Days)">Immediate Stock (1-3 Days)</option>
                <option value="2-4 Weeks Standard">2-4 Weeks Standard</option>
                <option value="6-8 Weeks Capital Project">6-8 Weeks Capital Project</option>
                <option value="Critical Plant Shutdown (Expedited Dispatch)">
                  Critical Plant Shutdown (Expedited Dispatch)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Commercial Delivery Terms
              </label>
              <select
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D]"
              >
                <option value="DDP Delivered Duty Paid (Facility Site)">
                  DDP Delivered Duty Paid (Facility Site)
                </option>
                <option value="CIF Port of Lagos / Port Harcourt">
                  CIF Port of Lagos / Port Harcourt
                </option>
                <option value="Ex-Works Samstrust Warehouse">
                  Ex-Works Samstrust Ikeja Warehouse
                </option>
              </select>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E2ECE7]">
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 2: Item Selection</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto btn-primary py-2.5 px-6 text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Step 4: Documents &amp; Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: SUPPORTING DOCUMENT UPLOAD, CLIENT VERIFICATION & FINAL SUBMIT
         ========================================================================= */}
      {currentStep === 4 && (
        <form
          onSubmit={handleFinalSubmit}
          className="bg-white rounded-3xl border border-[#E2ECE7] shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in duration-300"
        >
          <div className="border-b border-[#E2ECE7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                Step 4 of 4
              </span>
              <h2 className="text-2xl font-bold text-[#164E3D]">
                Supporting Documents, Verification &amp; Final Submit
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verify your corporate contact details, attach optional technical drawings (up to 10MB), and transmit directly to the Lead &amp; RFQ Pipeline Viewer.
              </p>
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-[#EBF3F0] text-[#164E3D] font-mono text-xs font-bold self-start sm:self-auto">
              Est. Total: {curr.symbol}
              {formattedTotal}
            </span>
          </div>

          {/* Hidden Honeypot Field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="company_honeypot_field">Leave empty</label>
            <input
              type="text"
              id="company_honeypot_field"
              tabIndex={-1}
              autoComplete="off"
              value={honeypotField}
              onChange={(e) => setHoneypotField(e.target.value)}
            />
          </div>

          {/* Inline Corporate & Contact Verification Card (So jumping to Step 2-4 never blocks submission!) */}
          <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-[#AD8921]" />
                <span>1. Corporate &amp; Delivery Particulars (Required for Lead Pipeline)</span>
              </h3>
              <span className="text-[11px] text-slate-500">Editable inline</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Dangote Refineries Plc"
                  className={`w-full px-3 py-2 rounded-xl border text-slate-900 bg-white focus:outline-none ${
                    stepErrors.companyName ? 'border-rose-400' : 'border-[#E2ECE7] focus:border-[#164E3D]'
                  }`}
                />
                {stepErrors.companyName && (
                  <span className="text-[11px] text-rose-600 block mt-1">{stepErrors.companyName}</span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Person Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Engr. Babatunde Adeleke"
                  className={`w-full px-3 py-2 rounded-xl border text-slate-900 bg-white focus:outline-none ${
                    stepErrors.contactName ? 'border-rose-400' : 'border-[#E2ECE7] focus:border-[#164E3D]'
                  }`}
                />
                {stepErrors.contactName && (
                  <span className="text-[11px] text-rose-600 block mt-1">{stepErrors.contactName}</span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="b.adeleke@company.com"
                  className={`w-full px-3 py-2 rounded-xl border text-slate-900 bg-white focus:outline-none ${
                    stepErrors.email ? 'border-rose-400' : 'border-[#E2ECE7] focus:border-[#164E3D]'
                  }`}
                />
                {stepErrors.email && (
                  <span className="text-[11px] text-rose-600 block mt-1">{stepErrors.email}</span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Direct Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 802 984 4356"
                  className={`w-full px-3 py-2 rounded-xl border text-slate-900 bg-white focus:outline-none ${
                    stepErrors.phone ? 'border-rose-400' : 'border-[#E2ECE7] focus:border-[#164E3D]'
                  }`}
                />
                {stepErrors.phone && (
                  <span className="text-[11px] text-rose-600 block mt-1">{stepErrors.phone}</span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Destination State *
                </label>
                <select
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] bg-white text-slate-900 focus:outline-none focus:border-[#164E3D]"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Facility Site Address
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Plot 14, Ikeja Industrial Estate"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] bg-white text-slate-900 focus:outline-none focus:border-[#164E3D]"
                />
              </div>
            </div>
          </div>

          {/* Equipment Lines Verification */}
          <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#AD8921]" />
                <span>2. Selected Equipment Schedule ({allLineItems.length} Line Items)</span>
              </h3>
              <button
                type="button"
                onClick={() => handleJumpToStep(2)}
                className="text-xs font-bold text-[#164E3D] hover:underline cursor-pointer"
              >
                + Edit or Add More Items (Step 2)
              </button>
            </div>

            {stepErrors.items && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between gap-2">
                <span>{stepErrors.items}</span>
                <button
                  type="button"
                  onClick={() => handleJumpToStep(2)}
                  className="px-3 py-1.5 rounded-lg bg-[#164E3D] text-white font-bold cursor-pointer"
                >
                  Select Items in Step 2
                </button>
              </div>
            )}

            {allLineItems.length > 0 ? (
              <div className="divide-y divide-[#E2ECE7] bg-white rounded-xl border border-[#E2ECE7] overflow-hidden text-xs">
                {allLineItems.map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-mono font-bold text-[#AD8921] mr-2">[{it.model}]</span>
                      <strong className="text-slate-800">{it.name}</strong>
                    </div>
                    <div className="font-mono text-slate-700 shrink-0">
                      Qty: <strong>{it.quantity}</strong> &bull;{' '}
                      <strong className="text-[#164E3D]">
                        {it.unitPriceUSD > 0
                          ? `${curr.symbol}${new Intl.NumberFormat('en-US').format(
                              Math.round(it.unitPriceUSD * it.quantity * curr.rate)
                            )}`
                          : 'Quote on Spec'}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No items selected yet. Click <strong>"+ Edit or Add More Items (Step 2)"</strong> above to pick from the catalog.
              </p>
            )}
          </div>

          {/* Document Upload Area */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#164E3D] uppercase tracking-wider">
              3. Upload Technical Drawing / Tender Document (Optional &bull; PDF, DOCX, PNG, XLS Max 10MB)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.xls,.xlsx"
              className="hidden"
            />

            {!attachedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E2ECE7] hover:border-[#164E3D] bg-[#F8FAF9] rounded-2xl p-6 text-center space-y-2 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-[#164E3D] flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5 text-[#164E3D]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Click to browse or attach specification sheet (Optional)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports P&amp;ID diagrams, instrument data sheets, material requisitions (PDF, DOCX, PNG up to 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#EBF3F0] border border-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Paperclip className="w-5 h-5 text-[#164E3D]" />
                  <div>
                    <h5 className="text-xs font-bold text-[#164E3D]">{attachedFile.name}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {Math.round(attachedFile.size / 1024)} KB &bull; Verified file format
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Remove Attachment
                </button>
              </div>
            )}

            {stepErrors.documentFile && (
              <p className="text-xs text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{stepErrors.documentFile}</span>
              </p>
            )}
          </div>

          {/* Special Instructions & Process Conditions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              4. Process Medium Characteristics &amp; Special Handling Instructions
            </label>
            <textarea
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Detail medium temperature, line pressure, corrosion parameters, ATEX hazardous zone classification, or preferred warranty terms..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white resize-none"
            />
          </div>

          {/* Stepper Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E2ECE7]">
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 3: Services</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto btn-primary py-3 px-8 text-xs inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <Send className="w-4 h-4 text-[#D4AF37]" />
              <span>Submit RFQ Application Dossier to Lead Pipeline</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          CONFIRMATION VIEW (STEP 5): OFFICIAL SUMMARY SCREEN
         ========================================================================= */}
      {currentStep === 5 && submittedRefCode && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Main Success Confirmation Banner */}
          <div className="rounded-3xl bg-white border border-emerald-400 shadow-2xl p-6 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#E2ECE7] pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#EBF3F0] border-2 border-emerald-400 flex items-center justify-center text-[#164E3D] shrink-0">
                  <CheckCircle2 className="w-10 h-10 text-[#164E3D]" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
                    Logged in Lead &amp; RFQ Pipeline Viewer
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#164E3D]">
                    Reference: <span className="font-mono text-emerald-900">{submittedRefCode}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recorded under Samstrust Technologies Limited &bull; CAC RC 9898142
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const leadToUse: LeadRfqItem = submittedLeadRecord || {
                      id: `LEAD-${Date.now()}`,
                      refCode: submittedRefCode || 'RFQ-SAM-2026-LIVE',
                      clientName: contactName || 'Authorized Representative',
                      clientCompany: companyName || 'Client Organization',
                      clientEmail: email,
                      clientPhone: phone,
                      deliveryState,
                      deliveryAddress,
                      status: 'New',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      totalUSD: Math.round(estimatedTotalUSD),
                      itemsCount: allLineItems.length,
                      lineItems: allLineItems.map((item) => ({
                        id: item.id,
                        name: item.name,
                        model: item.model,
                        quantity: item.quantity,
                        specs: item.specs,
                        unitPriceUSD: item.unitPriceUSD,
                        isCustom: item.isCustom,
                      })),
                      services: {
                        fatRequired,
                        installationRequired,
                        isoCalibrationRequired,
                        trainingRequired,
                        maintenanceSla,
                        deliveryTimeline,
                      },
                      documentsAttached: attachedFile ? [attachedFile.name] : [],
                    };
                    const generatedDoc = buildAutomatedInvoiceFromLead(leadToUse);
                    setInvoiceModalState({
                      mode: 'proforma',
                      quote: generatedDoc,
                    });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#164E3D] hover:bg-[#123e31] text-[#D4AF37] font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  <span>Instant Pro-Forma Tax Invoice (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintDossier}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Summary</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-[#EBF3F0] hover:bg-emerald-100 text-[#164E3D] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  {copiedTranscript ? (
                    <Check className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedTranscript ? 'Transcript Copied!' : 'Copy Summary'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppDispatch}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Notify via WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Simulated Notification Hooks Strip */}
            <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-2 text-xs">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Instant Automated Notification &amp; Pipeline Status:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Email dossier sent to <strong>{email}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    SMS alert queued to <strong>{phone}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Synced to <strong>Lead &amp; RFQ Pipeline Viewer</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Expectations Banner */}
            <div className="p-5 rounded-2xl bg-[#164E3D] text-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-[#D4AF37] text-xs font-mono font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Commercial Turnaround SLA</span>
                </div>
                <h4 className="text-base font-bold">
                  Standard Commercial Response Within 24–48 Business Hours
                </h4>
                <p className="text-xs text-emerald-100/80">
                  Our application engineer will verify pipe flange compatibility, sensor rangeability, and lead times with factory OEMs.
                </p>
              </div>

              <div className="text-center md:text-right shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block">
                  Urgent Escalation Hotline
                </span>
                <a
                  href="tel:+2348029844356"
                  className="font-mono text-base font-bold text-white hover:text-[#D4AF37] transition-colors"
                >
                  +234 802 984 4356
                </a>
              </div>
            </div>

            {/* Official Printable Quotation Slip */}
            <div className="bg-[#FAFBFB] border border-[#E2ECE7] rounded-2xl p-6 sm:p-8 font-mono text-xs text-slate-800 whitespace-pre-wrap select-all leading-relaxed shadow-inner max-h-[460px] overflow-y-auto">
              {getOfficialTranscript()}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2ECE7]">
              <span className="text-xs text-slate-500">
                Official Document ID: {submittedRefCode} &bull; CAC RC 9898142
              </span>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFlow}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Start New RFQ
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="btn-primary py-2.5 px-6 text-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Return to Equipment Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Automated Samstrust Invoice & Pro-Forma Modal */}
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
