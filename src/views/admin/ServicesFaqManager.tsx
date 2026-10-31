import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { FaqItem } from '../../types/cms';
import { ServiceItem } from '../../types';
import {
  HelpCircle,
  Wrench,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Check,
  ChevronDown,
  DollarSign,
  Clock,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';

export const ServicesFaqManager: React.FC = () => {
  const { faqs, addFaq, updateFaq, deleteFaq, services, updateService, canEditContent } = useCms();

  const [activeTab, setActiveTab] = useState<'faqs' | 'services'>('faqs');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [isNewFaq, setIsNewFaq] = useState(false);

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [newScopeBullet, setNewScopeBullet] = useState('');

  const faqCategories: FaqItem['category'][] = [
    'Calibration',
    'Procurement',
    'Field Dispatch',
    'Compliance & Quality',
    'Billing & Terms',
  ];

  const filteredFaqs = faqs.filter((f) => {
    if (selectedFaqCategory === 'all') return true;
    return f.category === selectedFaqCategory;
  });

  const handleCreateFaq = (categoryPreset?: FaqItem['category']) => {
    // Determine category based on parameter, current filter, or default to 'Calibration'
    const targetCategory: FaqItem['category'] =
      categoryPreset && faqCategories.includes(categoryPreset)
        ? categoryPreset
        : selectedFaqCategory !== 'all' && faqCategories.includes(selectedFaqCategory as FaqItem['category'])
        ? (selectedFaqCategory as FaqItem['category'])
        : 'Calibration';

    const blank: FaqItem = {
      id: '',
      category: targetCategory,
      question: '',
      answer: '',
      order: faqs.length + 1,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setEditingFaq(blank);
    setIsNewFaq(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    if (isNewFaq) {
      addFaq(editingFaq);
    } else {
      updateFaq(editingFaq);
    }
    setEditingFaq(null);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    updateService(editingService);
    setEditingService(null);
  };

  const handleAddScopeBullet = () => {
    if (newScopeBullet.trim() && editingService) {
      setEditingService({
        ...editingService,
        scope: [...editingService.scope, newScopeBullet.trim()],
      });
      setNewScopeBullet('');
    }
  };

  const handleRemoveScopeBullet = (idx: number) => {
    if (editingService) {
      setEditingService({
        ...editingService,
        scope: editingService.scope.filter((_, i) => i !== idx),
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2ECE7] pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
            Operations &amp; Client Enablement
          </span>
          <h2 className="text-2xl font-bold text-[#164E3D]">Services &amp; FAQ Manager</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage public FAQs by category, update technical service scopes, and configure pricing models.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center rounded-xl border border-[#E2ECE7] bg-white p-1">
          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'faqs' ? 'bg-[#164E3D] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FAQs Accordion Manager ({faqs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'services' ? 'bg-[#164E3D] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Service Scopes &amp; Pricing ({services.length})
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: FAQs ACCORDION LISTS
         ========================================================================= */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedFaqCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  selectedFaqCategory === 'all'
                    ? 'bg-[#164E3D] text-white'
                    : 'bg-white text-slate-600 border border-[#E2ECE7]'
                }`}
              >
                All Categories
              </button>
              {faqCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFaqCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                    selectedFaqCategory === cat
                      ? 'bg-[#164E3D] text-white'
                      : 'bg-white text-slate-600 border border-[#E2ECE7]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {canEditContent && (
              <button
                type="button"
                onClick={() =>
                  handleCreateFaq(
                    selectedFaqCategory !== 'all'
                      ? (selectedFaqCategory as FaqItem['category'])
                      : undefined
                  )
                }
                className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                title={
                  selectedFaqCategory !== 'all'
                    ? `Create new FAQ under "${selectedFaqCategory}"`
                    : 'Create new FAQ'
                }
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>
                  {selectedFaqCategory !== 'all'
                    ? `Add FAQ (${selectedFaqCategory})`
                    : 'Add New FAQ'}
                </span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 px-6 rounded-2xl bg-white border border-dashed border-[#E2ECE7] space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">
                  No FAQs in {selectedFaqCategory === 'all' ? 'Knowledge Base' : selectedFaqCategory}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {selectedFaqCategory === 'all'
                    ? 'Start building your technical knowledge base by adding questions and answers.'
                    : `No questions have been recorded yet under the "${selectedFaqCategory}" category.`}
                </p>
                {canEditContent && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCreateFaq(
                        selectedFaqCategory !== 'all'
                          ? (selectedFaqCategory as FaqItem['category'])
                          : 'Calibration'
                      )
                    }
                    className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs mt-2"
                  >
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                    <span>
                      Add Blank FAQ for {selectedFaqCategory === 'all' ? 'Calibration' : selectedFaqCategory}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-5 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm space-y-2 hover:border-[#164E3D] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#AD8921] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                      {faq.category} &bull; Order {faq.order}
                    </span>

                    {canEditContent && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFaq({ ...faq });
                            setIsNewFaq(false);
                          }}
                          className="p-1 rounded-md text-slate-500 hover:text-[#164E3D] hover:bg-[#EBF3F0] transition-colors"
                          title="Edit question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFaq(faq.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[#164E3D]">{faq.question}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    Last Updated: {faq.lastUpdated}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TECHNICAL SERVICES & PRICING GUIDANCE
         ========================================================================= */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-6 rounded-2xl bg-white border border-[#E2ECE7] shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#EBF3F0] text-[#164E3D]">
                    {srv.standards.split('&')[0]}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      srv.pricingType === 'fixed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {srv.pricingType === 'fixed' ? 'Fixed Guide Rate' : 'Custom On-Site Survey'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#164E3D]">{srv.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{srv.subtitle}</p>
                </div>

                {/* Scope bullets */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <span className="font-bold text-slate-400 text-[10px] uppercase font-mono block">
                    Execution Scope:
                  </span>
                  {srv.scope.map((b, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D] shrink-0 mt-1.5" />
                      <span className="line-clamp-2">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2ECE7] flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 text-[11px]">{srv.turnaroundTime}</span>
                {canEditContent && (
                  <button
                    type="button"
                    onClick={() => setEditingService({ ...srv })}
                    className="px-3 py-1.5 rounded-lg bg-[#EBF3F0] hover:bg-emerald-100 text-[#164E3D] font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Service</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT FAQ MODAL */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E2ECE7] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#164E3D]">
                  {isNewFaq ? 'Add New Knowledge FAQ' : 'Edit FAQ Item'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isNewFaq
                    ? 'Enter a new question and authoritative technical answer below.'
                    : 'Update this FAQ question, answer, category, or display ordering.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
              {/* Category Selector Chips + Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-700">
                    Category *
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Click to switch or pick from dropdown
                  </span>
                </div>

                {/* 5 Category Quick Buttons */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {faqCategories.map((cat) => {
                    const isSelected = editingFaq.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setEditingFaq({ ...editingFaq, category: cat })
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#164E3D] text-white shadow-xs ring-2 ring-[#164E3D]/20'
                            : 'bg-[#F4F7F6] text-slate-700 border border-[#E2ECE7] hover:bg-[#EBF3F0] hover:text-[#164E3D]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                <select
                  value={editingFaq.category}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      category: e.target.value as FaqItem['category'],
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-[#F8FAF9] text-slate-800 focus:outline-none focus:border-[#164E3D]"
                >
                  {faqCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    editingFaq.category === 'Calibration'
                      ? 'e.g., What accreditation standards cover pressure transmitter calibration?'
                      : editingFaq.category === 'Procurement'
                      ? 'e.g., What is the lead time for certified OEM valve positioners?'
                      : editingFaq.category === 'Field Dispatch'
                      ? 'e.g., How quickly can a certified metrologist mobilize offshore?'
                      : editingFaq.category === 'Compliance & Quality'
                      ? 'e.g., How are ISO/IEC 17025 calibration certificates verified?'
                      : 'e.g., What commercial terms apply to corporate instrumentation supply contracts?'
                  }
                  value={editingFaq.question}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#164E3D]"
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Input detailed technical specification, operational protocol, or standard operating guidance..."
                  value={editingFaq.answer}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answer: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECE7] bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#164E3D] resize-none"
                />
              </div>

              {/* Order and Active Category preview */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Display Order #
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingFaq.order}
                    onChange={(e) =>
                      setEditingFaq({
                        ...editingFaq,
                        order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] bg-white text-slate-800 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Category
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[#AD8921] font-mono font-bold text-xs truncate">
                    {editingFaq.category}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2ECE7]">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isNewFaq ? 'Save New FAQ' : 'Update FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SERVICE MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E2ECE7] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-3">
              <h3 className="text-base font-bold text-[#164E3D]">
                Edit Service Scope &amp; Pricing Guidance
              </h3>
              <button onClick={() => setEditingService(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subtitle / Technical Focus</label>
                <input
                  type="text"
                  value={editingService.subtitle}
                  onChange={(e) => setEditingService({ ...editingService, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pricing Guidance Mode</label>
                  <select
                    value={editingService.pricingType || 'survey'}
                    onChange={(e) => setEditingService({ ...editingService, pricingType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-800"
                  >
                    <option value="survey">Custom On-Site Survey / Scope Assessment</option>
                    <option value="fixed">Fixed Standardized Tariff</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Turnaround Time SLA</label>
                  <input
                    type="text"
                    value={editingService.turnaroundTime}
                    onChange={(e) => setEditingService({ ...editingService, turnaroundTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-800"
                  />
                </div>
              </div>

              {/* Scope Bullets */}
              <div className="space-y-2 p-4 rounded-xl bg-[#F8FAF9] border border-[#E2ECE7]">
                <label className="block font-bold text-[#164E3D] uppercase tracking-wider text-[11px]">
                  Technical Scope Bullet Points
                </label>
                <div className="space-y-1.5">
                  {editingService.scope.map((bullet, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-white border border-[#E2ECE7]">
                      <span className="flex-1 text-slate-700">{bullet}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveScopeBullet(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newScopeBullet}
                    onChange={(e) => setNewScopeBullet(e.target.value)}
                    placeholder="Add new engineering scope deliverable..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E2ECE7] bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddScopeBullet}
                    className="px-4 py-1.5 rounded-lg bg-[#164E3D] text-white font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs shadow-xs"
                >
                  Save Service Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
