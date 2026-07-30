/**
 * Blood/organ signature helpers — decode stroke JSON and render for web PDF / preview.
 * Matches STP/services/inspections/signatureSvgHtml.ts payload shape.
 */

type SignaturePayload = {
  paths: string[];
  padWidth: number;
  padHeight: number;
};

function decodeSignaturePayload(encoded: string): SignaturePayload {
  if (!encoded) return { paths: [], padWidth: 0, padHeight: 0 };
  try {
    const parsed = JSON.parse(encoded);
    if (Array.isArray(parsed)) {
      return {
        paths: parsed.filter((p) => typeof p === 'string' && p.length > 5),
        padWidth: 0,
        padHeight: 0,
      };
    }
    return {
      paths: Array.isArray(parsed.paths)
        ? parsed.paths.filter((p: unknown) => typeof p === 'string' && (p as string).length > 5)
        : [],
      padWidth: Number(parsed.padWidth) || 0,
      padHeight: Number(parsed.padHeight) || 0,
    };
  } catch {
    return { paths: [], padWidth: 0, padHeight: 0 };
  }
}

function signatureViewBox(paths: string[], padWidth: number, padHeight: number): string {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const path of paths) {
    const nums = path.match(/-?\d*\.?\d+/g);
    if (!nums) continue;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = parseFloat(nums[i]);
      const y = parseFloat(nums[i + 1]);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  const pad = 12;
  if (!Number.isFinite(minX)) {
    const w = padWidth > 0 ? padWidth : 300;
    const h = padHeight > 0 ? padHeight : 80;
    return `0 0 ${w} ${h}`;
  }
  const width = Math.max(maxX - minX + pad * 2, 40);
  const height = Math.max(maxY - minY + pad * 2, 24);
  return `${minX - pad} ${minY - pad} ${width} ${height}`;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** True when signature_paths is a Storage path or remote image, not stroke JSON. */
export function isSignatureStorageRef(encoded?: string | null): boolean {
  if (!encoded || typeof encoded !== 'string') return false;
  const trimmed = encoded.trim();
  if (trimmed.startsWith('http') || trimmed.startsWith('gs://') || trimmed.startsWith('data:')) {
    return true;
  }
  return trimmed.includes('/') && !trimmed.startsWith('{') && !trimmed.startsWith('[');
}

export function hasEncodedSignature(encoded?: string | null): boolean {
  if (!encoded || isSignatureStorageRef(encoded)) return false;
  return decodeSignaturePayload(encoded).paths.length > 0;
}

/** Returns inline SVG markup, or null if no usable signature strokes. */
export function signatureEncodedToSvgHtml(
  encoded?: string | null,
  opts?: { width?: number; height?: number }
): string | null {
  if (!encoded || typeof encoded !== 'string' || isSignatureStorageRef(encoded)) return null;
  const { paths, padWidth, padHeight } = decodeSignaturePayload(encoded);
  if (!paths.length) return null;
  const viewBox = signatureViewBox(paths, padWidth, padHeight);
  const width = opts?.width ?? 280;
  const height = opts?.height ?? 100;
  const pathMarkup = paths
    .map(
      (d) =>
        `<path d="${escapeAttr(d)}" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />`
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeAttr(viewBox)}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet">${pathMarkup}</svg>`;
}

/** Rasterise stroke signature to PNG data URL for jsPDF embedding. */
export async function signatureEncodedToPngDataUrl(
  encoded?: string | null,
  opts?: { width?: number; height?: number }
): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  const width = opts?.width ?? 560;
  const height = opts?.height ?? 200;
  const svg = signatureEncodedToSvgHtml(encoded, { width, height });
  if (!svg) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
