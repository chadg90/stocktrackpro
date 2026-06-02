import { Timestamp } from 'firebase/firestore';

export const PLANT_PDF_RETRY_MAX = 3;
export const PLANT_PDF_RETRY_COOLDOWN_MS = 60 * 60 * 1000;

export type PlantPdfRetryFields = {
  pdf_retry_count?: number;
  pdf_last_retry_at?: Timestamp | { seconds: number } | null;
  pdf_generation_started?: boolean;
};

function lastRetryMs(value: PlantPdfRetryFields['pdf_last_retry_at']): number | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'object' && 'seconds' in value) {
    return value.seconds * 1000;
  }
  return null;
}

/** Mirrors Cloud Function `retryPlantInspectionPdfs` limits for UI. */
export function getPlantPdfRetryBlockReason(row: PlantPdfRetryFields): string | null {
  if (row.pdf_generation_started) {
    return 'PDF generation is already in progress.';
  }

  const count = Number(row.pdf_retry_count ?? 0);
  if (count >= PLANT_PDF_RETRY_MAX) {
    return `Retry limit reached (${PLANT_PDF_RETRY_MAX} per inspection).`;
  }

  const lastMs = lastRetryMs(row.pdf_last_retry_at);
  if (lastMs != null) {
    const elapsed = Date.now() - lastMs;
    if (elapsed < PLANT_PDF_RETRY_COOLDOWN_MS) {
      const minutesLeft = Math.ceil((PLANT_PDF_RETRY_COOLDOWN_MS - elapsed) / 60000);
      return `Wait ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'} before retrying.`;
    }
  }

  return null;
}

export function plantPdfRetriesRemaining(row: PlantPdfRetryFields): number {
  return Math.max(0, PLANT_PDF_RETRY_MAX - Number(row.pdf_retry_count ?? 0));
}
