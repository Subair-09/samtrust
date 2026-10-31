import React, { useState, useMemo } from 'react';
import { useCms } from '../../context/CmsContext';
import { ProductItem } from '../../types';
import { ProductCategoryItem, BrandPartnerItem } from '../../types/cms';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Save,
  Check,
  Layers,
  Image as ImageIcon,
  Table as TableIcon,
  SlidersHorizontal,
  DollarSign,
  Tag,
  AlertCircle,
  FileText,
  UploadCloud,
  CheckCircle2,
  Star,
  Loader2,
  FolderOpen,
  Building2,
  Globe,
  Sliders,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
} from 'lucide-react';
import { processImageUpload, isSupportedImageFile } from '../../utils/imageUpload';

export const ProductCatalogManager: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    brandPartners,
    addBrandPartner,
    updateBrandPartner,
    deleteBrandPartner,
    brands,
    addBrand,
    mediaLibrary,
    addMediaAsset,
    canEditContent,
  } = useCms();

  // Sub-tabs: 'products' | 'categories' | 'brands'
  const [activeCatalogTab, setActiveCatalogTab] = useState<'products' | 'categories' | 'brands'>('products');

  // Products state & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState('');

  // Key-value spec row adder inside modal
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Media gallery & upload state inside modal
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'upload' | 'library'>('upload');
  const [uploadTarget, setUploadTarget] = useState<'gallery' | 'cover'>('gallery');

  // Categories CRUD state
  const [editingCategory, setEditingCategory] = useState<ProductCategoryItem | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Brand / OEM Partners CRUD state
  const [editingBrandPartner, setEditingBrandPartner] = useState<BrandPartnerItem | null>(null);
  const [isNewBrandPartner, setIsNewBrandPartner] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [selectedBrandTier, setSelectedBrandTier] = useState<string>('all');

  const availableImageAssets = [
    '/assets/aistudio/Gemini_Generated_Image_3r09g53r09g53r09_7495901f.jfif',
    '/assets/aistudio/Gemini_Generated_Image_iokaf4iokaf4ioka_4fcd315d.jfif',
    '/assets/aistudio/Gemini_Generated_Image_ndqgbpndqgbpndqg__1__500705da.jfif',
    '/assets/aistudio/Gemini_Generated_Image_b1rpztb1rpztb1rp__1__3c4a1bcb.jfif',
    '/assets/aistudio/Gemini_Generated_Image_na7erkna7erkna7e__1__7fe9a0db.jfif',
    '/assets/aistudio/Gemini_Generated_Image_kbf03ikbf03ikbf0_ce47ed91.jfif',
    '/assets/aistudio/Gemini_Generated_Image_kbf03ikbf03ikbf0__1__ce47ed91.jfif',
    '/assets/aistudio/Gemini_Generated_Image_cut3chcut3chcut3_efb56d2a.jfif',
    '/assets/aistudio/Gemini_Generated_Image_rfy426rfy426rfy4_c2132b8a.jfif',
    '/assets/aistudio/Gemini_Generated_Image_vuu9dcvuu9dcvuu9__1__035e4350.jfif',
    '/assets/aistudio/Gemini_Generated_Image_gy7sdvgy7sdvgy7s_3b972440.jfif',
    '/assets/aistudio/Gemini_Generated_Image_kmw0d5kmw0d5kmw0_76ed3384.jfif',
    '/assets/aistudio/Gemini_Generated_Image_we5znvwe5znvwe5z_c92d151f.jfif',
    '/assets/aistudio/lab_0a015732.jfif',
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesModel = prod.model.toLowerCase().includes(q);
        if (!matchesName && !matchesModel) return false;
      }
      if (selectedCategory !== 'all' && prod.category !== selectedCategory) return false;
      if (selectedBrand !== 'all' && prod.brand !== selectedBrand) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (!categorySearchQuery.trim()) return true;
      const q = categorySearchQuery.toLowerCase();
      return (
        cat.label.toLowerCase().includes(q) ||
        cat.id.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q))
      );
    });
  }, [categories, categorySearchQuery]);

  // Filtered Brand Partners
  const filteredBrandPartners = useMemo(() => {
    return brandPartners.filter((bp) => {
      if (brandSearchQuery.trim()) {
        const q = brandSearchQuery.toLowerCase();
        const matchesName = bp.name.toLowerCase().includes(q);
        const matchesCountry = bp.country.toLowerCase().includes(q);
        const matchesSpec = bp.specialty.toLowerCase().includes(q);
        if (!matchesName && !matchesCountry && !matchesSpec) return false;
      }
      if (selectedBrandTier !== 'all' && bp.tier !== selectedBrandTier) return false;
      return true;
    });
  }, [brandPartners, brandSearchQuery, selectedBrandTier]);

  // Handlers for Products
  const handleCreateNew = () => {
    const defaultCat = categories[0] || { id: 'flowmeters', label: 'Flow Measurement' };
    const blankProduct: ProductItem = {
      id: '',
      name: 'New Precision Instrument',
      category: defaultCat.id,
      categoryLabel: defaultCat.label,
      model: `ST-NEW-${Math.floor(100 + Math.random() * 900)}`,
      brand: brands[0] || 'Samstrust Metrology',
      image: availableImageAssets[0],
      galleryImages: [availableImageAssets[0], availableImageAssets[1]],
      basePriceUSD: 1500,
      accuracy: '±0.1% FS Standard',
      measurementRange: '0 - 100 Units',
      compliance: 'ISO/IEC 17025 / CE',
      description:
        'High-precision industrial measurement instrument engineered for severe operational conditions and statutory compliance.',
      keySpecs: [
        { label: 'Wetted Materials', value: '316L Stainless Steel' },
        { label: 'Output Signal', value: '4-20mA / HART 7.0' },
        { label: 'Enclosure Rating', value: 'IP67 Weatherproof' },
      ],
      inStock: true,
      leadTime: '3 - 5 business days',
      targetIndustries: ['food-bev', 'petrochem', 'pharma-biotech'],
    };
    setEditingProduct(blankProduct);
    setIsNewProduct(true);
  };

  const handleEdit = (prod: ProductItem) => {
    setEditingProduct({ ...prod });
    setIsNewProduct(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Find category label from dynamic categories list
    const cat = categories.find((c) => c.id === editingProduct.category);
    const updated = {
      ...editingProduct,
      categoryLabel: cat ? cat.label : editingProduct.categoryLabel,
    };

    if (isNewProduct) {
      addProduct(updated);
    } else {
      updateProduct(updated);
    }
    setEditingProduct(null);
  };

  const handleAddSpecRow = () => {
    if (newSpecLabel.trim() && newSpecValue.trim() && editingProduct) {
      setEditingProduct({
        ...editingProduct,
        keySpecs: [...editingProduct.keySpecs, { label: newSpecLabel.trim(), value: newSpecValue.trim() }],
      });
      setNewSpecLabel('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpecRow = (idx: number) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        keySpecs: editingProduct.keySpecs.filter((_, i) => i !== idx),
      });
    }
  };

  const handleAddGalleryImage = (url: string) => {
    if (editingProduct && !editingProduct.galleryImages.includes(url)) {
      setEditingProduct({
        ...editingProduct,
        galleryImages: [...editingProduct.galleryImages, url],
      });
    }
  };

  const handleRemoveGalleryImage = (url: string) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        galleryImages: editingProduct.galleryImages.filter((u) => u !== url),
      });
    }
  };

  const handleSetPrimaryCoverImage = (url: string) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        image: url,
        galleryImages: editingProduct.galleryImages.includes(url)
          ? editingProduct.galleryImages
          : [url, ...editingProduct.galleryImages],
      });
      setUploadSuccess('Cover image updated successfully.');
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!editingProduct) return;
    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);

    try {
      const fileList = Array.from(files);
      if (fileList.length === 0) return;

      let successCount = 0;
      let lastProcessedUrl = '';
      const newAngles: string[] = [];

      for (const file of fileList) {
        if (!isSupportedImageFile(file)) {
          throw new Error(
            `Unsupported format: "${file.name}". Please upload PNG, JPG, JPEG, or TIFF (.tif, .tiff) files.`
          );
        }

        const processed = await processImageUpload(file);

        // Add to shared CMS media library
        addMediaAsset({
          name: processed.name,
          url: processed.dataUrl,
          format: processed.format,
          size: processed.size,
          formattedSize: processed.formattedSize,
        });

        lastProcessedUrl = processed.dataUrl;
        newAngles.push(processed.dataUrl);
        successCount++;
      }

      setEditingProduct((prev) => {
        if (!prev) return prev;
        const updatedGallery = Array.from(new Set([...prev.galleryImages, ...newAngles]));
        return {
          ...prev,
          image: uploadTarget === 'cover' ? lastProcessedUrl : (prev.image || lastProcessedUrl),
          galleryImages: updatedGallery,
        };
      });

      setUploadSuccess(
        `Successfully uploaded and processed ${successCount} high-resolution image(s) (PNG/JPG/TIFF).`
      );
    } catch (err: any) {
      setUploadError(err.message || 'Image processing failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handlers for Category CRUD
  const handleCreateNewCategory = () => {
    setEditingCategory({
      id: '',
      label: '',
      description: '',
      icon: 'Tag',
    });
    setIsNewCategory(true);
  };

  const handleEditCategory = (cat: ProductCategoryItem) => {
    setEditingCategory({ ...cat });
    setIsNewCategory(false);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.label.trim()) return;

    let slug = editingCategory.id.trim();
    if (!slug) {
      slug = editingCategory.label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const payload: ProductCategoryItem = {
      ...editingCategory,
      id: slug,
      label: editingCategory.label.trim(),
      description: editingCategory.description?.trim() || '',
    };

    if (isNewCategory) {
      addCategory(payload);
    } else {
      updateCategory(payload);
    }
    setEditingCategory(null);
  };

  const handleDeleteCategory = (catId: string, catLabel: string) => {
    const assignedCount = products.filter((p) => p.category === catId).length;
    if (assignedCount > 0) {
      alert(
        `Cannot delete category "${catLabel}" (${catId}) because it currently contains ${assignedCount} active equipment SKU(s). Please reassign or update those products first.`
      );
      return;
    }
    if (confirm(`Are you sure you want to delete category "${catLabel}"? This action cannot be undone.`)) {
      deleteCategory(catId);
    }
  };

  // Handlers for Brand / OEM Partner CRUD
  const handleCreateNewBrandPartner = () => {
    setEditingBrandPartner({
      id: '',
      name: '',
      country: 'Germany',
      specialty: 'Process Instrumentation & Flow Control',
      tier: 'Authorized Distributor',
      website: 'https://',
      description: '',
    });
    setIsNewBrandPartner(true);
  };

  const handleEditBrandPartner = (bp: BrandPartnerItem) => {
    setEditingBrandPartner({ ...bp });
    setIsNewBrandPartner(false);
  };

  const handleSaveBrandPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrandPartner || !editingBrandPartner.name.trim()) return;

    let id = editingBrandPartner.id.trim();
    if (!id) {
      id = editingBrandPartner.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const payload: BrandPartnerItem = {
      ...editingBrandPartner,
      id,
      name: editingBrandPartner.name.trim(),
      country: editingBrandPartner.country?.trim() || 'Nigeria',
      specialty: editingBrandPartner.specialty?.trim() || 'Process Instrumentation',
      tier: editingBrandPartner.tier || 'Certified Technical Partner',
      website: editingBrandPartner.website?.trim() || '',
      description: editingBrandPartner.description?.trim() || '',
    };

    if (isNewBrandPartner) {
      addBrandPartner(payload);
    } else {
      updateBrandPartner(payload);
    }
    setEditingBrandPartner(null);
  };

  const handleDeleteBrandPartner = (partnerId: string, partnerName: string) => {
    const assignedCount = products.filter(
      (p) => p.brand.toLowerCase() === partnerName.toLowerCase()
    ).length;
    if (assignedCount > 0) {
      alert(
        `Cannot delete brand partner "${partnerName}" because it is currently assigned to ${assignedCount} active equipment SKU(s). Please reassign or update those products first.`
      );
      return;
    }
    if (
      confirm(`Are you sure you want to delete brand partner "${partnerName}"? This action cannot be undone.`)
    ) {
      deleteBrandPartner(partnerId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E2ECE7] pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-[#AD8921] uppercase tracking-wider block">
            Inventory &amp; Master Data
          </span>
          <h2 className="text-2xl font-bold text-[#164E3D]">Product Catalog &amp; Master Setup</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic management for Equipment SKUs, Product Categories, Brand / OEM Partners, specifications, and multi-angle photography.
          </p>
        </div>

        {canEditContent && (
          <div className="flex items-center gap-2">
            {activeCatalogTab === 'products' && (
              <button
                type="button"
                onClick={handleCreateNew}
                className="btn-primary py-2.5 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add New Equipment SKU</span>
              </button>
            )}

            {activeCatalogTab === 'categories' && (
              <button
                type="button"
                onClick={handleCreateNewCategory}
                className="btn-primary py-2.5 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add Product Category</span>
              </button>
            )}

            {activeCatalogTab === 'brands' && (
              <button
                type="button"
                onClick={handleCreateNewBrandPartner}
                className="btn-primary py-2.5 px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add Brand / OEM Partner</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Primary Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E2ECE7] pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCatalogTab('products')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            activeCatalogTab === 'products'
              ? 'bg-[#164E3D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-[#EBF3F0] border border-[#E2ECE7]'
          }`}
        >
          <Package className="w-4 h-4 text-[#D4AF37]" />
          <span>Equipment Catalog &amp; SKUs ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCatalogTab('categories')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            activeCatalogTab === 'categories'
              ? 'bg-[#164E3D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-[#EBF3F0] border border-[#E2ECE7]'
          }`}
        >
          <Tag className="w-4 h-4 text-[#D4AF37]" />
          <span>Product Categories Setup ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCatalogTab('brands')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            activeCatalogTab === 'brands'
              ? 'bg-[#164E3D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-[#EBF3F0] border border-[#E2ECE7]'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#D4AF37]" />
          <span>Brand / OEM Partners Setup ({brandPartners.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: EQUIPMENT SKUS & PRODUCTS
         ========================================================================= */}
      {activeCatalogTab === 'products' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by model or equipment name..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2ECE7] bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E2ECE7] bg-white text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E2ECE7] bg-white text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Brands ({brands.length})</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <span className="text-xs text-slate-500 whitespace-nowrap">
                Showing <strong>{filteredProducts.length}</strong> SKUs
              </span>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF9] text-[#164E3D] border-b border-[#E2ECE7] font-bold uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Model &amp; Image</th>
                    <th className="py-3.5 px-4">Equipment Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Brand / OEM</th>
                    <th className="py-3.5 px-4 text-right">Base USD</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2ECE7]">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-lg object-cover border border-[#E2ECE7] bg-white shrink-0"
                          />
                          <span className="font-mono font-bold text-[#AD8921]">{prod.model}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <strong className="text-slate-800 line-clamp-1">{prod.name}</strong>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          Accuracy: {prod.accuracy}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {prod.categoryLabel}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {prod.brand}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${new Intl.NumberFormat('en-US').format(prod.basePriceUSD)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            prod.inStock
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {prod.inStock ? 'In Stock' : 'Order-to-Spec'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {canEditContent && (
                            <button
                              type="button"
                              onClick={() => handleEdit(prod)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#164E3D] hover:bg-[#EBF3F0] transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canEditContent && products.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteProduct(prod.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* =========================================================================
          TAB 2: PRODUCT CATEGORIES SETUP
         ========================================================================= */}
      {activeCatalogTab === 'categories' && (
        <div className="space-y-6">
          {/* Categories Search & Metrics */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Search category name, slug, or scope..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2ECE7] bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Total Defined Categories: <strong className="text-[#164E3D] font-mono">{categories.length}</strong>
              </span>
              {canEditContent && (
                <button
                  type="button"
                  onClick={handleCreateNewCategory}
                  className="btn-primary py-2 px-3 text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>New Category</span>
                </button>
              )}
            </div>
          </div>

          {/* Categories Table / Card Grid */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF9] text-[#164E3D] border-b border-[#E2ECE7] font-bold uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Category Slug / ID</th>
                    <th className="py-3.5 px-4">Display Name</th>
                    <th className="py-3.5 px-4">Technical Scope &amp; Description</th>
                    <th className="py-3.5 px-4 text-center">Active SKUs</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2ECE7]">
                  {filteredCategories.map((cat) => {
                    const skusCount = products.filter((p) => p.category === cat.id).length;
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#AD8921]">
                          <span className="px-2.5 py-1 rounded-md bg-[#FAFBFB] border border-[#E2ECE7]">
                            {cat.id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-slate-800 text-sm flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-[#164E3D]" />
                            <span>{cat.label}</span>
                          </strong>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-md">
                          <span className="line-clamp-2">
                            {cat.description || 'General instrumentation category.'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                              skusCount > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {skusCount} SKU{skusCount !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {canEditContent && (
                              <button
                                type="button"
                                onClick={() => handleEditCategory(cat)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-[#164E3D] hover:bg-[#EBF3F0] transition-colors cursor-pointer"
                                title="Edit category"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canEditContent && categories.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id, cat.label)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete category"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BRAND / OEM PARTNERS SETUP
         ========================================================================= */}
      {activeCatalogTab === 'brands' && (
        <div className="space-y-6">
          {/* Brand Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={brandSearchQuery}
                onChange={(e) => setBrandSearchQuery(e.target.value)}
                placeholder="Search brand name, country, specialty..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2ECE7] bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-[#164E3D] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={selectedBrandTier}
                onChange={(e) => setSelectedBrandTier(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E2ECE7] bg-white text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Partnership Tiers</option>
                <option value="Principal OEM">Principal OEM</option>
                <option value="Authorized Distributor">Authorized Distributor</option>
                <option value="Certified Technical Partner">Certified Technical Partner</option>
              </select>

              {canEditContent && (
                <button
                  type="button"
                  onClick={handleCreateNewBrandPartner}
                  className="btn-primary py-2 px-3 text-xs inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>New Brand / OEM</span>
                </button>
              )}
            </div>
          </div>

          {/* Brand Partners Cards / Table */}
          <div className="bg-white rounded-2xl border border-[#E2ECE7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF9] text-[#164E3D] border-b border-[#E2ECE7] font-bold uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Brand / OEM Name</th>
                    <th className="py-3.5 px-4">Partnership Tier</th>
                    <th className="py-3.5 px-4">Country of Origin</th>
                    <th className="py-3.5 px-4">Core Specialty</th>
                    <th className="py-3.5 px-4">Official Website</th>
                    <th className="py-3.5 px-4 text-center">Catalog SKUs</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2ECE7]">
                  {filteredBrandPartners.map((bp) => {
                    const skusCount = products.filter(
                      (p) => p.brand.toLowerCase() === bp.name.toLowerCase()
                    ).length;

                    let tierBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (bp.tier === 'Principal OEM') {
                      tierBadge = 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
                    } else if (bp.tier === 'Authorized Distributor') {
                      tierBadge = 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
                    } else if (bp.tier === 'Certified Technical Partner') {
                      tierBadge = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
                    }

                    return (
                      <tr key={bp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#164E3D]" />
                            <span>{bp.name}</span>
                          </strong>
                          {bp.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{bp.description}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${tierBadge}`}
                          >
                            {bp.tier}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <span>{bp.country}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="line-clamp-1">{bp.specialty}</span>
                        </td>
                        <td className="py-3 px-4">
                          {bp.website ? (
                            <a
                              href={bp.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-[#164E3D] hover:underline inline-flex items-center gap-1"
                            >
                              <span>{bp.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Not listed</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                              skusCount > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {skusCount} SKU{skusCount !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {canEditContent && (
                              <button
                                type="button"
                                onClick={() => handleEditBrandPartner(bp)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-[#164E3D] hover:bg-[#EBF3F0] transition-colors cursor-pointer"
                                title="Edit brand partner"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canEditContent && brandPartners.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteBrandPartner(bp.id, bp.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete brand partner"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: PRODUCT SKU EDIT / CREATE MODAL
         ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E2ECE7] overflow-hidden my-8">
            <div className="p-5 border-b border-[#E2ECE7] bg-[#164E3D] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider block">
                  Product &amp; Inventory CRUD
                </span>
                <h3 className="text-base font-bold">
                  {isNewProduct ? 'Create New Equipment SKU' : `Edit: ${editingProduct.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Row 1: Model, Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Model Number / SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.model}
                    onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-900 font-mono font-bold focus:outline-none focus:border-[#164E3D]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Product Full Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>
              </div>

              {/* Row 2: Category, Brand, Base USD */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Category *</label>
                    <button
                      type="button"
                      onClick={() => {
                        handleCreateNewCategory();
                      }}
                      className="text-[10px] text-[#164E3D] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#AD8921]" />
                      <span>+ New Category</span>
                    </button>
                  </div>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Brand / OEM Partner *</label>
                    <button
                      type="button"
                      onClick={() => {
                        handleCreateNewBrandPartner();
                      }}
                      className="text-[10px] text-[#164E3D] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#AD8921]" />
                      <span>+ New Brand</span>
                    </button>
                  </div>
                  <select
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Base Price (USD Guide) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingProduct.basePriceUSD}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        basePriceUSD: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-900 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Accuracy, Range, Lead Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accuracy Rating</label>
                  <input
                    type="text"
                    value={editingProduct.accuracy}
                    onChange={(e) => setEditingProduct({ ...editingProduct, accuracy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Measurement Range</label>
                  <input
                    type="text"
                    value={editingProduct.measurementRange}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, measurementRange: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Time</label>
                  <input
                    type="text"
                    value={editingProduct.leadTime}
                    onChange={(e) => setEditingProduct({ ...editingProduct, leadTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technical Overview &amp; Process Scope
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none resize-none"
                />
              </div>

              {/* STRUCTURED SPECIFICATIONS TABLE EDITOR */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-1.5">
                    <TableIcon className="w-4 h-4 text-[#AD8921]" />
                    <span>Structured Technical Specifications (Key-Value Attributes)</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {editingProduct.keySpecs.length} Attributes Defined
                  </span>
                </div>

                {/* Existing Specs */}
                <div className="divide-y divide-[#E2ECE7] border border-[#E2ECE7] rounded-xl bg-white overflow-hidden">
                  {editingProduct.keySpecs.map((spec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <span className="font-bold text-slate-800">{spec.label}</span>
                        <span className="text-slate-600 font-mono">{spec.value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete specification attribute"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Spec Adder Row */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newSpecLabel}
                    onChange={(e) => setNewSpecLabel(e.target.value)}
                    placeholder="Attribute Label (e.g., Flange Rating)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E2ECE7] text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="Value (e.g., ANSI Class 300)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E2ECE7] text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="px-3 py-1.5 rounded-lg bg-[#164E3D] text-white font-bold text-xs hover:bg-[#123e31] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* MEDIA MANAGER & MULTI-ANGLE PHOTOGRAPHY */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E2ECE7] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2ECE7] pb-3">
                  <div>
                    <span className="font-bold text-[#164E3D] uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#AD8921]" />
                      <span>Media Manager &amp; Multi-Angle Photography</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supports high-resolution PNG, JPG, JPEG, and TIFF (.tif, .tiff) formats.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono text-slate-500">
                      {editingProduct.galleryImages.length} Image Angle(s)
                    </span>
                  </div>
                </div>

                {/* Gallery Images Preview Strip */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Current Multi-Angle Photo Roll:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {editingProduct.galleryImages.map((imgUrl, idx) => {
                      const isCover = editingProduct.image === imgUrl;
                      return (
                        <div
                          key={idx}
                          className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                            isCover ? 'border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/30' : 'border-[#E2ECE7]'
                          }`}
                        >
                          <img src={imgUrl} alt={`Angle ${idx + 1}`} className="w-full h-20 object-cover bg-white" />
                          {isCover && (
                            <span className="absolute top-1 left-1 bg-[#AD8921] text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xs font-bold flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>Cover</span>
                            </span>
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryCoverImage(imgUrl)}
                                className="p-1 rounded bg-[#164E3D] text-[#D4AF37] hover:bg-emerald-900 cursor-pointer"
                                title="Make Primary Cover Image"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(imgUrl)}
                              className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                              title="Delete from Gallery"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-tabs inside Media: Upload vs Shared Library */}
                <div className="pt-2 border-t border-[#E2ECE7]">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('upload')}
                      className={`text-xs font-bold pb-1 border-b-2 cursor-pointer ${
                        activeMediaTab === 'upload'
                          ? 'border-[#164E3D] text-[#164E3D]'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Upload New Images (PNG, JPG, TIFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('library')}
                      className={`text-xs font-bold pb-1 border-b-2 cursor-pointer ${
                        activeMediaTab === 'library'
                          ? 'border-[#164E3D] text-[#164E3D]'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Media Library ({mediaLibrary.length + availableImageAssets.length})
                    </button>
                  </div>

                  {/* Upload Dropzone */}
                  {activeMediaTab === 'upload' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-xs">
                        <label className="font-semibold text-slate-700">Set upload as:</label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="uploadTarget"
                            checked={uploadTarget === 'gallery'}
                            onChange={() => setUploadTarget('gallery')}
                            className="text-[#164E3D]"
                          />
                          <span>Add to Multi-Angle Gallery</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="uploadTarget"
                            checked={uploadTarget === 'cover'}
                            onChange={() => setUploadTarget('cover')}
                            className="text-[#164E3D]"
                          />
                          <span>Set Directly as Primary Cover</span>
                        </label>
                      </div>

                      <div className="relative border-2 border-dashed border-[#E2ECE7] hover:border-[#164E3D] bg-white rounded-xl p-5 text-center transition-colors">
                        <input
                          type="file"
                          multiple
                          accept=".png,.jpg,.jpeg,.tiff,.tif,image/png,image/jpeg,image/tiff"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                          disabled={isUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                          <div className="w-10 h-10 rounded-xl bg-[#EBF3F0] text-[#164E3D] flex items-center justify-center">
                            {isUploading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <UploadCloud className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">
                              Click or Drag &amp; Drop Multi-Angle Product Photos
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Accepts PNG, JPG, JPEG, TIFF (.tif, .tiff) up to 25MB each
                            </span>
                          </div>
                        </div>
                      </div>

                      {uploadError && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      {uploadSuccess && (
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{uploadSuccess}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Library Grid */}
                  {activeMediaTab === 'library' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-1 border border-[#E2ECE7] rounded-xl bg-white">
                        {mediaLibrary.map((item) => {
                          const isAlreadyInGallery = editingProduct.galleryImages.includes(item.url);
                          const isPrimary = editingProduct.image === item.url;
                          return (
                            <div
                              key={item.id}
                              className="group relative rounded-lg border border-[#E2ECE7] overflow-hidden bg-slate-50 p-1 flex flex-col justify-between"
                            >
                              <img src={item.url} alt={item.name} className="w-full h-16 object-cover rounded" />
                              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1">
                                <span className="uppercase">{item.format}</span>
                                <span>{item.formattedSize}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryCoverImage(item.url)}
                                  className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                    isPrimary
                                      ? 'bg-[#AD8921] text-white'
                                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                  title="Set as primary cover"
                                >
                                  {isPrimary ? 'Cover ★' : 'Set Cover'}
                                </button>
                                <button
                                  type="button"
                                  disabled={isAlreadyInGallery}
                                  onClick={() => handleAddGalleryImage(item.url)}
                                  className="flex-1 py-1 rounded text-[10px] font-bold bg-[#EBF3F0] text-[#164E3D] hover:bg-emerald-100 disabled:opacity-40 cursor-pointer"
                                  title="Add to gallery angles"
                                >
                                  {isAlreadyInGallery ? 'In Gallery' : '+ Add Angle'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E2ECE7]">
                <label className="flex items-center gap-2 text-xs font-bold text-[#164E3D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="rounded border-slate-300 text-[#164E3D]"
                  />
                  <span>Mark as In-Stock / Immediate Dispatch</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2 px-6 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Equipment SKU</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: PRODUCT CATEGORY CREATE / EDIT MODAL
         ========================================================================= */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E2ECE7] overflow-hidden">
            <div className="p-5 border-b border-[#E2ECE7] bg-[#164E3D] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider block">
                  Category Setup
                </span>
                <h3 className="text-base font-bold">
                  {isNewCategory ? 'Create New Product Category' : `Edit Category: ${editingCategory.label}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Display Label *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.label}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoSlug = val
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '');
                    setEditingCategory({
                      ...editingCategory,
                      label: val,
                      id: isNewCategory ? autoSlug : editingCategory.id,
                    });
                  }}
                  placeholder="e.g. Ultrasonic Flowmeters &amp; Gas Analyzers"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none focus:border-[#164E3D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Slug / Identifier (URL &amp; Database Key) *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.id}
                  disabled={!isNewCategory}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''),
                    })
                  }
                  placeholder="e.g. ultrasonic-flowmeters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] bg-slate-50 font-mono text-slate-900 focus:outline-none focus:border-[#164E3D] disabled:opacity-60"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Unique internal key used in SKU relationships and routing.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technical Scope &amp; Engineering Description
                </label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Summarize application fields, measurement physics, standard sensor outputs, and industry compliance for this category..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2ECE7]">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-6 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: BRAND / OEM PARTNER CREATE / EDIT MODAL
         ========================================================================= */}
      {editingBrandPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E2ECE7] overflow-hidden">
            <div className="p-5 border-b border-[#E2ECE7] bg-[#164E3D] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider block">
                  Brand &amp; OEM Setup
                </span>
                <h3 className="text-base font-bold">
                  {isNewBrandPartner
                    ? 'Register New Brand / OEM Partner'
                    : `Edit Brand: ${editingBrandPartner.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBrandPartner(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrandPartner} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Brand / OEM Manufacturer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBrandPartner.name}
                    onChange={(e) =>
                      setEditingBrandPartner({
                        ...editingBrandPartner,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Endress+Hauser / WIKA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none focus:border-[#164E3D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Partnership Tier *
                  </label>
                  <select
                    value={editingBrandPartner.tier}
                    onChange={(e) =>
                      setEditingBrandPartner({
                        ...editingBrandPartner,
                        tier: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none"
                  >
                    <option value="Principal OEM">Principal OEM</option>
                    <option value="Authorized Distributor">Authorized Distributor</option>
                    <option value="Certified Technical Partner">Certified Technical Partner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Country of Origin / Global HQ *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBrandPartner.country}
                    onChange={(e) =>
                      setEditingBrandPartner({
                        ...editingBrandPartner,
                        country: e.target.value,
                      })
                    }
                    placeholder="e.g. Germany, Switzerland, United States"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official OEM Website URL
                  </label>
                  <input
                    type="url"
                    value={editingBrandPartner.website || ''}
                    onChange={(e) =>
                      setEditingBrandPartner({
                        ...editingBrandPartner,
                        website: e.target.value,
                      })
                    }
                    placeholder="https://www.endress.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Core Metrology &amp; Equipment Specialty *
                </label>
                <input
                  type="text"
                  required
                  value={editingBrandPartner.specialty}
                  onChange={(e) =>
                    setEditingBrandPartner({
                      ...editingBrandPartner,
                      specialty: e.target.value,
                    })
                  }
                  placeholder="e.g. Coriolis Mass Flowmeters, Hydrostatic Level &amp; Pressure"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Manufacturer Overview &amp; Representation Scope
                </label>
                <textarea
                  rows={3}
                  value={editingBrandPartner.description || ''}
                  onChange={(e) =>
                    setEditingBrandPartner({
                      ...editingBrandPartner,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe OEM authorization terms, factory warranty backing, spare parts stock in Nigeria, and technical certifications..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECE7] text-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2ECE7]">
                <button
                  type="button"
                  onClick={() => setEditingBrandPartner(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-6 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Brand Partner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
