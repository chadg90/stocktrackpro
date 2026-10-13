/**
 * UK vehicle registration helpers — capitals + standard spacing for DVLA / display.
 * DVLA API calls should use {@link registrationKey} (no spaces).
 */

/** Alphanumeric only, uppercase — for DVLA lookups and duplicate checks. */
export function registrationKey(value: string | null | undefined): string {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Format for storage / display (e.g. AB12 CDE).
 * Falls back to compact uppercase if the pattern is unusual.
 */
export function formatUkRegistration(value: string | null | undefined): string {
  const raw = registrationKey(value);
  if (!raw) return '';

  // Current style (2001+): AA99 AAA
  if (/^[A-Z]{2}[0-9]{2}[A-Z]{3}$/.test(raw)) {
    return `${raw.slice(0, 4)} ${raw.slice(4)}`;
  }
  // Prefix (1983–2001): A123 AAA / A12 AAA / A1 AAA
  if (/^[A-Z][0-9]{1,3}[A-Z]{3}$/.test(raw)) {
    const letters = raw.slice(-3);
    const rest = raw.slice(0, -3);
    return `${rest} ${letters}`;
  }
  // Suffix (1963–1983): AAA 123A / AAA 12A / AAA 1A
  if (/^[A-Z]{3}[0-9]{1,3}[A-Z]$/.test(raw)) {
    return `${raw.slice(0, 3)} ${raw.slice(3)}`;
  }
  // Incomplete / unusual plates: keep compact uppercase (no guessed space while typing)
  return raw;
}

export function isValidUkRegistrationShape(value: string | null | undefined): boolean {
  const raw = registrationKey(value);
  if (raw.length < 2 || raw.length > 8) return false;
  return /^[A-Z0-9]+$/.test(raw);
}

/** Light title-case for make/model; keeps short acronyms uppercase. */
export function formatVehicleMakeModel(value: string | null | undefined): string {
  const s = String(value || '').trim().replace(/\s+/g, ' ');
  if (!s) return '';
  const acronyms = new Set(['BMW', 'VW', 'MG', 'SEAT', 'DS', 'KIA', 'MINI', 'TVR', 'GMC']);
  return s
    .split(' ')
    .map((word) => {
      const upper = word.toUpperCase();
      if (acronyms.has(upper)) return upper;
      if (/^[A-Z0-9]{2,4}$/i.test(word) && /[0-9]/.test(word)) return upper; // e.g. GTI, X5
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
