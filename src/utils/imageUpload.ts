import UTIF from 'utif';

export interface ProcessedImage {
  dataUrl: string;
  name: string;
  format: string;
  size: number;
  formattedSize: string;
  width?: number;
  height?: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function scaleDownCanvas(canvas: HTMLCanvasElement, maxDim = 1920): string {
  const width = canvas.width;
  const height = canvas.height;
  if (width <= maxDim && height <= maxDim) {
    return canvas.toDataURL('image/png');
  }

  const ratio = Math.min(maxDim / width, maxDim / height);
  const targetW = Math.round(width * ratio);
  const targetH = Math.round(height * ratio);

  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = targetW;
  scaledCanvas.height = targetH;
  const ctx = scaledCanvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, targetW, targetH);
    return scaledCanvas.toDataURL('image/png');
  }
  return canvas.toDataURL('image/png');
}

/**
 * Validates whether file format is supported: PNG, JPG, JPEG, TIFF (.tif, .tiff), WebP
 */
export function isSupportedImageFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const validExtensions = ['png', 'jpg', 'jpeg', 'tiff', 'tif', 'webp'];
  const validMimes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/tiff',
    'image/tif',
    'image/webp',
    'image/x-tiff',
  ];
  return validExtensions.includes(ext) || validMimes.includes(file.type);
}

/**
 * Processes an uploaded image file (PNG, JPG, JPEG, TIFF), converting TIFF to PNG Data URL
 * and normalizing images for web delivery.
 */
export async function processImageUpload(file: File): Promise<ProcessedImage> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isTiff = ext === 'tif' || ext === 'tiff' || file.type.includes('tiff');

  if (isTiff) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const ifds = UTIF.decode(arrayBuffer);
      if (!ifds || ifds.length === 0) {
        throw new Error('TIFF header contains no decodable image directories.');
      }

      UTIF.decodeImage(arrayBuffer, ifds[0]);
      const rgba = UTIF.toRGBA8(ifds[0]);
      const width = ifds[0].width;
      const height = ifds[0].height;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      const imgData = ctx.createImageData(width, height);
      for (let i = 0; i < rgba.length; i++) {
        imgData.data[i] = rgba[i];
      }
      ctx.putImageData(imgData, 0, 0);

      const dataUrl = scaleDownCanvas(canvas, 1920);

      return {
        dataUrl,
        name: file.name,
        format: 'TIFF (Web-Rendered)',
        size: file.size,
        formattedSize: formatFileSize(file.size),
        width,
        height,
      };
    } catch (err: any) {
      console.error('TIFF conversion error:', err);
      throw new Error(`Failed to process TIFF file "${file.name}": ${err?.message || 'Invalid format'}`);
    }
  }

  // Handle standard PNG, JPG, JPEG, WebP
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let finalDataUrl = rawDataUrl;
        const maxDim = 1920;
        if (img.width > maxDim || img.height > maxDim) {
          const ratio = Math.min(maxDim / img.width, maxDim / img.height);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
            finalDataUrl = canvas.toDataURL(mime, 0.9);
          }
        }

        const formatLabel = ext.toUpperCase() || 'IMAGE';
        resolve({
          dataUrl: finalDataUrl,
          name: file.name,
          format: formatLabel,
          size: file.size,
          formattedSize: formatFileSize(file.size),
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        resolve({
          dataUrl: rawDataUrl,
          name: file.name,
          format: ext.toUpperCase() || 'IMAGE',
          size: file.size,
          formattedSize: formatFileSize(file.size),
        });
      };
      img.src = rawDataUrl;
    };
    reader.onerror = (e) => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
