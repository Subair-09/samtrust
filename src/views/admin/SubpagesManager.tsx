import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { CustomSubpage, SubpageBlock, SubpageBlockType, SubpageParent } from '../../types/cms';
import { NavTab } from '../../types';
import {
  Plus,
  Trash2,
  Edit3,
  Copy,
  Eye,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
  Layers,
  Sparkles,
  BookOpen,
  Calendar,
  User,
  Search,
  Filter,
  ShieldCheck,
  Award,
  X,
  Scale,
  Gauge,
  Wrench,
  AlertTriangle,
  Info,
  ArrowRight,
  Check,
  Image as ImageIcon,
  GripVertical,
  Move,
} from 'lucide-react';

interface SubpagesManagerProps {
  onNavigateToSubpage?: (slug: string) => void;
}

const DEFAULT_IMAGES = [
  { label: 'Laboratory Cleanroom', url: '/assets/aistudio/lab_0a015732.jfif' },
  { label: 'Industrial Flowmeters', url: '/assets/aistudio/Gemini_Generated_Image_3r09g53r09g53r09_7495901f.jfif' },
  { label: 'Analytical Balances', url: '/assets/aistudio/Gemini_Generated_Image_ndqgbpndqgbpndqg__1__500705da.jfif' },
  { label: 'Cleanroom Validation', url: '/assets/aistudio/Gemini_Generated_Image_kbf03ikbf03ikbf0_ce47ed91.jfif' },
];

