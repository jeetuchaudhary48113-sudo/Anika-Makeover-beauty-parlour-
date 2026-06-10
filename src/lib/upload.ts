/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isMockFirebase } from './firebase';

/**
 * Compresses an image file on the client side using a canvas element to make
 * upload speeds lightning-fast and keep Base64 fallback strings lightweight.
 */
async function compressImage(file: File, maxWidth = 1200, quality = 0.75): Promise<Blob | File> {
  // If it's not an image, or it's an animated GIF/vector SVG, skip compression
  if (!file.type.startsWith('image/') || file.type.includes('gif') || file.type.includes('svg')) {
    return file;
  }

  return new Promise<Blob | File>((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let width = img.width;
      let height = img.height;

      // Only downscale if width exceeds maximum threshold
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      resolve(file); // Safe fallback to original file
    };
  });
}

/**
 * Resilient file upload helper that uploads to Firebase Storage or falls back to Base64 Data URL.
 * Works perfectly in sandbox, dev, and production.
 */
export async function uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
  // If size is too large for local fallback, show warning
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('File is too large. Max size is 15MB.');
  }

  // Compress/resize the image if applicable to minimize transfer package size
  const processedBlob = await compressImage(file);

  let uploadSucceeded = false;
  let url = '';

  // Attempt real Firebase Storage only if active and not in a mock/fallback sandbox project
  if (storage && !isMockFirebase) {
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
      
      // Keep uploads responsive with a standard, generous timeout (e.g., 60 seconds)
      const snapshot = await Promise.race([
        uploadBytes(storageRef, processedBlob),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Firebase Storage upload timed out after 60s')), 60000)
        )
      ]);
      
      url = await getDownloadURL(snapshot.ref);
      uploadSucceeded = true;
    } catch (error) {
      console.warn("Firebase Storage upload timed out, disabled, or failed. Proceeding with immediate local Base64 format.", error);
    }
  }

  // If Firebase Storage succeeded and outputted a clean URL, return it
  if (uploadSucceeded && url) {
    return url;
  }

  // Otherwise, return base64 representation instantly (virtually 0ms delay)
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to parse file content."));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(processedBlob);
  });
}
