/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { uploadFile } from '../lib/upload';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';

interface DirectFileUploaderProps {
  label: string;
  accept: string;
  folder?: string;
  currentValue: string;
  onUploadComplete: (url: string) => void;
}

export const DirectFileUploader: React.FC<DirectFileUploaderProps> = ({ 
  label, 
  accept, 
  folder = 'uploads', 
  currentValue, 
  onUploadComplete 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const url = await uploadFile(file, folder);
      onUploadComplete(url);
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5 p-3.5 bg-neutral-900 border border-neutral-850 rounded-xl">
      <span className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {currentValue && (
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-700 shrink-0 bg-neutral-950">
            {accept.includes('video') ? (
              <video src={currentValue} className="w-full h-full object-cover" />
            ) : currentValue.endsWith('.pdf') ? (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-red-400 font-bold uppercase">PDF</div>
            ) : (
              <img src={currentValue} alt="Asset Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            )}
          </div>
        )}
        <label className={`px-4 py-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5 ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
          {uploading ? <Loader2 size={13} className="animate-spin text-amber-500" /> : <Upload size={13} />}
          <span>{uploading ? 'Uploading...' : 'Direct Upload File'}</span>
          <input type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        </label>
        {currentValue && <span className="text-[10px] text-emerald-400 font-mono">✓ Loaded</span>}
      </div>
      {error && (
        <span className="text-[9px] text-red-400 flex items-center gap-1 mt-1">
          <AlertCircle size={10} />
          {error}
        </span>
      )}
    </div>
  );
};
