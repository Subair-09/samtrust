import React from 'react';
import { ProductItem, CurrencyCode } from '../types';
import { CURRENCIES } from '../data/mockData';
import { X, ShieldCheck, Check, Plus, Clock, FileText, ChevronRight } from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductItem | null;
  currency: CurrencyCode;
  onClose: () => void;
  onAddToRfq: (product: ProductItem) => void;
  isInRfq: boolean;
  onNavigateToRfq: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  onClose,
  onAddToRfq,
  isInRfq,
  onNavigateToRfq,
}) => {
  if (!product) return null;

  const curr = CURRENCIES[currency];
  const convertedPrice = Math.round(product.basePriceUSD * curr.rate);
  const formattedPrice = new Intl.NumberFormat('en-US').format(convertedPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0E3529]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E2ECE7] overflow-hidden z-10 max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 border-b border-[#E2ECE7] flex items-center justify-between bg-[#F4F8F6]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#536E63]">
            <span className="font-semibold text-[#164E3D]">{product.categoryLabel}</span>
            <span>&bull;</span>
            <span className="font-bold text-[#AD8921]">{product.model}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image */}
            <div className="rounded-xl overflow-hidden border border-[#E2ECE7] bg-[#F4F8F6] aspect-4/3 relative">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-[#164E3D]/90 text-white text-[11px] font-mono">
                {product.compliance}
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A2E26] leading-snug">
                {product.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              <div className="p-3.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Certified Accuracy:</span>
                  <span className="font-mono font-bold text-[#164E3D]">{product.accuracy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Operating Range:</span>
                  <span className="font-mono font-medium text-slate-800">{product.measurementRange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Factory Lead Time:</span>
                  <span className="font-mono text-emerald-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{product.leadTime}</span>
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Guide Unit Valuation
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-sm font-bold text-[#AD8921]">{curr.symbol}</span>
                  <span className="text-2xl font-extrabold font-mono text-[#164E3D] tabular-nums">
                    {formattedPrice}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">ex-works / subject to configuration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#164E3D] border-b border-[#E2ECE7] pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              <span>Engineering & Material Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.keySpecs.map((spec, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-[#E2ECE7] bg-white flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">
                    {spec.label}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-800">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance & Quality Assurance Note */}
          <div className="p-4 rounded-xl bg-[#FCF8EA] border border-[#D4AF37]/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#AD8921] shrink-0 mt-0.5" />
            <div className="text-xs text-[#5C450B]">
              <span className="font-bold block text-[#164E3D]">Samstrust Factory Calibration Guarantee</span>
              Each unit is issued with a traceable certificate of calibration in accordance with ISO/IEC 17025 standards and certified test report upon dispatch.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E2ECE7] bg-[#F4F8F6] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close Window
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onAddToRfq(product)}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isInRfq
                  ? 'bg-[#EBF3F0] text-[#164E3D] border border-[#164E3D]/30'
                  : 'bg-[#164E3D] text-white hover:bg-[#0D3327]'
              }`}
            >
              {isInRfq ? (
                <>
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>Item in RFQ List</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to RFQ List</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToRfq();
              }}
              className="flex-1 sm:flex-none btn-primary-gold text-xs py-2.5 px-4 flex items-center justify-center gap-1"
            >
              <span>Review RFQ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
