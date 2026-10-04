/**
 * Security Service for Mi Capricho Secreto
 * Enforces cryptographic hashing, brute-force mitigation, XSS sanitization,
 * and eliminates plaintext credentials from client-side bundles.
 */

// Cryptographic SHA-256 hashes of master administrative identity
// Stored strictly as irreversible cryptographic digests (no plaintext strings in code)
const SECURE_ADMIN_EMAIL_HASH = 'd546f087eac5e2a259b8f5e12dbc8d6687471c77b50da27541b54ad71fc2bfa3';
const SECURE_ADMIN_PASS_HASH = 'ecf9596097404c16398a3d47b4ea1b8e1910de3f7525ac68070113a2248f25cb';

// Brute-force protection state (in-memory & session-backed)
const MAX_ATTEMPTS = 4;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds

interface LockoutState {
  failedAttempts: number;
  lockedUntil: number | null;
}

function getLockoutState(): LockoutState {
  try {
    const raw = sessionStorage.getItem('_cap_sec_guard');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return { failedAttempts: 0, lockedUntil: null };
}

function saveLockoutState(state: LockoutState): void {
  try {
    sessionStorage.setItem('_cap_sec_guard', JSON.stringify(state));
  } catch {
    // fallback
  }
}

/**
 * Calculates SHA-256 hex string using native Web Crypto API
 */
export async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Constant-time string equality check to protect against timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validates whether the authentication is locked out due to repeated failed attempts
 */
export function checkLockoutStatus(): { isLocked: boolean; remainingSeconds: number } {
  const state = getLockoutState();
  if (state.lockedUntil) {
    const now = Date.now();
    if (now < state.lockedUntil) {
      const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    } else {
      // Lockout expired, reset attempts
      saveLockoutState({ failedAttempts: 0, lockedUntil: null });
      return { isLocked: false, remainingSeconds: 0 };
    }
  }
  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * Records a failed login attempt; triggers lockout if threshold reached
 */
export function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number } {
  const state = getLockoutState();
  const newAttempts = state.failedAttempts + 1;
  if (newAttempts >= MAX_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    saveLockoutState({ failedAttempts: newAttempts, lockedUntil });
    return { isLocked: true, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  } else {
    saveLockoutState({ failedAttempts: newAttempts, lockedUntil: null });
    return { isLocked: false, remainingSeconds: 0 };
  }
}

/**
 * Resets brute force guard upon successful authentication
 */
export function resetLockout(): void {
  saveLockoutState({ failedAttempts: 0, lockedUntil: null });
}

/**
 * Cryptographically verifies credentials against master hashes
 * Returns true only if BOTH email and password hash matches with zero plaintext leakage
 */
export async function verifyAdminCredentialsSecure(email: string, pass: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) return false;

  const emailHash = await sha256Hex(cleanEmail);
  const passHash = await sha256Hex(cleanPass);

  const isEmailValid = timingSafeEqual(emailHash, SECURE_ADMIN_EMAIL_HASH);
  const isPassValid = timingSafeEqual(passHash, SECURE_ADMIN_PASS_HASH);

  if (isEmailValid && isPassValid) {
    resetLockout();
    return true;
  }

  recordFailedAttempt();
  return false;
}

/**
 * Sanitizes user input against XSS attacks and HTML injections
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Anonymizes sensitive phone numbers for public display (e.g. 314***8881)
 */
export function maskPhoneNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 7) return '***';
  return clean.slice(0, 3) + '***' + clean.slice(-3);
}
