// Validation utilities for forms across the application

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates 10-digit Indian mobile / phone number
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

/**
 * Restricts input to maximum 10 digits
 */
export function formatPhone(val: string): string {
  if (!val) return '';
  return val.replace(/\D/g, '').slice(0, 10);
}

/**
 * Validates 15-character Indian GSTIN format
 * Format: 2 digits (state) + 5 letters (PAN) + 4 digits + 1 letter + 1 entity/check digit + 'Z' + 1 checksum
 */
export function isValidGST(gst: string): boolean {
  if (!gst || typeof gst !== 'string') return false;
  const cleanGst = gst.trim().toUpperCase();
  if (cleanGst.length !== 15) return false;
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(cleanGst);
}

/**
 * Restricts input to maximum 15 uppercase alphanumeric characters for GST
 */
export function formatGST(val: string): string {
  if (!val) return '';
  return val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
}

/**
 * Restricts input to maximum 10 uppercase alphanumeric characters for PAN
 */
export function formatPAN(val: string): string {
  if (!val) return '';
  return val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 10);
}

/**
 * Validates 10-character PAN number format
 */
export function isValidPAN(pan: string): boolean {
  if (!pan || typeof pan !== 'string') return false;
  const cleanPan = pan.trim().toUpperCase();
  if (cleanPan.length !== 10) return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(cleanPan);
}
