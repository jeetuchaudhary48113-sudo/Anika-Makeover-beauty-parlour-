/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { uploadFile } from '../lib/upload';
import { Upload, AlertCircle, Loader2, RefreshCw, Trash2, Crop, Sliders, Check, Eye } from 'lucide-react';

interface AdvancedImageUploaderProps {
  label: string;
  accept?: string;
  folder?: string;
  currentValue: string;
  onUploadComplete: (url: string) => void;
  aspectRatio?: '1:1' | '16:9' | '4:3' | 'free';
}

export const AdvancedImageUploader: React.FC<AdvancedImageUploaderProps> = ({
  label,
  accept = 'image/*',
  folder = 'uploads',
  currentValue,
  onUploadComplete,
  aspectRatio = 'free'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null); // Original Image ObjectURL for manipulation
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentValue || null);
  
  // Crop & Rotate States
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  
  // Resize States
  const [resizeWidth, setResizeWidth] = useState<number>(800);
  const [resizeHeight, setResizeHeight] = useState<number>(600);
  const [originalRatio, setOriginalRatio] = useState<number>(4 / 3);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync value resets
  useEffect(() => {
    if (currentValue) {
      setPreviewUrl(currentValue);
    }
  }, [currentValue]);

  // Handle selected file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('File is too large. Max size is 15MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSourceImage(reader.result);
        setActiveTab('edit'); // Jump directly to edit/crop tab
        
        // Load original dimensions to initialize resize values
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          setResizeWidth(img.width);
          setResizeHeight(img.height);
          setOriginalRatio(img.width / img.height);
        };
      }
    };
    reader.onerror = () => setError('Failed to read image file.');
    reader.readAsDataURL(file);
  };

  // Auto-calculate dimensions if ratio-locked
  const handleWidthChange = (val: number) => {
    setResizeWidth(val);
    if (aspectRatio === '1:1') {
      setResizeHeight(val);
    } else if (aspectRatio === '16:9') {
      setResizeHeight(Math.round(val / (16 / 9)));
    } else if (aspectRatio === '4:3') {
      setResizeHeight(Math.round(val / (4 / 3)));
    } else {
      setResizeHeight(Math.round(val / originalRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setResizeHeight(val);
    if (aspectRatio === '1:1') {
      setResizeWidth(val);
    } else if (aspectRatio === '16:9') {
      setResizeWidth(Math.round(val * (16 / 9)));
    } else if (aspectRatio === '4:3') {
      setResizeWidth(Math.round(val * (4 / 3)));
    } else {
      setResizeWidth(Math.round(val * originalRatio));
    }
  };

  // Generate cropped and resized image on canvas
  const processImage = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!sourceImage) {
        reject(new Error("No source image loaded"));
        return;
      }

      const img = new Image();
      img.src = sourceImage;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Output dimensions are the set resize bounds
        canvas.width = resizeWidth;
        canvas.height = resizeHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to secure canvas context"));
          return;
        }

        // Draw background (clear)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Align coordinates to center for rotation/zoom
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Incorporate custom XY offsets
        const drawX = -canvas.width / 2 + offsetX;
        const drawY = -canvas.height / 2 + offsetY;

        // Draw image into canvas boundary
        ctx.drawImage(img, drawX, drawY, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas export empty"));
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => reject(new Error("Failed loading image source"));
    });
  };

  // Trigger processed upload to Firebase Storage
  const handleUploadProcessedImage = async () => {
    setUploading(true);
    setError(null);

    try {
      const processedBlob = await processImage();
      const fileName = selectedFile ? selectedFile.name : 'edited_image.jpg';
      const fileToUpload = new File([processedBlob], fileName, { type: 'image/jpeg' });
      
      const serverUrl = await uploadFile(fileToUpload, folder);
      onUploadComplete(serverUrl);
      setPreviewUrl(serverUrl);
      setActiveTab('preview');
      setSourceImage(null);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err?.message || 'Upload & editing operations failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearImage = () => {
    onUploadComplete('');
    setPreviewUrl(null);
    setSourceImage(null);
    setSelectedFile(null);
    setActiveTab('preview');
  };

  return (
    <div id="advanced-uploader" className="space-y-3.5 p-4 sm:p-5 bg-neutral-900 border border-neutral-800 rounded-3xl relative">
      
      {/* Header Label */}
      <div className="flex items-center justify-between border-b border-neutral-850 pb-2.5">
        <span className="text-xs uppercase font-extrabold text-amber-500 tracking-wider block select-none">
          {label}
        </span>
        {sourceImage && (
          <div className="flex gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-850">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'edit' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400'}`}
            >
              <Crop size={10} className="inline mr-1" /> Edit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'preview' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400'}`}
            >
              <Eye size={10} className="inline mr-1" /> Preview
            </button>
          </div>
        )}
      </div>

      {/* Main Container Views */}
      <div className="space-y-4">
        
        {/* TAB 1: EDIT / COMPRESSION / CROP DESIGN CANVAS */}
        {activeTab === 'edit' && sourceImage && (
          <div className="space-y-4 animate-fade-in">
            {/* Visual crop box container */}
            <div className="relative w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-850 flex items-center justify-center">
              <div 
                className="overflow-hidden bg-checkered flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                }}
              >
                <img
                  ref={imgRef}
                  src={sourceImage}
                  alt="Editor Source"
                  className="max-h-full max-w-full object-contain pointer-events-none transition-transform"
                  style={{
                    transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${zoom})`,
                  }}
                />
              </div>
              <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
                <span className="px-2 py-1 bg-neutral-950/80 border border-neutral-800 text-[10px] rounded-lg text-neutral-300 font-mono">
                  Editor Sandbox Active
                </span>
              </div>
            </div>

            {/* Editing Sliders Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-950 p-3 rounded-2xl border border-neutral-850">
              
              {/* Sliders subcolumn 1: Zoom / Rotation */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-neutral-400">
                    <span>Crop Zoom Multiplier</span>
                    <span className="text-amber-500">{zoom.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-neutral-400">
                    <span>Rotation Degrees</span>
                    <span className="text-amber-500">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Sliders subcolumn 2: Shift X / Shift Y */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-neutral-400">
                    <span>Horizontal Offset X</span>
                    <span className="text-amber-500">{offsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="5"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-neutral-400">
                    <span>Vertical Offset Y</span>
                    <span className="text-amber-500">{offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="5"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Resize Input Blocks */}
              <div className="col-span-1 md:col-span-2 border-t border-neutral-850 pt-3 mt-1 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-450 block">Target Resize Width (px)</label>
                  <input
                    type="number"
                    value={resizeWidth}
                    min="50"
                    max="3840"
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 800)}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-450 block">Target Resize Height (px)</label>
                  <input
                    type="number"
                    value={resizeHeight}
                    min="50"
                    max="3840"
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 600)}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300"
                  />
                </div>
              </div>

            </div>

            {/* Perform / Confirm Process and upload */}
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSourceImage(null);
                  setSelectedFile(null);
                  setActiveTab('preview');
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel Edit
              </button>
              
              <button
                type="button"
                onClick={handleUploadProcessedImage}
                disabled={uploading}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 text-neutral-950 inline-flex items-center gap-1.5 cursor-pointer"
              >
                {uploading ? <Loader2 size={13} className="animate-spin text-neutral-950" /> : <Check size={13} />}
                <span>{uploading ? 'Processing & Uploading...' : 'Upload Image'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SIMPLE PREVIEW & SELECT FILE ROW */}
        {activeTab === 'preview' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center gap-5 bg-neutral-950/40 p-3 rounded-2xl border border-neutral-850/50">
              
              {/* Asset Box preview */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-neutral-800 text-neutral-100 flex items-center justify-center shrink-0 bg-neutral-950 select-none relative group">
                {previewUrl ? (
                  <>
                    <img 
                      src={previewUrl} 
                      alt="Salon Asset Preview" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-neutral-950/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-400 font-bold">Live Content</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-2 opacity-35 text-[10px] font-light">
                    <span>No Image Loaded</span>
                  </div>
                )}
              </div>

              {/* Command Action Buttons */}
              <div className="flex-1 space-y-2.5 w-full">
                <p className="text-[10px] text-neutral-400 font-light leading-relaxed">
                  Direct hardware uploads automatically scale & pre-compress on the client canvas, preserving rapid response and saving directly into Firebase Cloud Storage.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-750 text-neutral-200 hover:text-white rounded-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors inline-flex items-center gap-1.5">
                    <Upload size={13} className="text-amber-500" />
                    <span>Select Image</span>
                    <input 
                      type="file" 
                      accept={accept} 
                      onChange={handleFileSelect} 
                      className="hidden" 
                    />
                  </label>

                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="px-3 py-2 bg-neutral-900/60 hover:bg-red-950/35 border border-neutral-800 hover:border-red-900/45 text-neutral-400 hover:text-red-400 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Upload/Fetch errors notification banner */}
      {error && (
        <span className="text-[10px] text-red-400 flex items-center gap-1.5 mt-2 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
          <AlertCircle size={12} />
          {error}
        </span>
      )}

    </div>
  );
};