export const SubpagesManager: React.FC<SubpagesManagerProps> = ({ onNavigateToSubpage }) => {
  const {
    subpages,
    addSubpage,
    updateSubpage,
    deleteSubpage,
    duplicateSubpage,
    reorderSubpages,
    canEditContent,
    currentUser,
  } = useCms();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [parentFilter, setParentFilter] = useState<'all' | SubpageParent>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Drag and Drop state for Table Rows (Pages)
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
  const [dragOverPageIndex, setDragOverPageIndex] = useState<number | null>(null);

  // Drag and Drop state for Content Blocks inside modal
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverBlockIndex, setDragOverBlockIndex] = useState<number | null>(null);

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSubpage, setEditingSubpage] = useState<CustomSubpage | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Filtered Pages
  const filteredSubpages = subpages.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesParent = parentFilter === 'all' || item.parentPage === parentFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && item.published) ||
      (statusFilter === 'draft' && !item.published);
    return matchesSearch && matchesParent && matchesStatus;
  });

  // Open Editor for New Page
  const handleCreateNew = () => {
    const newPage: CustomSubpage = {
      id: '',
      slug: 'new-technical-specification',
      parentPage: 'services',
      title: 'New Technical Specification & Protocol',
      subtitle: 'Comprehensive metrology guidelines, operational tolerances, and audit requirements.',
      badge: 'TECHNICAL DOSSIER • METROLOGY STANDARDS',
      heroImage: DEFAULT_IMAGES[0].url,
      published: true,
      showInNavigation: true,
      order: subpages.length + 1,
      author: currentUser?.name || 'Metrology Engineering Team',
      lastUpdated: new Date().toISOString().split('T')[0],
      sections: [
        {
          id: `sec-${Date.now()}-1`,
          type: 'text',
          title: 'Scope of Application & Regulatory Framework',
          content:
            'This technical dossier outlines verified operating parameters, metrological traceability benchmarks, and routine maintenance protocols for critical process equipment in accordance with international ISO standards.',
        },
        {
          id: `sec-${Date.now()}-2`,
          type: 'features',
          title: 'Core Validation Capabilities',
          items: [
            {
              title: 'Calibration Repeatability',
              desc: 'Multi-run verification ensuring deviation within ±0.05% of scale span.',
              icon: 'ShieldCheck',
            },
            {
              title: 'Environmental Control',
              desc: 'Stabilized thermal and atmospheric chambers preventing drift.',
              icon: 'Gauge',
            },
          ],
        },
        {
          id: `sec-${Date.now()}-3`,
          type: 'cta',
          title: 'Request Certified Testing or Calibration',
          content: 'Speak with our certified metrologists to book on-site or laboratory recertification.',
          ctaText: 'Contact Application Engineers',
          ctaDestination: 'contact',
        },
      ],
    };
    setEditingSubpage(newPage);
    setIsEditorOpen(true);
  };

  // Open Editor for Existing Page
  const handleEdit = (subpage: CustomSubpage) => {
    setEditingSubpage(JSON.parse(JSON.stringify(subpage))); // deep clone
    setIsEditorOpen(true);
  };

  // Save changes
  const handleSaveSubpage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubpage) return;

    if (!editingSubpage.title.trim()) {
      alert('Please provide a page title.');
      return;
    }

    // Slug sanitization
    const sanitizedSlug = editingSubpage.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const updatedPage: CustomSubpage = {
      ...editingSubpage,
      slug: sanitizedSlug,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    if (editingSubpage.id) {
      updateSubpage(updatedPage);
      showNotification(`Page "${updatedPage.title}" successfully updated!`);
    } else {
      addSubpage(updatedPage);
      showNotification(`New page "${updatedPage.title}" created and published!`);
    }

    setIsEditorOpen(false);
    setEditingSubpage(null);
  };

  // Drag and drop handlers for Pages list
  const isDragAndDropEnabled = canEditContent && parentFilter === 'all' && !searchQuery && statusFilter === 'all';

  const handlePageDragStart = (e: React.DragEvent, index: number) => {
    if (!isDragAndDropEnabled) return;
    setDraggedPageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handlePageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverPageIndex !== index) {
      setDragOverPageIndex(index);
    }
  };

  const handlePageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedPageIndex === null || draggedPageIndex === targetIndex) {
      setDraggedPageIndex(null);
      setDragOverPageIndex(null);
      return;
    }

    const draggedItem = subpages[draggedPageIndex];
    reorderSubpages(draggedPageIndex, targetIndex);
    showNotification(`Moved "${draggedItem.title}" to position #${targetIndex + 1}`);

    setDraggedPageIndex(null);
    setDragOverPageIndex(null);
  };

  const handlePageDragEnd = () => {
    setDraggedPageIndex(null);
    setDragOverPageIndex(null);
  };

  const handleMovePageStep = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= subpages.length) return;
    const item = subpages[index];
    reorderSubpages(index, targetIdx);
    showNotification(`Moved "${item.title}" ${direction}`);
  };

  // Block management inside editor
  const handleAddBlock = (type: SubpageBlockType) => {
    if (!editingSubpage) return;
    const newBlock: SubpageBlock = {
      id: `blk-${Date.now()}`,
      type,
      title:
        type === 'text'
          ? 'Technical Overview'
          : type === 'features'
          ? 'Key Engineering Specifications'
          : type === 'specs'
          ? 'Metrological Parameters Matrix'
          : type === 'callout'
          ? 'Audit & Regulatory Notice'
          : 'Consultation & Inquiries',
      content:
        type === 'text'
          ? 'Enter comprehensive technical documentation and regulatory procedures here...'
          : type === 'callout'
          ? 'All procedures must comply with ISO/IEC 17025 metrological traceability guidelines.'
          : 'Contact Samstrust Technologies to schedule a technical consultation or site visit.',
      items:
        type === 'features'
          ? [
              { title: 'ISO 17025 Calibrated', desc: 'Traceable to National Metrology Institutes.', icon: 'Award' },
              { title: 'ATEX Zone Certified', desc: 'Compliant with hazardous explosive atmospheres.', icon: 'ShieldCheck' },
            ]
          : undefined,
      specs:
        type === 'specs'
          ? [
              { label: 'Measurement Uncertainty', value: 'U = 0.015% (k=2)' },
              { label: 'Operating Pressure', value: 'Up to 2,500 bar' },
              { label: 'Temperature Range', value: '-45°C to +1,250°C' },
            ]
          : undefined,
      calloutType: type === 'callout' ? 'audit' : undefined,
      ctaText: type === 'cta' ? 'Request Formal Quotation' : undefined,
      ctaDestination: type === 'cta' ? 'contact' : undefined,
    };

    setEditingSubpage({
      ...editingSubpage,
      sections: [...editingSubpage.sections, newBlock],
    });
  };

  const handleRemoveBlock = (blockId: string) => {
    if (!editingSubpage) return;
    setEditingSubpage({
      ...editingSubpage,
      sections: editingSubpage.sections.filter((b) => b.id !== blockId),
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!editingSubpage) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingSubpage.sections.length) return;

    const newSections = [...editingSubpage.sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    setEditingSubpage({
      ...editingSubpage,
      sections: newSections,
    });
  };

  // Drag and drop for content blocks inside modal
  const handleBlockDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBlockDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverBlockIndex !== index) {
      setDragOverBlockIndex(index);
    }
  };

  const handleBlockDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!editingSubpage || draggedBlockIndex === null || draggedBlockIndex === targetIndex) {
      setDraggedBlockIndex(null);
      setDragOverBlockIndex(null);
      return;
    }

    const nextSections = [...editingSubpage.sections];
    const [moved] = nextSections.splice(draggedBlockIndex, 1);
    nextSections.splice(targetIndex, 0, moved);

    setEditingSubpage({
      ...editingSubpage,
      sections: nextSections,
    });

    setDraggedBlockIndex(null);
    setDragOverBlockIndex(null);
  };

  const handleBlockDragEnd = () => {
    setDraggedBlockIndex(null);
    setDragOverBlockIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#EBF3F0] to-white p-6 rounded-2xl border border-[#E2ECE7]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#164E3D]">
            <Layers className="w-4 h-4 text-[#AD8921]" />
            <span>DYNAMIC PAGE ARCHITECTURE &amp; METROLOGY DOSSIERS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#164E3D]">Create &amp; Manage Pages</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Create new pages, organize content, and <strong>drag &amp; drop to arrange page sequence</strong> across the site. All pages render with live breadcrumbs, specs matrices, and direct customer CTAs.
          </p>
        </div>

        <button
          type="button"
          disabled={!canEditContent}
          onClick={handleCreateNew}
          className="btn-primary-gold py-2.5 px-5 text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Page</span>
        </button>
      </div>

      {/* Notification Toast */}
      {feedbackMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Reorder / Drag & Drop Helper Hint */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-[#AD8921]" />
          <span>
            <strong>Drag &amp; Drop:</strong> Grab the <GripVertical className="w-3.5 h-3.5 inline text-slate-400" /> icon on any page row to drag and rearrange order. Or use the up/down arrows.
          </span>
        </div>
        {!isDragAndDropEnabled && (
          <span className="text-[11px] text-amber-600 font-medium">
            (Clear filters/search to enable full reordering)
          </span>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#E2ECE7] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages by title, slug, or content..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#164E3D]/20 focus:border-[#164E3D]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Parent:</span>
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Pages</option>
              <option value="about">Under About Us</option>
              <option value="services">Under Services</option>
              <option value="industries">Under Industries</option>
              <option value="none">Standalone Page (No Parent)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pages Table with Drag & Drop */}
      <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2ECE7] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-14">Order</th>
                <th className="py-3.5 px-4">Page Title &amp; URL Slug</th>
                <th className="py-3.5 px-4">Placement / Parent</th>
                <th className="py-3.5 px-4">Content Blocks</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2ECE7] text-xs">
              {filteredSubpages.length > 0 ? (
                filteredSubpages.map((subpage, idx) => {
                  const originalIndex = subpages.findIndex((s) => s.id === subpage.id);
                  const isBeingDragged = draggedPageIndex === originalIndex;
                  const isDragTarget = dragOverPageIndex === originalIndex;

                  return (
                    <tr
                      key={subpage.id}
                      draggable={isDragAndDropEnabled}
                      onDragStart={(e) => handlePageDragStart(e, originalIndex)}
                      onDragOver={(e) => handlePageDragOver(e, originalIndex)}
                      onDrop={(e) => handlePageDrop(e, originalIndex)}
                      onDragEnd={handlePageDragEnd}
                      className={`transition-all select-none ${
                        isBeingDragged ? 'opacity-35 bg-slate-100' : ''
                      } ${
                        isDragTarget
                          ? 'border-t-2 border-[#164E3D] bg-emerald-50/70 shadow-inner'
                          : 'hover:bg-[#F4F8F6]/60'
                      }`}
                    >
                      {/* Drag Handle & Order controls */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isDragAndDropEnabled ? (
                            <div
                              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-grab active:cursor-grabbing transition-colors"
                              title="Click and drag to reorder page"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                          ) : (
                            <span className="w-4 h-4" />
                          )}
                          <span className="font-mono text-[11px] text-slate-500 font-bold w-5 text-right">
                            #{originalIndex + 1}
                          </span>
                        </div>
                      </td>

                      {/* Title & Slug */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div
                            className="font-bold text-[#164E3D] text-sm hover:underline cursor-pointer flex items-center gap-1.5"
                            onClick={() => handleEdit(subpage)}
                          >
                            <span>{subpage.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                            <span>slug:</span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              /{subpage.parentPage !== 'none' ? subpage.parentPage + '/' : ''}{subpage.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Placement / Parent */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EBF3F0] text-[#164E3D] capitalize">
                          <BookOpen className="w-3 h-3 text-[#AD8921]" />
                          <span>
                            {subpage.parentPage === 'none' ? 'Standalone (No Parent)' : subpage.parentPage}
                          </span>
                        </span>
                      </td>

                      {/* Blocks count */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {subpage.sections.length} blocks
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {subpage.published ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>Published</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full text-[11px] border border-amber-200">
                            <span>Draft</span>
                          </span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-4 text-slate-500 font-sans">
                        <div>{subpage.lastUpdated}</div>
                        {subpage.author && <div className="text-[10px] text-slate-400">{subpage.author}</div>}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Step Up / Down */}
                          {canEditContent && (
                            <>
                              <button
                                type="button"
                                disabled={originalIndex === 0}
                                onClick={() => handleMovePageStep(originalIndex, 'up')}
                                title="Move Up in Sequence"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={originalIndex === subpages.length - 1}
                                onClick={() => handleMovePageStep(originalIndex, 'down')}
                                title="Move Down in Sequence"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Live Preview Button */}
                          {onNavigateToSubpage && (
                            <button
                              type="button"
                              onClick={() => onNavigateToSubpage(subpage.slug)}
                              title="Preview on Public Website"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer ml-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#164E3D]" />
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleEdit(subpage)}
                            title="Edit Page Content & Blocks"
                            className="p-1.5 rounded-lg bg-[#EBF3F0] hover:bg-[#D4E7DF] text-[#164E3D] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate Button */}
                          <button
                            type="button"
                            disabled={!canEditContent}
                            onClick={() => {
                              duplicateSubpage(subpage.id);
                              showNotification(`Duplicated page "${subpage.title}"`);
                            }}
                            title="Duplicate Page"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={!canEditContent}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete page "${subpage.title}"?`)) {
                                deleteSubpage(subpage.id);
                                showNotification(`Deleted page "${subpage.title}"`);
                              }
                            }}
                            title="Delete Page"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No pages match your search criteria. Click "Create New Page" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =============================================================
          PAGE BUILDER & EDITOR MODAL / DRAWER
         ============================================================= */}
      {isEditorOpen && editingSubpage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E2ECE7] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E2ECE7] flex items-center justify-between bg-gradient-to-r from-[#F4F8F6] to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF3F0] flex items-center justify-center text-[#164E3D]">
                  <Layers className="w-5 h-5 text-[#AD8921]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#164E3D]">
                    {editingSubpage.id ? 'Edit Page' : 'Create New Page'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure SEO meta, URL routing, and drag &amp; drop visual content blocks.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditingSubpage(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSaveSubpage} className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* 1. Page Metadata */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#AD8921]" />
                  <span>1. General Page Configuration</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Page Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSubpage.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const autoSlug = !editingSubpage.id
                          ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                          : editingSubpage.slug;
                        setEditingSubpage({ ...editingSubpage, title, slug: autoSlug });
                      }}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#164E3D]/20 focus:border-[#164E3D]"
                      placeholder="e.g. ISO/IEC 17025 Accreditation Dossier"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      URL Slug <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSubpage.slug}
                      onChange={(e) => setEditingSubpage({ ...editingSubpage, slug: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#164E3D]/20 focus:border-[#164E3D]"
                      placeholder="e.g. certifications-traceability"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Parent Section / Hierarchy
                    </label>
                    <select
                      value={editingSubpage.parentPage}
                      onChange={(e) =>
                        setEditingSubpage({ ...editingSubpage, parentPage: e.target.value as SubpageParent })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="services">Under Services &amp; Metrology (/services)</option>
                      <option value="about">Under About Us (/about)</option>
                      <option value="industries">Under Industries (/industries)</option>
                      <option value="none">No Parent (Standalone Page)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Badge / Category Tag
                    </label>
                    <input
                      type="text"
                      value={editingSubpage.badge}
                      onChange={(e) => setEditingSubpage({ ...editingSubpage, badge: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200"
                      placeholder="e.g. REGULATORY AUDIT DOSSIER"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Author / Specialist
                    </label>
                    <input
                      type="text"
                      value={editingSubpage.author || ''}
                      onChange={(e) => setEditingSubpage({ ...editingSubpage, author: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                      placeholder="e.g. Dr. (Mrs.) Folashade Adeleke"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subtitle / Executive Summary
                    </label>
                    <textarea
                      rows={2}
                      value={editingSubpage.subtitle}
                      onChange={(e) => setEditingSubpage({ ...editingSubpage, subtitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                      placeholder="Summary paragraph displayed in hero and link cards..."
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Hero Banner Image
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editingSubpage.heroImage || ''}
                        onChange={(e) => setEditingSubpage({ ...editingSubpage, heroImage: e.target.value })}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                        placeholder="Image URL or select preset below..."
                      />
                    </div>
                    {/* Quick Image Presets */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {DEFAULT_IMAGES.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditingSubpage({ ...editingSubpage, heroImage: img.url })}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            editingSubpage.heroImage === img.url
                              ? 'bg-[#164E3D] text-white border-[#164E3D]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={editingSubpage.published}
                        onChange={(e) =>
                          setEditingSubpage({ ...editingSubpage, published: e.target.checked })
                        }
                        className="rounded text-[#164E3D] focus:ring-[#164E3D]"
                      />
                      <span>Publish on live website</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={editingSubpage.showInNavigation}
                        onChange={(e) =>
                          setEditingSubpage({ ...editingSubpage, showInNavigation: e.target.checked })
                        }
                        className="rounded text-[#164E3D] focus:ring-[#164E3D]"
                      />
                      <span>Display link in Header / Footer menus</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Visual Content Blocks Manager with Drag & Drop */}
              <div className="space-y-4 pt-4 border-t border-[#E2ECE7]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#AD8921]" />
                      <span>2. Content Blocks ({editingSubpage.sections.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Drag &amp; drop cards using the grip handle to arrange section layout.
                    </span>
                  </div>

                  {/* Add Block Dropdown/Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddBlock('text')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Text Block</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('features')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Features Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('specs')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Specs Table</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('callout')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Callout Box</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('cta')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>CTA Banner</span>
                    </button>
                  </div>
                </div>

                {/* Blocks List */}
                <div className="space-y-4">
                  {editingSubpage.sections.map((block, idx) => {
                    const isBlockDragging = draggedBlockIndex === idx;
                    const isBlockTarget = dragOverBlockIndex === idx;

                    return (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={(e) => handleBlockDragStart(e, idx)}
                        onDragOver={(e) => handleBlockDragOver(e, idx)}
                        onDrop={(e) => handleBlockDrop(e, idx)}
                        onDragEnd={handleBlockDragEnd}
                        className={`rounded-2xl border transition-all p-5 space-y-4 relative group ${
                          isBlockDragging ? 'opacity-35 bg-slate-100 border-slate-300' : 'bg-[#FAFCFB]'
                        } ${
                          isBlockTarget
                            ? 'border-t-2 border-[#164E3D] bg-emerald-50/70 shadow-md'
                            : 'border-[#E2ECE7]'
                        }`}
                      >
                        {/* Block Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-grab active:cursor-grabbing transition-colors"
                              title="Drag to rearrange block position"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#164E3D] text-white font-bold uppercase">
                              {block.type}
                            </span>
                            <span className="text-xs font-bold text-slate-700">Block #{idx + 1}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveBlock(idx, 'up')}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === editingSubpage.sections.length - 1}
                              onClick={() => handleMoveBlock(idx, 'down')}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBlock(block.id)}
                              className="p-1 rounded hover:bg-rose-100 text-rose-600 cursor-pointer ml-2"
                              title="Delete Block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Block Specific Form Fields */}
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Block Title
                            </label>
                            <input
                              type="text"
                              value={block.title || ''}
                              onChange={(e) => {
                                const next = [...editingSubpage.sections];
                                next[idx].title = e.target.value;
                                setEditingSubpage({ ...editingSubpage, sections: next });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                              placeholder="Section Title"
                            />
                          </div>

                          {/* Text Block Content */}
                          {(block.type === 'text' || block.type === 'callout' || block.type === 'cta') && (
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Content / Paragraph Body
                              </label>
                              <textarea
                                rows={block.type === 'text' ? 4 : 2}
                                value={block.content || ''}
                                onChange={(e) => {
                                  const next = [...editingSubpage.sections];
                                  next[idx].content = e.target.value;
                                  setEditingSubpage({ ...editingSubpage, sections: next });
                                }}
                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                                placeholder="Enter content details..."
                              />
                            </div>
                          )}

                          {/* Callout Options */}
                          {block.type === 'callout' && (
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Callout Styling Theme
                              </label>
                              <select
                                value={block.calloutType || 'audit'}
                                onChange={(e) => {
                                  const next = [...editingSubpage.sections];
                                  next[idx].calloutType = e.target.value as any;
                                  setEditingSubpage({ ...editingSubpage, sections: next });
                                }}
                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                              >
                                <option value="audit">Emerald Authority (Audit Defense / Regulatory)</option>
                                <option value="warning">Amber Attention (Safety Notice / Recertification)</option>
                                <option value="info">Soft Sage (Technical Information)</option>
                              </select>
                            </div>
                          )}

                          {/* CTA Options */}
                          {block.type === 'cta' && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Button Text
                                </label>
                                <input
                                  type="text"
                                  value={block.ctaText || ''}
                                  onChange={(e) => {
                                    const next = [...editingSubpage.sections];
                                    next[idx].ctaText = e.target.value;
                                    setEditingSubpage({ ...editingSubpage, sections: next });
                                  }}
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                                  placeholder="e.g. Request Calibration Quote"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Destination Tab
                                </label>
                                <select
                                  value={block.ctaDestination || 'contact'}
                                  onChange={(e) => {
                                    const next = [...editingSubpage.sections];
                                    next[idx].ctaDestination = e.target.value as NavTab;
                                    setEditingSubpage({ ...editingSubpage, sections: next });
                                  }}
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                                >
                                  <option value="contact">Contact &amp; Field Support</option>
                                  <option value="rfq">RFQ Quotation Builder</option>
                                  <option value="products">Products Catalog</option>
                                  <option value="services">Services Overview</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Specs Matrix Editor */}
                          {block.type === 'specs' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-600">
                                  Parameters Matrix Rows
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...editingSubpage.sections];
                                    const currentSpecs = next[idx].specs || [];
                                    next[idx].specs = [
                                      ...currentSpecs,
                                      { label: 'New Metric', value: 'Tolerance / Value' },
                                    ];
                                    setEditingSubpage({ ...editingSubpage, sections: next });
                                  }}
                                  className="text-[11px] text-[#164E3D] font-bold hover:underline cursor-pointer"
                                >
                                  + Add Spec Row
                                </button>
                              </div>

                              <div className="space-y-1.5">
                                {block.specs?.map((spec, sIdx) => (
                                  <div key={sIdx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={spec.label}
                                      onChange={(e) => {
                                        const next = [...editingSubpage.sections];
                                        if (next[idx].specs) {
                                          next[idx].specs![sIdx].label = e.target.value;
                                          setEditingSubpage({ ...editingSubpage, sections: next });
                                        }
                                      }}
                                      placeholder="Label"
                                      className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-200 bg-white"
                                    />
                                    <input
                                      type="text"
                                      value={spec.value}
                                      onChange={(e) => {
                                        const next = [...editingSubpage.sections];
                                        if (next[idx].specs) {
                                          next[idx].specs![sIdx].value = e.target.value;
                                          setEditingSubpage({ ...editingSubpage, sections: next });
                                        }
                                      }}
                                      placeholder="Value"
                                      className="flex-1 px-2.5 py-1 text-xs font-mono rounded border border-slate-200 bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = [...editingSubpage.sections];
                                        if (next[idx].specs) {
                                          next[idx].specs = next[idx].specs!.filter((_, i) => i !== sIdx);
                                          setEditingSubpage({ ...editingSubpage, sections: next });
                                        }
                                      }}
                                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Features Grid Editor */}
                          {block.type === 'features' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-600">
                                  Feature Cards
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...editingSubpage.sections];
                                    const currentItems = next[idx].items || [];
                                    next[idx].items = [
                                      ...currentItems,
                                      {
                                        title: 'New Feature',
                                        desc: 'Feature description and technical verification details.',
                                        icon: 'ShieldCheck',
                                      },
                                    ];
                                    setEditingSubpage({ ...editingSubpage, sections: next });
                                  }}
                                  className="text-[11px] text-[#164E3D] font-bold hover:underline cursor-pointer"
                                >
                                  + Add Feature Card
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {block.items?.map((item, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => {
                                          const next = [...editingSubpage.sections];
                                          if (next[idx].items) {
                                            next[idx].items![fIdx].title = e.target.value;
                                            setEditingSubpage({ ...editingSubpage, sections: next });
                                          }
                                        }}
                                        className="font-bold text-xs text-[#164E3D] px-1.5 py-0.5 rounded border border-slate-200 w-3/4"
                                        placeholder="Title"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = [...editingSubpage.sections];
                                          if (next[idx].items) {
                                            next[idx].items = next[idx].items!.filter((_, i) => i !== fIdx);
                                            setEditingSubpage({ ...editingSubpage, sections: next });
                                          }
                                        }}
                                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <textarea
                                      rows={2}
                                      value={item.desc}
                                      onChange={(e) => {
                                        const next = [...editingSubpage.sections];
                                        if (next[idx].items) {
                                          next[idx].items![fIdx].desc = e.target.value;
                                          setEditingSubpage({ ...editingSubpage, sections: next });
                                        }
                                      }}
                                      className="w-full text-[11px] text-slate-600 px-1.5 py-1 rounded border border-slate-200"
                                      placeholder="Description"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="border-t border-[#E2ECE7] pt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditorOpen(false);
                    setEditingSubpage(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canEditContent}
                  className="btn-primary-gold py-2.5 px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Save &amp; Publish Page</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
