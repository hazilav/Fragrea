'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Layers, Sparkles } from 'lucide-react';
import { CollectionData } from '@/types';

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subtitle: '',
    description: '',
    heroImage: '',
    isFeatured: false,
  });

  const [saving, setSaving] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      if (data.success) {
        setCollections(data.collections);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openAddModal = () => {
    setEditingCol(null);
    setFormData({
      name: '',
      slug: '',
      subtitle: '',
      description: '',
      heroImage:
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1400&auto=format&fit=crop',
      isFeatured: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (col: any) => {
    setEditingCol(col);
    setFormData({
      name: col.name,
      slug: col.slug,
      subtitle: col.subtitle || '',
      description: col.description || '',
      heroImage: col.heroImage,
      isFeatured: col.isFeatured,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setSaving(true);
    try {
      const url = editingCol
        ? `/api/collections/${editingCol.id}`
        : '/api/collections';
      const method = editingCol ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchCollections();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete collection "${name}"? Existing flacons will remain unassigned.`)) {
      return;
    }
    try {
      await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      fetchCollections();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
            Curated Chapters
          </span>
          <h1 className="text-3xl font-serif text-ivory-100">Collections Management</h1>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-5 py-2.5 text-xs uppercase tracking-widest font-medium transition-colors shadow-luxury"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            className="bg-noir-900 border border-white/10 overflow-hidden flex flex-col justify-between shadow-luxury"
          >
            <div className="relative aspect-[16/9] w-full bg-noir-950 overflow-hidden">
              <Image
                src={col.heroImage}
                alt={col.name}
                fill
                className="object-cover brightness-60"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => openEditModal(col)}
                  className="bg-black/60 text-ivory-200 hover:text-gold-400 p-1.5 rounded"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(col.id, col.name)}
                  className="bg-black/60 text-ivory-400 hover:text-red-400 p-1.5 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 bg-gold-400/90 text-noir-950 text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold">
                {col._count?.products || 0} Flacons
              </div>
            </div>

            <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-xl text-ivory-100">{col.name}</h3>
                <p className="text-xs text-gold-300 italic">{col.subtitle}</p>
                <p className="text-xs text-ivory-400 font-light mt-2 line-clamp-3 leading-relaxed">
                  {col.description}
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 text-[10px] text-ivory-500 uppercase tracking-wider">
                Slug: /{col.slug}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-noir-900 border border-gold-dim shadow-luxury z-10 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-lg font-serif text-ivory-100">
                {editingCol ? `Edit ${editingCol.name}` : 'Create Collection'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-ivory-400 hover:text-ivory-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-ivory-300 block">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="The Nocturne Series"
                  className="w-full bg-noir-950 border border-white/15 px-3 py-2 text-xs text-ivory-100 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-ivory-300 block">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Shadowed woods, velvety leathers & nocturnal roses"
                  className="w-full bg-noir-950 border border-white/15 px-3 py-2 text-xs text-ivory-100 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-ivory-300 block">
                  Hero Image URL
                </label>
                <input
                  type="url"
                  value={formData.heroImage}
                  onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-noir-950 border border-white/15 px-3 py-2 text-xs text-ivory-100 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-ivory-300 block">
                  Curatorial Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-noir-950 border border-white/15 px-3 py-2 text-xs text-ivory-100 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-white/15 px-5 py-2 text-xs uppercase tracking-widest text-ivory-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gold-400 hover:bg-gold-300 text-noir-950 px-6 py-2 text-xs uppercase tracking-widest font-medium"
                >
                  {saving ? 'Saving...' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
