/**
 * Client-side Canvas Image Watermarking
 * Adds Project Name, Timestamp (WIB), GPS coordinates, and RAB Item code.
 */

export interface WatermarkOptions {
  projectName?: string;
  contractorName?: string;
  rabCode?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: Date;
  customNote?: string;
}

export async function addWatermarkToImage(
  file: File,
  options: WatermarkOptions = {}
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Limit max dimensions to maintain quality and keep file size under 500KB
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw original image
        ctx.drawImage(img, 0, 0, width, height);

        // Watermark Banner at bottom
        const bannerHeight = Math.max(90, Math.round(height * 0.14));
        ctx.fillStyle = 'rgba(10, 25, 47, 0.82)'; // Dark navy semi-transparent
        ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

        // Gold decorative accent line
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(0, height - bannerHeight, width, 3);

        // Text styling
        const date = options.timestamp || new Date();
        const wibTime = date.toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          dateStyle: 'full',
          timeStyle: 'medium',
        });

        const projectName = options.projectName || 'RS PERTAMINA PRABUMULIH';
        const contractor = options.contractorName || 'PT MITRA BANGUN MAHAKARYA';
        const gpsText =
          options.latitude && options.longitude
            ? `GPS: ${options.latitude.toFixed(6)}, ${options.longitude.toFixed(6)}`
            : 'GPS: Lokasi Terdeteksi Prabumulih';
        const itemText = options.rabCode ? `ITEM RAB: ${options.rabCode}` : 'DOKUMENTASI PEKERJAAN';

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(projectName.toUpperCase(), 16, height - bannerHeight + 26);

        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#D4AF37';
        ctx.fillText(contractor, 16, height - bannerHeight + 46);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText(`WAKTU : ${wibTime} WIB`, 16, height - bannerHeight + 66);
        ctx.fillText(`${gpsText} | ${itemText}`, 16, height - bannerHeight + 84);

        if (options.customNote) {
          ctx.font = 'italic 12px sans-serif';
          ctx.fillStyle = '#94A3B8';
          ctx.fillText(`Ket: ${options.customNote}`, 16, height - bannerHeight + 102);
        }

        // Convert to JPEG blob (~80% quality for optimal size < 500KB)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
              resolve({ dataUrl, blob });
            } else {
              reject(new Error('Failed to generate image blob'));
            }
          },
          'image/jpeg',
          0.82
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
