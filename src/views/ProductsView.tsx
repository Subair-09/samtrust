import React, { useState, useMemo } from 'react';
import { ProductItem, CurrencyCode, NavTab, RfqCartItem } from '../types';
import { PRODUCTS, BRANDS, INDUSTRIES, CURRENCIES } from '../data/mockData';
import { useCms } from '../context/CmsContext';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { generateAndPrintDataSheet } from '../utils/generateDataSheet';
import { generateRfqReferenceCode, NIGERIAN_STATES } from '../utils/rfqValidation';
import { OfficialSamstrustPdfModal } from './portal/CommercialAndArchitectureModule';
import { buildAutomatedInvoiceFromLead } from '../utils/invoiceGenerator';
import { PortalQuoteAndInvoice } from '../types/portal';
import { LeadRfqItem } from '../types/cms';
import {
  Search,
  Filter,
  SlidersHorizontal,
  CheckCircle2,
  LayoutGrid,
  List,
  X,
  FileDown,
  ShieldCheck,
  Plus,
  Check,
  ArrowRight,
  ChevronRight,
  Send,
  Building2,
  Clock,
  Layers,
  Sparkles,
  FileText,
  ShoppingCart,
} from 'lucide-react';

interface ProductsViewProps {
  currency: CurrencyCode;
  onAddToRfq: (product: ProductItem) => void;
  onViewProductDetails: (product: ProductItem) => void;
  rfqProductIds: Set<string>;
  onNavigate: (tab: NavTab) => void;
  initialProductId?: string | null;
  rfqItems?: RfqCartItem[];
  onOpenRfqAtStep?: (step: number) => void;
  onOpenQuickRfqModal?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  currency,
  onAddToRfq,
  onViewProductDetails,
  rfqProductIds,
  onNavigate,
  initialProductId,
  rfqItems = [],
  onOpenRfqAtStep,
  onOpenQuickRfqModal,
}) => {
  const { products: cmsProducts, brands: cmsBrands, categories: cmsCategories, addRfqLead } = useCms();

  // View mode: 'catalog' or 'pdp'
  const [selectedPdpProduct, setSelectedPdpProduct] = useState<ProductItem | null>(() => {
    if (initialProductId) {
      return (
        cmsProducts.find((p) => p.id === initialProductId) ||
        PRODUCTS.find((p) => p.id === initialProductId) ||
        null
      );
    }
    return null;
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedStock, setSelectedStock] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // PDP States (for thumbnail switcher & quotation form)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [pdpQuantity, setPdpQuantity] = useState(1);
  const [pdpClientName, setPdpClientName] = useState('');
  const [pdpClientCompany, setPdpClientCompany] = useState('');
  const [pdpClientEmail, setPdpClientEmail] = useState('');
  const [pdpClientPhone, setPdpClientPhone] = useState('');
  const [pdpDeliveryState, setPdpDeliveryState] = useState('Lagos State');
  const [pdpNotes, setPdpNotes] = useState('');
  const [pdpRfqSubmitted, setPdpRfqSubmitted] = useState<string | null>(null);
  const [pdpSubmittedLead, setPdpSubmittedLead] = useState<LeadRfqItem | null>(null);
  const [invoiceModalState, setInvoiceModalState] = useState<{
    mode: 'proforma' | 'quotation';
    quote: PortalQuoteAndInvoice;
  } | null>(null);

  const categories = useMemo(() => {
    const dynamicCats =
      cmsCategories && cmsCategories.length > 0
        ? cmsCategories.map((c) => ({ id: c.id, label: c.label }))
        : [
            { id: 'flowmeters', label: 'Flow Measurement' },
            { id: 'transmitters', label: 'Process Transmitters' },
            { id: 'balances', label: 'Precision Balances' },
            { id: 'process-automation', label: 'Automation & Checkweighers' },
            { id: 'safety-cabinets', label: 'Fume Hoods & Lab Safety' },
            { id: 'gas-detection', label: 'Gas Detection' },
            { id: 'biotech', label: 'Biotechnology & PCR' },
            { id: 'reagents-consumables', label: 'Reagents & Glassware' },
          ];
    return [{ id: 'all', label: 'All Equipment' }, ...dynamicCats];
  }, [cmsCategories]);

  const stockOptions = [
    { id: 'all', label: 'All Availabilities' },
    { id: 'inStock', label: 'Immediate Dispatch / In Stock' },
    { id: 'shortLead', label: 'Standard Lead Time (3-5 Days)' },
  ];

  // Active filters count
  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedBrand !== 'all',
    selectedIndustry !== 'all',
    selectedStock !== 'all',
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedIndustry('all');
    setSelectedStock('all');
    setSearchQuery('');
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return cmsProducts
      .filter((product) => {
        // 1. Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(q);
          const matchesModel = product.model.toLowerCase().includes(q);
          const matchesDesc = product.description.toLowerCase().includes(q);
          const matchesBrand = product.brand.toLowerCase().includes(q);
          if (!matchesName && !matchesModel && !matchesDesc && !matchesBrand) return false;
        }

        // 2. Category
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // 3. Brand
        if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
          return false;
        }

        // 4. Industry
        if (selectedIndustry !== 'all') {
          if (!product.targetIndustries.includes(selectedIndustry)) {
            return false;
          }
        }

        // 5. Stock status
        if (selectedStock === 'inStock' && !product.inStock) {
          return false;
        }
        if (
          selectedStock === 'shortLead' &&
          !product.leadTime.includes('3 - 5') &&
          !product.leadTime.includes('Immediate')
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePriceUSD - b.basePriceUSD;
        if (sortBy === 'price-desc') return b.basePriceUSD - a.basePriceUSD;
        return a.name.localeCompare(b.name);
      });
  }, [cmsProducts, searchQuery, selectedCategory, selectedBrand, selectedIndustry, selectedStock, sortBy]);

  const curr = CURRENCIES[currency];

  const totalQuoteUnits = useMemo(
    () => rfqItems.reduce((acc, item) => acc + item.quantity, 0),
    [rfqItems]
  );
  const totalQuoteUSD = useMemo(
    () => rfqItems.reduce((acc, item) => acc + item.product.basePriceUSD * item.quantity, 0),
    [rfqItems]
  );
  const formattedQuoteTotal = new Intl.NumberFormat('en-US').format(
    Math.round(totalQuoteUSD * curr.rate)
  );

  const handleGoToStep = (step: number) => {
    if (onOpenRfqAtStep) {
      onOpenRfqAtStep(step);
    } else {
      onNavigate('rfq');
    }
  };

  const handleOpenPdp = (product: ProductItem) => {
    setSelectedPdpProduct(product);
    setActiveGalleryIndex(0);
    setPdpRfqSubmitted(null);
    setPdpSubmittedLead(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePdpRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPdpProduct) return;
    const ref = generateRfqReferenceCode();
    const nowStr = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });

    // Auto-add item to global RFQ cart if not already present
    if (!rfqProductIds.has(selectedPdpProduct.id)) {
      onAddToRfq(selectedPdpProduct);
    }

    const newLeadPayload: LeadRfqItem = {
      id: `lead-${Date.now()}`,
      refCode: ref,
      clientName: pdpClientName.trim() || 'Authorized Representative',
      clientCompany: pdpClientCompany.trim() || 'Corporate Client',
      clientEmail: pdpClientEmail.trim(),
      clientPhone: pdpClientPhone.trim() || '+234 800 000 0000',
      deliveryState: pdpDeliveryState || 'Lagos State',
      deliveryAddress: `${pdpDeliveryState} Facility (Direct PDP Inquiry)`,
      status: 'New',
      totalUSD: selectedPdpProduct.basePriceUSD * pdpQuantity,
      itemsCount: pdpQuantity,
      lineItems: [
        {
          id: selectedPdpProduct.id,
          name: selectedPdpProduct.name,
          model: selectedPdpProduct.model,
          quantity: pdpQuantity,
          specs: `${selectedPdpProduct.accuracy} | Range: ${selectedPdpProduct.measurementRange} | ${selectedPdpProduct.compliance}`,
          unitPriceUSD: selectedPdpProduct.basePriceUSD,
          isCustom: false,
        },
      ],
      services: {
        fatRequired: false,
        installationRequired: true,
        isoCalibrationRequired: true,
        trainingRequired: false,
        maintenanceSla: 'gold',
        deliveryTimeline: '2-4 Weeks Standard',
      },
      documentsAttached: [],
      internalNotes: pdpNotes
        ? `PDP Direct Quote Request: ${pdpNotes}`
        : `Direct SKU Quote Request from Product Detail Page (${selectedPdpProduct.model})`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    // Push directly to CMS RFQ Lead Pipeline
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

    setPdpSubmittedLead(newLeadPayload);
    setPdpRfqSubmitted(ref);
  };

  // ---------------------------------------------------------------------------
  // RENDER DEDICATED PRODUCT DETAIL PAGE (PDP)
  // ---------------------------------------------------------------------------
  if (selectedPdpProduct) {
    const pdpConvertedPrice = Math.round(selectedPdpProduct.basePriceUSD * curr.rate);
    const pdpFormattedPrice = new Intl.NumberFormat('en-US').format(pdpConvertedPrice);
    const inCart = rfqProductIds.has(selectedPdpProduct.id);
    const gallery =
      selectedPdpProduct.galleryImages && selectedPdpProduct.galleryImages.length > 0
        ? selectedPdpProduct.galleryImages
        : [selectedPdpProduct.image];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-in fade-in duration-300">
        {/* PDP Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Products', tab: 'products' },
            { label: selectedPdpProduct.categoryLabel },
            { label: selectedPdpProduct.model, active: true },
          ]}
          onNavigate={() => setSelectedPdpProduct(null)}
        />

        {/* Back Link */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setSelectedPdpProduct(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#164E3D] hover:text-[#AD8921] transition-colors cursor-pointer"
          >
            <span>&larr; Back to Full Catalog</span>
          </button>

          {rfqItems.length > 0 && (
            <button
              type="button"
              onClick={() => handleGoToStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#164E3D] text-white text-xs font-bold shadow-xs hover:bg-[#123e31] cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Proceed to Quote ({totalQuoteUnits} Units &bull; Step 2)</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          )}
        </div>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 6 cols: Image Gallery with Thumbnail Switcher */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-4/3 w-full bg-white rounded-2xl border border-[#E2ECE7] shadow-sm overflow-hidden p-4 flex items-center justify-center">
              <img
                src={gallery[activeGalleryIndex] || selectedPdpProduct.image}
                alt={selectedPdpProduct.name}
                className="w-full h-full object-contain max-h-[380px] transition-all duration-300"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-white/95 border border-[#E2ECE7] shadow-2xs font-mono text-xs font-bold text-[#164E3D]">
                {selectedPdpProduct.model}
              </div>
            </div>

            {/* Thumbnail Switcher */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveGalleryIndex(idx)}
                    className={`w-20 h-20 rounded-xl border-2 p-1 bg-white shrink-0 overflow-hidden transition-all cursor-pointer ${
                      activeGalleryIndex === idx
                        ? 'border-[#164E3D] shadow-sm'
                        : 'border-[#E2ECE7] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* PDF Data Sheet Download Button */}
            <div className="p-4 rounded-xl bg-[#EBF3F0] border border-emerald-300 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#164E3D] block">
                  Official Technical Data Sheet
                </span>
                <span className="text-[11px] text-slate-600 block">
                  PDF format with measurement tolerances &amp; certification stamps
                </span>
              </div>
              <button
                type="button"
                onClick={() => generateAndPrintDataSheet(selectedPdpProduct)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#164E3D] hover:bg-[#1C5D49] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-[#D4AF37]" />
                <span>Download TDS</span>
              </button>
            </div>
          </div>

          {/* Right 6 cols: Specifications & Live RFQ Drawer */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#AD8921] font-bold">
                <span>{selectedPdpProduct.brand}</span>
                <span>&bull;</span>
                <span>{selectedPdpProduct.categoryLabel}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#164E3D] tracking-tight">
                {selectedPdpProduct.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedPdpProduct.description}
              </p>
            </div>

            {/* Primary Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#F8FAF9] border border-[#E2ECE7]">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Accuracy</span>
                <span className="font-mono text-xs font-bold text-slate-800">{selectedPdpProduct.accuracy}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Range</span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  {selectedPdpProduct.measurementRange}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Compliance</span>
                <span className="font-mono text-xs font-bold text-[#164E3D]">
                  {selectedPdpProduct.compliance}
                </span>
              </div>
            </div>

            {/* Price Indicator & RFQ Add */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  Guide Commercial Rate ({currency})
                </span>
                <span className="font-mono text-2xl font-extrabold text-[#164E3D] tabular-nums">
                  {curr.symbol}
                  {pdpFormattedPrice}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Lead time: {selectedPdpProduct.leadTime}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAddToRfq(selectedPdpProduct)}
                  className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    inCart
                      ? 'bg-[#EBF3F0] text-[#164E3D] border border-emerald-300'
                      : 'btn-primary'
                  }`}
                >
                  {inCart ? (
                    <Check className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                  )}
                  <span>{inCart ? 'In Quote (+1)' : 'Add to Quote'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!inCart) onAddToRfq(selectedPdpProduct);
                    handleGoToStep(2);
                  }}
                  className="py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#c29d2b] text-[#0E3529] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Request a Quote (Step 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Key Specifications Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#AD8921]" />
                <span>Technical Specifications Table</span>
              </h3>
              <div className="rounded-xl border border-[#E2ECE7] overflow-hidden bg-white text-xs divide-y divide-slate-100">
                {selectedPdpProduct.keySpecs.map((spec, idx) => (
                  <div key={idx} className="flex justify-between p-3 first:bg-[#F8FAF9]">
                    <span className="font-medium text-slate-600">{spec.label}</span>
                    <span className="font-mono font-bold text-slate-900 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Accessories & Consumables */}
            {selectedPdpProduct.relatedAccessories && selectedPdpProduct.relatedAccessories.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#AD8921]" />
                  <span>Compatible Accessories &amp; Consumables</span>
                </h3>
                <div className="space-y-2">
                  {selectedPdpProduct.relatedAccessories.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl border border-[#E2ECE7] bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-[10px] text-[#AD8921] font-bold block">
                          {acc.model}
                        </span>
                        <strong className="text-slate-800">{acc.name}</strong>
                        <p className="text-[11px] text-slate-500">{acc.description}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0 ml-3">
                        {curr.symbol}
                        {new Intl.NumberFormat('en-US').format(Math.round(acc.priceUSD * curr.rate))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dedicated "Request a Formal Quotation" Form (Synced with Lead & RFQ Pipeline Viewer) */}
            <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-4">
              <div className="border-b border-[#E2ECE7] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#AD8921] font-bold uppercase tracking-wider block">
                    Direct Pipeline Submission
                  </span>
                  <h3 className="text-base font-bold text-[#164E3D]">
                    Instant Quote &amp; Pro-Forma for {selectedPdpProduct.model}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF3F0] text-[#164E3D] font-bold">
                  Auto-Syncs to Lead Pipeline
                </span>
              </div>

              {pdpRfqSubmitted ? (
                <div className="p-5 rounded-xl bg-white border border-emerald-300 text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-[#164E3D] mx-auto" />
                  <h4 className="text-sm font-bold text-[#164E3D]">
                    Quotation Logged in Lead &amp; RFQ Pipeline!
                  </h4>
                  <p className="text-xs text-slate-600">
                    Reference <strong className="font-mono text-[#164E3D]">{pdpRfqSubmitted}</strong> has been
                    transmitted to the Lead &amp; RFQ Pipeline Viewer.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {pdpSubmittedLead && (
                      <button
                        type="button"
                        onClick={() => {
                          const doc = buildAutomatedInvoiceFromLead(pdpSubmittedLead);
                          setInvoiceModalState({ mode: 'proforma', quote: doc });
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#164E3D] text-[#D4AF37] text-xs font-bold hover:bg-[#123e31] cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Instant Pro-Forma Invoice (PDF)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleGoToStep(2)}
                      className="px-4 py-2 rounded-xl border border-[#164E3D] text-[#164E3D] hover:bg-[#EBF3F0] text-xs font-bold cursor-pointer"
                    >
                      Open Multi-Step RFQ (Steps 2–4)
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePdpRfqSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={pdpClientName}
                        onChange={(e) => setPdpClientName(e.target.value)}
                        placeholder="Engr. Adeyemi"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Company / Facility *
                      </label>
                      <input
                        type="text"
                        required
                        value={pdpClientCompany}
                        onChange={(e) => setPdpClientCompany(e.target.value)}
                        placeholder="Organization name"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={pdpClientEmail}
                        onChange={(e) => setPdpClientEmail(e.target.value)}
                        placeholder="email@company.com"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Direct Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={pdpClientPhone}
                        onChange={(e) => setPdpClientPhone(e.target.value)}
                        placeholder="+234 802 984 4356"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Delivery State in Nigeria
                      </label>
                      <select
                        value={pdpDeliveryState}
                        onChange={(e) => setPdpDeliveryState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Units Required
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={pdpQuantity}
                        onChange={(e) => setPdpQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs font-mono text-slate-800 focus:outline-none focus:border-[#164E3D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Process Notes / Calibration Requirements (Optional)
                    </label>
                    <input
                      type="text"
                      value={pdpNotes}
                      onChange={(e) => setPdpNotes(e.target.value)}
                      placeholder="e.g. Include ISO 17025 calibration certificate & flange kit"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Submit SKU Quote to Lead &amp; RFQ Pipeline</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

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
  }

  // ---------------------------------------------------------------------------
  // RENDER PRODUCTS CATALOG LANDING & SIDEBAR FILTERS
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 pb-28">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: 'Equipment & Products Catalog', active: true }]}
        onNavigate={onNavigate}
      />

      {/* 2. Top Header & Search Bar */}
      <div className="space-y-4 border-b border-[#E2ECE7] pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#AD8921]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Industrial Instrumentation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#164E3D] tracking-tight">
              Equipment &amp; Laboratory Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Browse {cmsProducts.length} precision measurement assets calibrated for Nigerian process conditions.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, accuracy, brand..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#E2ECE7] bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#164E3D] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Quote Banner when items are added in Product Section */}
        {rfqItems.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#164E3D] text-white shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#D4AF37] uppercase font-bold">
                  <span>Active Quotation Schedule</span>
                  <span>&bull;</span>
                  <span>Synced with Lead &amp; RFQ Pipeline</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {rfqItems.length} Equipment SKU(s) ({totalQuoteUnits} Total Units) &mdash; Guide Value:{' '}
                  <span className="font-mono text-[#D4AF37]">
                    {curr.symbol}
                    {formattedQuoteTotal}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => handleGoToStep(2)}
                className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c29d2b] text-[#0E3529] text-xs font-extrabold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Step 2: Review Items</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleGoToStep(3)}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Step 3: Services &amp; SLA</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoToStep(4)}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Step 4: Final Submit</span>
              </button>

              {onOpenQuickRfqModal && (
                <button
                  type="button"
                  onClick={onOpenQuickRfqModal}
                  className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-950 border border-emerald-400/30 text-emerald-200 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3 h-3 text-[#D4AF37]" />
                  <span>Quick Submit to Pipeline</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Bar & View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2ECE7] bg-white text-xs font-semibold text-slate-700"
            >
              <Filter className="w-3.5 h-3.5 text-[#164E3D]" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
              >
                Reset All Filters ({activeFiltersCount})
              </button>
            )}
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredProducts.length}</strong> instruments
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-[#E2ECE7] bg-white text-xs text-slate-700 focus:outline-none focus:border-[#164E3D]"
            >
              <option value="name">Sort by Name (A-Z)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {/* Grid / List View Toggle */}
            <div className="flex items-center rounded-xl border border-[#E2ECE7] bg-white p-0.5">
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewLayout === 'grid'
                    ? 'bg-[#164E3D] text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewLayout === 'list'
                    ? 'bg-[#164E3D] text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Detailed Engineering List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DUAL COLUMN LAYOUT: SIDEBAR FILTERS (3 COLS) + PRODUCT RESULTS (9 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR FILTERS */}
        <aside
          className={`lg:col-span-3 space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="p-5 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#164E3D]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#164E3D]">
                  Sidebar Filters
                </h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter 1: Category */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Category
              </span>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#EBF3F0] text-[#164E3D] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-[#164E3D]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 2: Brand / Manufacturer */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Brand / Manufacturer
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedBrand('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    selectedBrand === 'all'
                      ? 'bg-[#EBF3F0] text-[#164E3D] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Brands</span>
                </button>
                {(cmsBrands && cmsBrands.length > 0 ? cmsBrands : BRANDS).map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      selectedBrand === brand
                        ? 'bg-[#EBF3F0] text-[#164E3D] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">{brand}</span>
                    {selectedBrand === brand && (
                      <Check className="w-3.5 h-3.5 text-[#164E3D] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Application Industry */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Application Industry
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedIndustry('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    selectedIndustry === 'all'
                      ? 'bg-[#EBF3F0] text-[#164E3D] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Sectors</span>
                </button>
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      selectedIndustry === ind.id
                        ? 'bg-[#EBF3F0] text-[#164E3D] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">{ind.name}</span>
                    {selectedIndustry === ind.id && (
                      <Check className="w-3.5 h-3.5 text-[#164E3D] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 4: Stock Status */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Availability &amp; Lead Time
              </span>
              <div className="space-y-1">
                {stockOptions.map((stk) => (
                  <button
                    key={stk.id}
                    onClick={() => setSelectedStock(stk.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      selectedStock === stk.id
                        ? 'bg-[#EBF3F0] text-[#164E3D] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{stk.label}</span>
                    {selectedStock === stk.id && <Check className="w-3.5 h-3.5 text-[#164E3D]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* RESULTS STAGE (9 COLS) */}
        <div className="lg:col-span-9 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-[#E2ECE7] text-center space-y-4">
              <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No instruments matched your filter criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try widening your category or brand selection, or contact our engineering desk for unlisted instrumentation models.
              </p>
              <button onClick={handleClearFilters} className="btn-primary py-2 px-4 text-xs">
                Reset Filters
              </button>
            </div>
          ) : viewLayout === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard
                    product={product}
                    currency={currency}
                    onAddToRfq={onAddToRfq}
                    onViewDetails={() => handleOpenPdp(product)}
                    isInRfq={rfqProductIds.has(product.id)}
                    onRequestQuote={() => handleGoToStep(2)}
                  />
                  {/* Detailed PDP Link trigger button */}
                  <div className="pt-2 flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!rfqProductIds.has(product.id)) onAddToRfq(product);
                        handleGoToStep(2);
                      }}
                      className="text-[11px] font-bold text-[#AD8921] hover:text-[#164E3D] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Request Quote (Steps 2–4)</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPdp(product)}
                      className="text-[11px] font-bold text-[#164E3D] hover:text-[#AD8921] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Specs &amp; PDP</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* DETAILED ENGINEERING LIST VIEW */
            <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-sm divide-y divide-[#E2ECE7] overflow-hidden">
              {filteredProducts.map((product) => {
                const convertedPrice = Math.round(product.basePriceUSD * curr.rate);
                const formattedPrice = new Intl.NumberFormat('en-US').format(convertedPrice);
                const inCart = rfqProductIds.has(product.id);

                return (
                  <div
                    key={product.id}
                    className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-[#F8FAF9] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover bg-[#F4F8F6] border border-[#E2ECE7] shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#AD8921]">
                          <span>{product.model}</span>
                          <span>&bull;</span>
                          <span>{product.brand}</span>
                        </div>
                        <h4
                          onClick={() => handleOpenPdp(product)}
                          className="text-sm font-bold text-[#164E3D] hover:underline cursor-pointer"
                        >
                          {product.name}
                        </h4>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                          <span>
                            Accuracy: <strong>{product.accuracy}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>Range: {product.measurementRange}</span>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-medium">{product.leadTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-right">
                        <span className="font-mono text-base font-bold text-slate-900 block tabular-nums">
                          {curr.symbol}
                          {formattedPrice}
                        </span>
                        <span className="text-[10px] text-slate-400">Guide Rate</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPdp(product)}
                          className="px-3 py-2 rounded-xl border border-[#E2ECE7] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                        >
                          View PDP
                        </button>

                        <button
                          type="button"
                          onClick={() => onAddToRfq(product)}
                          className={`py-2 px-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                            inCart
                              ? 'bg-[#EBF3F0] text-[#164E3D] border border-emerald-300'
                              : 'btn-primary'
                          }`}
                        >
                          {inCart ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                          )}
                          <span>{inCart ? 'In Quote (+1)' : 'Add to Quote'}</span>
                        </button>

                        {inCart && (
                          <button
                            type="button"
                            onClick={() => handleGoToStep(2)}
                            className="py-2 px-3 rounded-xl bg-[#D4AF37] hover:bg-[#c29d2b] text-[#0E3529] font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Quote</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Quote Progression Bar when items are in quote */}
      {rfqItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-5xl mx-auto pointer-events-none">
          <div className="pointer-events-auto rounded-2xl bg-[#0E3529]/95 backdrop-blur-md border border-[#D4AF37]/40 p-3.5 sm:px-6 shadow-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-[#D4AF37] text-[#0E3529] font-mono font-extrabold">
                {totalQuoteUnits} Unit{totalQuoteUnits !== 1 ? 's' : ''}
              </span>
              <div>
                <strong className="block text-white">
                  {rfqItems.length} Instrument SKU(s) Ready for Quotation
                </strong>
                <span className="text-[11px] text-emerald-200 font-mono">
                  Est. Total: {curr.symbol}
                  {formattedQuoteTotal} &bull; Syncs with Lead &amp; RFQ Pipeline
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onOpenQuickRfqModal && (
                <button
                  type="button"
                  onClick={onOpenQuickRfqModal}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Quick Pipeline Submit
                </button>
              )}

              <button
                type="button"
                onClick={() => handleGoToStep(2)}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e3be42] text-[#0E3529] text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <span>Proceed to Request a Quote (Steps 2–4)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
