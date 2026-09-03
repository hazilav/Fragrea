'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Link as LinkIcon,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

const PRESET_FLACONS = [
  { label: 'Obsidian Noir Flacon', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Golden Amber Bottle', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Warm Glass Flacon', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Nocturne Shadow Flacon', url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Amber Liquid Bottle', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Vintage Perfume Flacon', url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Smoky Essence Bottle', url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Luminous Citrus Flacon', url: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=1200&auto=format&fit=crop' },
];

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
    setUploading(false);
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (replacingIdx === null || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const updated = [...images];
        updated[replacingIdx] = data.url;
        onChange(updated);
      }
    } catch (err) {
      console.error('Replacement error:', err);
    } finally {
      setUploading(false);
      setReplacingIdx(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleUploadFiles(e.dataTransfer.files);
  };

  const handleAddCustomUrl = () => {
    if (customUrl.trim() && !images.includes(customUrl.trim())) {
      onChange([...images, customUrl.trim()]);
      setCustomUrl('');
    }
  };

  const handleSelectPreset = (url: string) => {
    if (!images.includes(url)) {
      onChange([...images, url]);
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const remaining = images.filter((_, idx) => idx !== index);
    onChange([item, ...remaining]);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {/* Hidden input for replace action */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFile}
      />

      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-serif uppercase tracking-widest text-ivory-200 block font-medium">
            Product Images &amp; Gallery
          </label>
          <span className="text-[10px] text-ivory-500 font-light">
            Main product image is designated as <strong className="text-gold-300">#1 (Primary)</strong>.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gold-400 hover:text-gold-300 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showPresets ? 'Hide Presets' : 'Choose Studio Presets'}</span>
        </button>
      </div>

      {/* Preset Luxury Images Picker */}
      {showPresets && (
        <div className="p-4 bg-espresso-950/80 border border-gold-dim rounded-sm space-y-3 animate-fade-in">
          <div className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold">
            Maison Studio Curated Flacon Photography
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_FLACONS.map((preset, idx) => {
              const isSelected = images.includes(preset.url);
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(preset.url)}
                  disabled={isSelected}
                  className={`group relative aspect-[3/4] border overflow-hidden text-left transition-all ${
                    isSelected
                      ? 'border-gold-400 ring-2 ring-gold-400/40 opacity-50 cursor-not-allowed'
                      : 'border-white/10 hover:border-gold-400'
                  }`}
                >
                  <Image
                    src={preset.url}
                    alt={preset.label}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-[9px] text-ivory-200 truncate">
                    {preset.label}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-gold-400 text-noir-950 rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-7 rounded-sm text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-gold-400 bg-gold-400/10'
            : 'border-white/15 bg-noir-900/50 hover:border-gold-dim hover:bg-noir-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUploadFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full border border-gold-400/30 flex items-center justify-center text-gold-400">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div className="text-xs text-ivory-200">
            <span className="text-gold-400 font-medium">Click to upload</span> or drag &amp; drop flacon images
          </div>
          <span className="text-[10px] text-ivory-500 font-light">
            PNG, JPG, WEBP &bull; Uploads immediately to database storage
          </span>
        </div>
      </div>

      {/* Direct URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ivory-500">
            <LinkIcon className="w-3.5 h-3.5" />
          </div>
          <input
            type="url"
            placeholder="Or enter direct image URL (https://...)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomUrl();
              }
            }}
            className="w-full bg-noir-900 border border-white/10 pl-9 pr-4 py-2 text-xs text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-gold-400"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCustomUrl}
          disabled={!customUrl.trim()}
          className="px-4 py-2 bg-noir-850 border border-gold-dim hover:bg-gold-400 hover:text-noir-950 text-gold-300 text-xs uppercase tracking-wider font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add URL
        </button>
      </div>

      {/* Image Gallery Grid with Main, Gallery, Preview, Replace, and Delete */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-[10px] uppercase tracking-widest text-ivory-400 font-semibold flex items-center justify-between">
            <span>
              Configured Imagery ({images.length}) &bull; {images.length === 1 ? 'Main Only' : 'Main + Additional Gallery'}
            </span>
            <span className="text-gold-400 font-normal">Click eye to preview &bull; Click replace to swap</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((imgUrl, idx) => {
              const isMain = idx === 0;
              return (
                <div
                  key={idx}
                  className={`group relative aspect-[3/4] bg-noir-850 border rounded-sm overflow-hidden flex flex-col justify-between ${
                    isMain ? 'border-gold-400 ring-2 ring-gold-400/40' : 'border-white/10'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Product image ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950/90 via-transparent to-black/60 pointer-events-none" />

                  {/* Top Bar: Primary badge, Preview & Delete */}
                  <div className="relative z-10 p-1.5 flex items-center justify-between">
                    {isMain ? (
                      <span className="bg-gold-400 text-noir-950 text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Main
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="bg-noir-950/80 text-ivory-300 hover:text-gold-300 text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 border border-white/10 rounded-sm"
                        title="Set as Main Product Image"
                      >
                        Set Main
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      {/* Image Preview Action */}
                      <button
                        type="button"
                        onClick={() => setPreviewImageUrl(imgUrl)}
                        className="text-ivory-400 hover:text-gold-300 p-1 bg-noir-950/80 rounded-full transition-colors"
                        title="Preview Image"
                      >
                        <Eye className="w-3 h-3" />
                      </button>

                      {/* Delete Image Action */}
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="text-ivory-400 hover:text-red-400 p-1 bg-noir-950/80 rounded-full transition-colors"
                        title="Delete Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Bar: Replace & Reorder Controls */}
                  <div className="relative z-10 p-1.5 flex items-center justify-between bg-noir-950/85 border-t border-white/10 text-[9px] text-ivory-400">
                    {/* Replace Image Action */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingIdx(idx);
                        replaceInputRef.current?.click();
                      }}
                      className="flex items-center gap-1 text-[8.5px] uppercase tracking-wider text-ivory-300 hover:text-gold-300"
                      title="Replace this image"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Replace</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'left')}
                        className="p-0.5 hover:text-gold-300 disabled:opacity-20 disabled:hover:text-ivory-400"
                        title="Move Earlier"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMove(idx, 'right')}
                        className="p-0.5 hover:text-gold-300 disabled:opacity-20 disabled:hover:text-ivory-400"
                        title="Move Later"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-2xl w-full bg-noir-950 border border-white/15 p-4 rounded shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] uppercase tracking-widest text-gold-400 font-medium">
                Image Full Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="text-ivory-400 hover:text-ivory-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-[4/5] w-full mt-3 overflow-hidden bg-noir-900 border border-white/10">
              <Image
                src={previewImageUrl}
                alt="Full preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
