/**
 * Image compression utilities for SmartShip
 * Compresses images before uploading to reduce base64 size in DB
 */

/**
 * Compress a single image file
 * @param file - The File object from input
 * @param maxWidth - Maximum width in pixels (default 800)
 * @param maxHeight - Maximum height in pixels (default 800)
 * @param quality - JPEG quality 0-1 (default 0.7)
 * @returns Promise<string> - compressed base64 data URL
 */
export function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple image files
 * @param files - Array of File objects
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - JPEG quality 0-1
 * @returns Promise<string[]> - Array of compressed base64 data URLs
 */
export async function compressMultipleImages(
  files: File[],
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
): Promise<string[]> {
  const promises = files.map(file => compressImage(file, maxWidth, maxHeight, quality));
  return Promise.all(promises);
}
