import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { HeroSlide } from '../../types/cms';
import {
  SlidersHorizontal,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  X,
  Save,
  Check,
  UploadCloud,
  Loader2,
  FolderOpen,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { processImageUpload, isSupportedImageFile } from '../../utils/imageUpload';

export const HeroSliderManager: React.FC = () => {
  const {
    heroSlides,
    addSlide,
    updateSlide,
    deleteSlide,
    moveSlideOrder,
    mediaLibrary,
    addMediaAsset,
    canEditContent,
  } = useCms();
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isNewSlide, setIsNewSlide] = useState(false);
  const [previewSlide, setPreviewSlide] = useState<HeroSlide | null>(heroSlides[0] || null);

  // Image tab and upload state
  const [imageSourceTab, setImageSourceTab] = useState<'presets' | 'upload' | 'library'>('presets');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Available image presets for easy picking
  const imagePresets = [
    { label: 'Analytical Balance (0.1mg)', url: '/assets/aistudio/Gemini_Generated_Image_ndqgbpndqgbpndqg__1__500705da.jfif' },
    { label: 'Industrial Flowmeter Inline', url: '/assets/aistudio/Gemini_Generated_Image_3r09g53r09g53r09_7495901f.jfif' },
    { label: 'High-Tech Testing Laboratory', url: '/assets/aistudio/lab_0a015732.jfif' },
    { label: 'Pressure Transmitter', url: '/assets/aistudio/Gemini_Generated_Image_iokaf4iokaf4ioka_4fcd315d.jfif' },
    { label: 'VAV Fume Cupboard', url: '/assets/aistudio/Gemini_Generated_Image_kbf03ikbf03ikbf0_ce47ed91.jfif' },
    { label: 'Checkweigher Inspection', url: '/assets/aistudio/Gemini_Generated_Image_gy7sdvgy7sdvgy7s_3b972440.jfif' },
    { label: 'Reagents & Glassware', url: '/assets/aistudio/Gemini_Generated_Image_vuu9dcvuu9dcvuu9__1__035e4350.jfif' },
  ];

  const handleCreateNew = () => {
    const blankSlide: HeroSlide = {
      id: '',
      order: heroSlides.length + 1,
      active: true,
      tag: 'NEW METROLOGY SOLUTION',
      title: 'Precision Automation & Skid Control',
      subtext: 'Engineered for continuous reliability across high-pressure petrochemical, food, and pharmaceutical applications.',
      ctaText: 'Explore Solutions',
      destinationTab: 'products',
      image: imagePresets[0].url,
      statLabel: 'Accuracy',
      statValue: 'Class 0.05% FS',
      specBadge: 'ISO 17025 Certified',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    };
    setEditingSlide(blankSlide);
    setIsNewSlide(true);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide({ ...slide });
    setIsNewSlide(false);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (isNewSlide) {
      addSlide(editingSlide);
    } else {
      updateSlide(editingSlide);
    }
    setEditingSlide(null);
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!editingSlide) return;
    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);

    try {
      const fileList = Array.from(files);
      if (fileList.length === 0) return;

      const file = fileList[0];
      if (!isSupportedImageFile(file)) {
        throw new Error(
          `Unsupported file format: "${file.name}". Please upload a PNG, JPG, JPEG, or TIFF (.tif, .tiff) image.`
        );
      }

      const processed = await processImageUpload(file);

      // Save to shared media library
      addMediaAsset({
        name: processed.name,
        url: processed.dataUrl,
        format: processed.format,
        size: processed.size,
        formattedSize: processed.formattedSize,
      });

      // Assign to current slide image
      setEditingSlide((prev) => (prev ? { ...prev, image: processed.dataUrl } : prev));
      setUploadSuccess(
        `Successfully uploaded and converted "${file.name}" (${processed.format}, ${processed.formattedSize}).`
      );
    } catch (err: any) {
      console.error('Slide image upload error:', err);
      setUploadError(err?.message || 'Failed to process and convert uploaded image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2ECE7] pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
            Content Administration
          </span>
          <h2 className="text-2xl font-bold text-[#164E3D]">Homepage Hero Slider Manager</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage active slides, arrange carousel priority, schedule publication windows, and preview hero impact.
          </p>
        </div>

        {canEditContent && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="btn-primary py-2.5 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Create New Hero Slide</span>
          </button>
        )}
      </div>

      {/* 1. SLIDES TABLE & REORDERING */}
      <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2ECE7] bg-[#F8FAF9] flex items-center justify-between">
          <span className="text-xs font-bold text-[#164E3D] uppercase tracking-wider">
            Active Slide Priority Queue ({heroSlides.length} Slides)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Auto-advances every 4.0s (enhanced speed) with pause-on-hover
          </span>
        </div>

        <div className="divide-y divide-[#E2ECE7]">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#FAFBFB] transition-colors"
            >
              {/* Order & Image & Info */}
              <div className="flex items-center gap-4">
                {/* Reorder Buttons */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0 || !canEditContent}
                    onClick={() => moveSlideOrder(slide.id, 'up')}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors cursor-pointer"
                    title="Move slide up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-[#164E3D]">0{idx + 1}</span>
                  <button
                    type="button"
                    disabled={idx === heroSlides.length - 1 || !canEditContent}
                    onClick={() => moveSlideOrder(slide.id, 'down')}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors cursor-pointer"
                    title="Move slide down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumbnail */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-16 h-14 rounded-xl object-cover border border-[#E2ECE7] shrink-0 bg-slate-50"
                />

                {/* Details */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#AD8921] font-bold">
                    <span>{slide.tag}</span>
                    <span>&bull;</span>
                    <span className={slide.active ? 'text-emerald-700' : 'text-slate-400'}>
                      {slide.active ? 'Active & Published' : 'Draft / Paused'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#164E3D] line-clamp-1">{slide.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{slide.subtext}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => setPreviewSlide(slide)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2ECE7] hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#164E3D]" />
                  <span>Preview</span>
                </button>

                {canEditContent && (
                  <button
                    type="button"
                    onClick={() => handleEdit(slide)}
                    className="px-3 py-1.5 rounded-lg bg-[#EBF3F0] hover:bg-emerald-100 text-[#164E3D] text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}

                {canEditContent && heroSlides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteSlide(slide.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. LIVE HERO SLIDE PREVIEW STAGE */}
      {previewSlide && (
        <div className="rounded-2xl border border-[#E2ECE7] bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Live Visual Slide Preview: {previewSlide.title}</span>
            </div>
            <span className="text-xs font-mono text-slate-500">Scale: 1:1 Public Match</span>
          </div>

          {/* Render Miniature Slide */}
          <div className="rounded-2xl bg-gradient-to-b from-white via-[#F4F8F6] to-[#EBF3F0] border border-[#E2ECE7] p-6 sm:p-8 overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#AD8921] block">
                  {previewSlide.tag}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#164E3D] tracking-tight">
                  {previewSlide.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl">
                  {previewSlide.subtext}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5 shadow-xs">
                    <span>{previewSlide.ctaText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Rating: <strong className="text-[#164E3D]">{previewSlide.statValue}</strong>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="aspect-4/3 rounded-xl overflow-hidden border border-[#E2ECE7] shadow-md bg-white">
                  <img
                    src={previewSlide.image}
                    alt={previewSlide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SLIDE EDIT MODAL */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E2ECE7] overflow-hidden my-8">
            <div className="p-5 border-b border-[#E2ECE7] bg-[#164E3D] text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {isNewSlide ? 'Create New Hero Slide' : `Edit Hero Slide: ${editingSlide.title}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tag / Category Kicker *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.tag}
                    onChange={(e) => setEditingSlide({ ...editingSlide, tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Tab / Route *
                  </label>
                  <select
                    value={editingSlide.destinationTab}
                    onChange={(e) => setEditingSlide({ ...editingSlide, destinationTab: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                  >
                    <option value="products">Products Catalog</option>
                    <option value="services">Technical Services</option>
                    <option value="industries">Industries We Serve</option>
                    <option value="rfq">RFQ Quotation Engine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slide Headline (H1) *
                </label>
                <input
                  type="text"
                  required
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub-Headline / Core Proposition *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingSlide.subtext}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtext: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CTA Button Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.ctaText}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Stat Label
                  </label>
                  <input
                    type="text"
                    value={editingSlide.statLabel}
                    onChange={(e) => setEditingSlide({ ...editingSlide, statLabel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Stat Value
                  </label>
                  <input
                    type="text"
                    value={editingSlide.statValue}
                    onChange={(e) => setEditingSlide({ ...editingSlide, statValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>
              </div>

              {/* Image Asset Manager & Multi-Format Uploader */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2ECE7] pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#164E3D]">
                    <ImageIcon className="w-4 h-4 text-[#AD8921]" />
                    <span>Hero Visual Image Asset</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white border border-slate-200 text-slate-700">
                      PNG
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white border border-slate-200 text-slate-700">
                      JPG
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 border border-amber-300 text-[#AD8921]">
                      TIFF
                    </span>
                  </div>
                </div>

                {/* Current Active Preview */}
                <div className="p-2.5 rounded-xl bg-white border border-[#E2ECE7] flex items-center gap-3">
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                    <img
                      src={editingSlide.image}
                      alt="Active Slide Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#AD8921]">
                      Active Slide Visual
                    </span>
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {editingSlide.image.startsWith('data:')
                        ? 'Custom Uploaded Image (PNG/JPG/TIFF)'
                        : editingSlide.image.split('/').pop()}
                    </p>
                  </div>
                </div>

                {/* Source Selection Tabs */}
                <div className="flex items-center gap-1.5 border-b border-[#E2ECE7] pb-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageSourceTab('upload')}
                    className={`px-3 py-1 rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                      imageSourceTab === 'upload'
                        ? 'bg-[#164E3D] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-[#E2ECE7] hover:bg-slate-50'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageSourceTab('library')}
                    className={`px-3 py-1 rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                      imageSourceTab === 'library'
                        ? 'bg-[#164E3D] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-[#E2ECE7] hover:bg-slate-50'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Media Library ({mediaLibrary.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageSourceTab('presets')}
                    className={`px-3 py-1 rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                      imageSourceTab === 'presets'
                        ? 'bg-[#164E3D] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-[#E2ECE7] hover:bg-slate-50'
                    }`}
                  >
                    <span>Built-in Presets ({imagePresets.length})</span>
                  </button>
                </div>

                {/* TAB 1: UPLOAD (PNG, JPG, JPEG, TIFF) */}
                {imageSourceTab === 'upload' && (
                  <div className="space-y-2">
                    <label
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleFileUpload(e.dataTransfer.files);
                        }
                      }}
                      className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                        isUploading
                          ? 'bg-emerald-50/50 border-emerald-400'
                          : 'border-[#CADBD2] hover:border-[#164E3D] bg-white hover:bg-[#F8FAF9]'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.tiff,.tif,image/png,image/jpeg,image/tiff"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileUpload(e.target.files);
                          }
                        }}
                        className="hidden"
                        disabled={isUploading}
                      />

                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
                          <Loader2 className="w-6 h-6 text-[#164E3D] animate-spin" />
                          <p className="text-xs font-bold text-[#164E3D]">
                            Converting image &amp; decoding TIFF layers...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
                          <UploadCloud className="w-6 h-6 text-[#164E3D]" />
                          <p className="text-xs font-bold text-[#164E3D]">
                            Click or drag &amp; drop slide image
                          </p>
                          <span className="text-[10px] text-slate-500">
                            Formats: <strong>PNG, JPG, JPEG, TIFF (.tif, .tiff)</strong>
                          </span>
                        </div>
                      )}
                    </label>

                    {uploadSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{uploadSuccess}</span>
                      </div>
                    )}
                    {uploadError && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: SHARED MEDIA LIBRARY */}
                {imageSourceTab === 'library' && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {mediaLibrary.map((item) => {
                      const isSelected = editingSlide.image === item.url;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setEditingSlide({ ...editingSlide, image: item.url })}
                          className={`p-1.5 rounded-xl border-2 overflow-hidden text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#164E3D] bg-emerald-50/40 shadow-sm'
                              : 'border-[#E2ECE7] bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-900 mb-1">
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-800 truncate block">
                            {item.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 block">
                            {item.format} &bull; {item.formattedSize}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* TAB 3: SYSTEM PRESETS */}
                {imageSourceTab === 'presets' && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {imagePresets.map((img, idx) => {
                      const isSelected = editingSlide.image === img.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditingSlide({ ...editingSlide, image: img.url })}
                          className={`p-1.5 rounded-xl border-2 overflow-hidden transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'border-[#164E3D] bg-emerald-50/40 shadow-sm'
                              : 'border-[#E2ECE7] opacity-70 hover:opacity-100 bg-white'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.label}
                            className="w-full h-12 object-cover rounded-lg"
                          />
                          <span className="text-[10px] font-bold text-slate-700 truncate block mt-1">
                            {img.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Start/End scheduling & Active toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#E2ECE7]">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Schedule Start Date
                  </label>
                  <input
                    type="date"
                    value={editingSlide.startDate || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Schedule End Date
                  </label>
                  <input
                    type="date"
                    value={editingSlide.endDate || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#164E3D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSlide.active}
                      onChange={(e) => setEditingSlide({ ...editingSlide, active: e.target.checked })}
                      className="rounded border-slate-300 text-[#164E3D]"
                    />
                    <span>Active on Public Site</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2ECE7]">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-6 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Slide Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
