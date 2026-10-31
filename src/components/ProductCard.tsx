import React, { useState } from 'react';
import { ProductItem, CurrencyCode } from '../types';
import { CURRENCIES } from '../data/mockData';
import { Plus, Check, Eye, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  currency: CurrencyCode;
  onAddToRfq: (product: ProductItem) => void;
  onViewDetails: (product: ProductItem) => void;
  isInRfq: boolean;
  onRequestQuote?: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  onAddToRfq,
  onViewDetails,
  isInRfq,
  onRequestQuote,
}) => {
  const [addedEffect, setAddedEffect] = useState(false);
  const [imageError, setImageError] = useState(false);

  const curr = CURRENCIES[currency];
  const convertedPrice = Math.round(product.basePriceUSD * curr.rate);
  const formattedPrice = new Intl.NumberFormat('en-US').format(convertedPrice);

  const handleAdd = () => {
    onAddToRfq(product);
    setAddedEffect(true);
    setTimeout(() => setAddedEffect(false), 1500);
  };

  return (
    <div className="card-scientific group flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div>
        {/* Product Image Stage */}
        <div className="relative aspect-4/3 w-full bg-[#F4F8F6] overflow-hidden border-b border-[#E2ECE7]">
          {!imageError ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-emerald-950 text-white">
              <Shield className="w-10 h-10 text-[#D4AF37] mb-2" />
              <span className="font-semibold text-sm">{product.name}</span>
              <span className="text-xs text-emerald-300 mt-1">{product.model}</span>
            </div>
          )}

          {/* Clean Overlay Action */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="p-2 rounded-lg bg-white/90 backdrop-blur-md text-[#164E3D] hover:bg-white hover:text-[#0D3327] shadow-sm transition-all cursor-pointer"
              title="Inspect Full Specifications"
              aria-label="View Product Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Model Tag Overlay */}
          <div className="absolute bottom-2 left-3">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider font-semibold bg-[#164E3D]/90 text-white backdrop-blur-xs">
              {product.model}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Metadata Discipline: Clean unboxed metadata with bullet separator */}
          <div className="flex items-center gap-2 text-xs text-[#536E63]">
            <span className="font-semibold text-[#164E3D]">{product.categoryLabel}</span>
            <span aria-hidden="true">&bull;</span>
            <span className="font-mono">{product.compliance}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="text-lg font-bold text-[#1A2E26] group-hover:text-[#164E3D] transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Key Specifications Grid */}
          <div className="pt-2 border-t border-[#E2ECE7] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] uppercase tracking-wider text-slate-500">Accuracy:</span>
              <span className="font-mono font-semibold text-[#164E3D]">{product.accuracy}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] uppercase tracking-wider text-slate-500">Range:</span>
              <span className="font-mono text-slate-800 text-[11px] truncate max-w-[180px]" title={product.measurementRange}>
                {product.measurementRange}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer with Price & RFQ CTA */}
      <div className="p-5 pt-3 border-t border-[#E2ECE7] bg-[#FAFDFB] flex items-center justify-between gap-2">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Guide Unit Value
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-[#AD8921]">{curr.symbol}</span>
            <span className="text-lg font-bold font-mono text-[#164E3D] tabular-nums tracking-tight">
              {formattedPrice}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAdd}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              addedEffect
                ? 'bg-[#10B981] text-white'
                : isInRfq
                ? 'bg-[#EBF3F0] text-[#164E3D] hover:bg-[#D4AF37]/20 border border-[#164E3D]/30'
                : 'bg-[#164E3D] text-white hover:bg-[#0D3327] border border-[#164E3D]'
            }`}
            title={isInRfq ? 'Click to add another unit to quote' : 'Add instrument to quotation schedule'}
          >
            {addedEffect ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : isInRfq ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#164E3D]" />
                <span>In Quote (+1)</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Quote</span>
              </>
            )}
          </button>

          {isInRfq && onRequestQuote && (
            <button
              type="button"
              onClick={() => onRequestQuote(product)}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c29d2b] text-[#0E3529] text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Proceed to Request a Quote (Steps 2-4)"
            >
              <span>Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
