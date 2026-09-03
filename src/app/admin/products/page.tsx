'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  X,
  Eye,
  EyeOff,
  Star,
  Clock,
  AlertCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { ProductData, CollectionData } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import ImageUploader from '@/components/admin/ImageUploader';

const FRAGRANCE_FAMILIES = [
  'Woody Oriental',
  'Warm Amber',
  'Dark Floral',
  'Woody Creamy',
  'Leather & Tobacco',
  'Powdery Woody',
  'Earthy Fresh',
  'Luminous Floral',
  'Citrus Aromatic',
  'Gourmand Balsamic',
];

const CURRENCIES = ['USD', 'EUR', 'GBP'];

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCollection, setFilterCollection] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  // Delete Confirmation Modal State
  const [deleteModalProduct, setDeleteModalProduct] = useState<{
    id: string;
    name: string;
    sku: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State (All required fields)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    shortDescription: '',
    description: '',
    productStory: '',
    price: '',
    salePrice: '',
    currency: 'USD',
    size: '100 ml / 3.4 FL. OZ.',
    stockQuantity: '15',
    collectionId: '',
    olfactoryFamily: 'Woody Oriental',
    topNotes: [] as string[],
    heartNotes: [] as string[],
    baseNotes: [] as string[],
    featured: false,
    newArrival: false,
    published: true,
    images: [] as string[],
  });

  // Note Tag Inputs
  const [newTopNote, setNewTopNote] = useState('');
  const [newHeartNote, setNewHeartNote] = useState('');
  const [newBaseNote, setNewBaseNote] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products?includeDrafts=true'),
        fetch('/api/collections'),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();

      if (pData.success && Array.isArray(pData.products)) {
        setProducts(pData.products);
      }
      if (cData.success && Array.isArray(cData.collections)) {
        setCollections(cData.collections);
      }
    } catch (e) {
      console.error('Failed loading products or collections:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Filter products by search, collection, status
  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchFamily = p.olfactoryFamily?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchFamily) return false;
    }

    if (filterCollection !== 'ALL') {
      if (p.collection?.slug !== filterCollection) return false;
    }

    if (filterStatus !== 'ALL') {
      const isPublished = (p.status || (p.isPublished ? 'ACTIVE' : 'DRAFT')) === 'ACTIVE';
      if (filterStatus === 'ACTIVE' && !isPublished) return false;
      if (filterStatus === 'DRAFT' && isPublished) return false;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `FRG-${Math.floor(100 + Math.random() * 900)}`,
      slug: '',
      shortDescription: '',
      description: '',
      productStory: '',
      price: '320',
      salePrice: '',
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: '15',
      collectionId: collections[0]?.id || '',
      olfactoryFamily: 'Woody Oriental',
      topNotes: ['Calabrian Bergamot', 'Cracked Cardamom'],
      heartNotes: ['Taif Damask Rose'],
      baseNotes: ['Cambodian Agarwood (Oud)', 'Bourbon Vanilla Bean'],
      featured: false,
      newArrival: true,
      published: true,
      images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'],
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (p: ProductData) => {
    setEditingProduct(p);
    const pImages =
      Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'];

    setFormData({
      name: p.name,
      sku: p.sku || '',
      slug: p.slug,
      shortDescription: p.shortDescription || p.subtitle || '',
      description: p.description || '',
      productStory: (p as any).baseDescription || (p as any).story || '',
      price: p.price.toString(),
      salePrice: p.salePrice ? p.salePrice.toString() : '',
      currency: (p as any).currency || 'USD',
      size: p.size || p.volume || '100 ml / 3.4 FL. OZ.',
      stockQuantity: (p.stockQuantity ?? p.stock ?? 10).toString(),
      collectionId: p.collection?.id || '',
      olfactoryFamily: p.olfactoryFamily || 'Woody Oriental',
      topNotes: p.topNotes || [],
      heartNotes: p.heartNotes || [],
      baseNotes: p.baseNotes || [],
      featured: Boolean(p.featured ?? p.isFeatured),
      newArrival: Boolean((p as any).newArrival),
      published: (p.status || (p.isPublished ? 'ACTIVE' : 'DRAFT')) === 'ACTIVE',
      images: pImages,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  // DUPLICATE ACTION
  const handleDuplicate = async (p: ProductData) => {
    const copyName = `${p.name} (Archive Copy)`;
    const copySku = `${p.sku || 'FRG'}-CPY-${Math.floor(10 + Math.random() * 89)}`;
    const copySlug = `${p.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;

    const pImages =
      Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'];

    try {
      const payload = {
        name: copyName,
        sku: copySku,
        slug: copySlug,
        shortDescription: p.shortDescription || p.subtitle || '',
        description: p.description || '',
        baseDescription: (p as any).baseDescription || '',
        price: p.price,
        salePrice: p.salePrice || null,
        currency: (p as any).currency || 'USD',
        size: p.size || p.volume || '100 ml / 3.4 FL. OZ.',
        stockQuantity: p.stockQuantity ?? p.stock ?? 10,
        collectionId: p.collection?.id || null,
        olfactoryFamily: p.olfactoryFamily || 'Woody Oriental',
        topNotes: p.topNotes || [],
        heartNotes: p.heartNotes || [],
        baseNotes: p.baseNotes || [],
        featured: false,
        newArrival: true,
        status: 'DRAFT', // Duplicates start as Draft
        images: pImages,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Duplicated "${p.name}" as "${copyName}" in Draft status.`);
        loadAll();
      } else {
        setErrorMsg(data.error || 'Failed to duplicate product');
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  // DELETE ACTION WITH CONFIRMATION MODAL
  const confirmDeleteProduct = async () => {
    if (!deleteModalProduct) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/products/${deleteModalProduct.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p.id !== deleteModalProduct.id));
        setSuccessMsg(`"${deleteModalProduct.name}" was permanently removed from the catalog.`);
      } else {
        setErrorMsg(data.error || 'Failed to delete product.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error occurred while deleting product.');
    } finally {
      setDeleting(false);
      setDeleteModalProduct(null);
    }
  };

  // PUBLISH / UNPUBLISH ACTION
  const handleTogglePublish = async (p: ProductData) => {
    const isCurrentActive = (p.status || (p.isPublished ? 'ACTIVE' : 'DRAFT')) === 'ACTIVE';
    const nextStatus = isCurrentActive ? 'DRAFT' : 'ACTIVE';

    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          isPublished: nextStatus === 'ACTIVE',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(
          products.map((item) =>
            item.id === p.id
              ? {
                  ...item,
                  status: nextStatus,
                  isPublished: nextStatus === 'ACTIVE',
                }
              : item
          )
        );
      }
    } catch (e) {
      console.error('Failed to toggle publish status:', e);
    }
  };

  // Add / Remove Notes
  const handleAddTopNote = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (newTopNote.trim() && !formData.topNotes.includes(newTopNote.trim())) {
      setFormData({ ...formData, topNotes: [...formData.topNotes, newTopNote.trim()] });
      setNewTopNote('');
    }
  };

  const handleAddHeartNote = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (newHeartNote.trim() && !formData.heartNotes.includes(newHeartNote.trim())) {
      setFormData({ ...formData, heartNotes: [...formData.heartNotes, newHeartNote.trim()] });
      setNewHeartNote('');
    }
  };

  const handleAddBaseNote = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (newBaseNote.trim() && !formData.baseNotes.includes(newBaseNote.trim())) {
      setFormData({ ...formData, baseNotes: [...formData.baseNotes, newBaseNote.trim()] });
      setNewBaseNote('');
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Product Name is required.');
      setSaving(false);
      return;
    }

    if (!formData.sku.trim()) {
      setErrorMsg('SKU is required.');
      setSaving(false);
      return;
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setErrorMsg('Valid positive price is required.');
      setSaving(false);
      return;
    }

    if (formData.salePrice && Number(formData.salePrice) >= Number(formData.price)) {
      setErrorMsg('Sale Price must be strictly lower than regular price.');
      setSaving(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      slug:
        formData.slug.trim() ||
        formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      shortDescription: formData.shortDescription.trim(),
      subtitle: formData.shortDescription.trim(),
      description: formData.description.trim(),
      baseDescription: formData.productStory.trim(),
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      currency: formData.currency,
      size: formData.size,
      volume: formData.size,
      stockQuantity: parseInt(formData.stockQuantity) || 10,
      stock: parseInt(formData.stockQuantity) || 10,
      collectionId: formData.collectionId || null,
      olfactoryFamily: formData.olfactoryFamily,
      topNotes: formData.topNotes,
      heartNotes: formData.heartNotes,
      baseNotes: formData.baseNotes,
      featured: formData.featured,
      isFeatured: formData.featured,
      newArrival: formData.newArrival,
      status: formData.published ? 'ACTIVE' : 'DRAFT',
      isPublished: formData.published,
      images: formData.images,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          editingProduct
            ? `Successfully updated "${payload.name}". Changes are live immediately.`
            : `Successfully created "${payload.name}". Available on the store immediately.`
        );
        setModalOpen(false);
        loadAll();
      } else {
        setErrorMsg(data.error || 'Failed to save product.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error occurred while saving product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-light block">
            Maison Atelier &bull; Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-ivory-100 font-normal">
            Product Management
          </h1>
          <p className="text-xs text-ivory-400 font-light">
            Manage your flacon inventory, pricing, olfactory notes, and high-resolution photography.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-5 py-3 text-xs uppercase tracking-[0.2em] font-semibold transition-colors shadow-luxury btn-luxury shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-ivory-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or family..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-noir-900 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-gold-400 font-light"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={filterCollection}
            onChange={(e) => setFilterCollection(e.target.value)}
            className="w-full bg-noir-900 border border-white/10 px-3 py-2.5 text-xs text-ivory-200 focus:outline-none focus:border-gold-400"
          >
            <option value="ALL">All Collections</option>
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-noir-900 border border-white/10 px-3 py-2.5 text-xs text-ivory-200 focus:outline-none focus:border-gold-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Published (Live)</option>
            <option value="DRAFT">Unpublished (Draft)</option>
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PRODUCTS TABLE */}
      {/* Show: Product image, Product name, SKU, Price, Stock, Collection, Status, Actions */}
      {/* ============================================================ */}
      <div className="bg-noir-900/60 border border-white/10 rounded-sm overflow-hidden shadow-luxury">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest text-ivory-400 font-light">
              Loading Product Catalog...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3 p-6">
            <AlertCircle className="w-8 h-8 text-gold-400/60 mx-auto" />
            <p className="text-sm font-serif text-ivory-200">No Products Found</p>
            <p className="text-xs text-ivory-400 font-light">
              Try adjusting your search criteria or add a new product.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-noir-950 text-ivory-400 uppercase tracking-widest text-[10px]">
                  <th className="py-4 px-4">Product Image</th>
                  <th className="py-4 px-4">Product Name</th>
                  <th className="py-4 px-4">SKU</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Collection</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => {
                  const isPublished = (p.status || (p.isPublished ? 'ACTIVE' : 'DRAFT')) === 'ACTIVE';
                  const stockCount = p.stockQuantity ?? p.stock ?? 10;
                  const primaryImg =
                    Array.isArray(p.images) && p.images.length > 0
                      ? p.images[0]
                      : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200';

                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      {/* Product Image */}
                      <td className="py-3.5 px-4">
                        <div className="relative w-12 h-14 bg-noir-950 border border-white/10 rounded-sm overflow-hidden shrink-0">
                          <Image
                            src={primaryImg}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="py-3.5 px-4 font-serif text-sm text-ivory-100">
                        <span className="font-medium block">{p.name}</span>
                        <span className="text-[10px] text-gold-400 font-sans font-light uppercase tracking-wider block">
                          {p.olfactoryFamily || 'Extrait de Parfum'}
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono text-xs text-gold-300">
                        {p.sku || '—'}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-sm text-ivory-100 font-medium">
                            {formatCurrency(p.price)}
                          </span>
                          {p.salePrice && (
                            <span className="text-[10px] text-ivory-400/60 line-through">
                              {formatCurrency(p.salePrice)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 font-mono text-[11px] border rounded-sm ${
                            stockCount <= 0
                              ? 'border-red-500/40 bg-red-950/60 text-red-300'
                              : stockCount <= 5
                              ? 'border-amber-500/40 bg-amber-950/60 text-amber-300'
                              : 'border-white/10 text-ivory-200'
                          }`}
                        >
                          {stockCount} units
                        </span>
                      </td>

                      {/* Collection */}
                      <td className="py-3.5 px-4 text-ivory-300">
                        {p.collection?.name || 'Private Reserve'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-semibold border ${
                            isPublished
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                              : 'bg-noir-950 border-white/20 text-ivory-400'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions: EDIT, DUPLICATE, DELETE, PUBLISH / UNPUBLISH */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 select-none">
                          {/* PUBLISH / UNPUBLISH */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(p)}
                            className={`px-2 py-1 text-[9px] uppercase tracking-wider font-semibold border transition-colors ${
                              isPublished
                                ? 'bg-noir-950 border-white/15 text-ivory-300 hover:text-amber-300'
                                : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                            }`}
                            title={isPublished ? 'Unpublish Product' : 'Publish Product'}
                          >
                            {isPublished ? 'Unpublish' : 'Publish'}
                          </button>

                          {/* EDIT */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-ivory-300 hover:text-gold-300 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* DUPLICATE */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p)}
                            className="p-1.5 text-ivory-300 hover:text-gold-300 transition-colors"
                            title="Duplicate Product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModalProduct({
                                id: p.id,
                                name: p.name,
                                sku: p.sku || 'N/A',
                              })
                            }
                            className="p-1.5 text-ivory-300 hover:text-red-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-noir-950 border border-red-500/40 text-ivory-100 p-6 sm:p-8 rounded-sm shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-ivory-100">Delete Product Confirmation</h3>
                <span className="text-[10px] uppercase tracking-widest text-red-400">Permanent Action</span>
              </div>
            </div>

            <div className="p-4 bg-noir-900/80 border border-white/10 space-y-1.5 text-xs">
              <p className="font-serif text-base text-ivory-100">{deleteModalProduct.name}</p>
              <p className="text-ivory-400 font-mono text-[11px]">SKU: {deleteModalProduct.sku}</p>
              <p className="text-ivory-400 font-light pt-2 leading-relaxed">
                Are you certain you wish to delete this product? It will be permanently removed from the database and immediately cease to appear on the customer website.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalProduct(null)}
                className="px-5 py-2.5 border border-white/15 text-ivory-300 text-xs uppercase tracking-widest hover:border-white/30 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteProduct}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD / EDIT PRODUCT MODAL FORM */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-noir-950 border border-gold-dim text-ivory-100 p-6 sm:p-8 rounded-sm shadow-luxury my-8 max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold-400 font-medium block">
                  {editingProduct ? 'Update Product Details' : 'Add New Product'}
                </span>
                <h2 className="text-2xl font-serif text-ivory-100">
                  {editingProduct ? editingProduct.name : 'Create Fragrea Product'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-ivory-400 hover:text-ivory-100 p-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name, SKU, Slug */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oud Nocturne"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="FRG-EXT-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Slug
                  </label>
                  <input
                    type="text"
                    placeholder="oud-nocturne"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Price, Sale Price, Currency, Size, Stock Quantity */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Sale Price ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Optional"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
                  >
                    {CURRENCIES.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Size
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Collection & Fragrance Family */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Collection
                  </label>
                  <select
                    value={formData.collectionId}
                    onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
                  >
                    <option value="">Private Reserve / None</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Fragrance Family
                  </label>
                  <select
                    value={formData.olfactoryFamily}
                    onChange={(e) => setFormData({ ...formData, olfactoryFamily: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
                  >
                    {FRAGRANCE_FAMILIES.map((fam) => (
                      <option key={fam} value={fam}>
                        {fam}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Olfactory Notes (Top notes, Heart notes, Base notes) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-noir-900/60 border border-white/10 rounded-sm">
                {/* Top Notes */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold-400 block font-medium">
                    Top Notes
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add note..."
                      value={newTopNote}
                      onChange={(e) => setNewTopNote(e.target.value)}
                      onKeyDown={handleAddTopNote}
                      className="w-full bg-noir-950 border border-white/10 px-2.5 py-1.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddTopNote}
                      className="px-2.5 py-1.5 bg-noir-850 border border-gold-dim text-gold-300 text-xs hover:bg-gold-400 hover:text-noir-950"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.topNotes.map((note) => (
                      <span
                        key={note}
                        className="inline-flex items-center gap-1 bg-noir-950 border border-white/15 px-2 py-0.5 text-[11px] text-ivory-200"
                      >
                        {note}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              topNotes: formData.topNotes.filter((n) => n !== note),
                            })
                          }
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Heart Notes */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold-400 block font-medium">
                    Heart Notes
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add note..."
                      value={newHeartNote}
                      onChange={(e) => setNewHeartNote(e.target.value)}
                      onKeyDown={handleAddHeartNote}
                      className="w-full bg-noir-950 border border-white/10 px-2.5 py-1.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddHeartNote}
                      className="px-2.5 py-1.5 bg-noir-850 border border-gold-dim text-gold-300 text-xs hover:bg-gold-400 hover:text-noir-950"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.heartNotes.map((note) => (
                      <span
                        key={note}
                        className="inline-flex items-center gap-1 bg-noir-950 border border-white/15 px-2 py-0.5 text-[11px] text-ivory-200"
                      >
                        {note}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              heartNotes: formData.heartNotes.filter((n) => n !== note),
                            })
                          }
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Base Notes */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gold-400 block font-medium">
                    Base Notes
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add note..."
                      value={newBaseNote}
                      onChange={(e) => setNewBaseNote(e.target.value)}
                      onKeyDown={handleAddBaseNote}
                      className="w-full bg-noir-950 border border-white/10 px-2.5 py-1.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddBaseNote}
                      className="px-2.5 py-1.5 bg-noir-850 border border-gold-dim text-gold-300 text-xs hover:bg-gold-400 hover:text-noir-950"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.baseNotes.map((note) => (
                      <span
                        key={note}
                        className="inline-flex items-center gap-1 bg-noir-950 border border-white/15 px-2 py-0.5 text-[11px] text-ivory-200"
                      >
                        {note}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              baseNotes: formData.baseNotes.filter((n) => n !== note),
                            })
                          }
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shadowed Cambodian Agarwood & Smoked Frankincense"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                  Full Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide an evocative olfactory description of the chords and scent profile..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-noir-900 border border-white/10 p-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 leading-relaxed font-light"
                />
              </div>

              {/* Product Story */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                  Product Story
                </label>
                <textarea
                  rows={3}
                  placeholder="The inspiration, heritage, and cellar maturation story behind this composition..."
                  value={formData.productStory}
                  onChange={(e) => setFormData({ ...formData, productStory: e.target.value })}
                  className="w-full bg-noir-900 border border-white/10 p-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 leading-relaxed font-light"
                />
              </div>

              {/* IMAGE MANAGEMENT */}
              <div className="p-4 bg-noir-900/60 border border-white/10 rounded-sm">
                <ImageUploader
                  images={formData.images}
                  onChange={(images) => setFormData({ ...formData, images })}
                />
              </div>

              {/* Featured, New Arrival, Published */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 accent-gold-400"
                  />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-ivory-200 block font-medium">
                      Published
                    </span>
                    <span className="text-[10px] text-ivory-500 font-light">
                      Immediately available on customer website
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 accent-gold-400"
                  />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-ivory-200 block font-medium">
                      Featured
                    </span>
                    <span className="text-[10px] text-ivory-500 font-light">
                      Spotlight in flagship showcase
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.newArrival}
                    onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                    className="w-4 h-4 accent-gold-400"
                  />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-ivory-200 block font-medium">
                      New Arrival
                    </span>
                    <span className="text-[10px] text-ivory-500 font-light">
                      Display luxury harvest badge
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 border border-white/10 text-ivory-300 hover:text-ivory-100 text-xs uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-2.5 text-xs uppercase tracking-widest font-semibold transition-colors shadow-luxury btn-luxury disabled:opacity-50"
                >
                  {saving
                    ? 'Saving to Database...'
                    : editingProduct
                    ? 'Save Product Changes'
                    : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs uppercase tracking-widest text-ivory-400">
          Loading Product Management...
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
