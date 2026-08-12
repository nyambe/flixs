import { randomBytes, createHash, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { PressLink } from '~/types'

/**
 * Generate a unique, cryptographically secure token for press links
 */
export function generatePressToken(): string {
  const randomString = randomBytes(32).toString('hex')
  const timestamp = Date.now().toString(36)
  return `${randomString}-${timestamp}`
}

const BCRYPT_ROUNDS = 12

/**
 * Hash a password using bcrypt
 */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verify a password against a hash.
 * Supports the legacy unsalted SHA-256 hashes (64 hex chars) of press links
 * created before the bcrypt migration; new hashes are always bcrypt ($2…).
 */
export function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith('$2')) {
    return bcrypt.compare(password, hash)
  }

  // Legacy SHA-256 fallback
  const legacyHash = createHash('sha256').update(password).digest('hex')
  const a = Buffer.from(legacyHash)
  const b = Buffer.from(hash)
  return Promise.resolve(a.length === b.length && timingSafeEqual(a, b))
}

/**
 * Check if a press link has expired
 */
export function isLinkExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt
}

/**
 * Check if a press link is valid (exists, active, and not expired)
 */
export function isLinkValid(link: PressLink | null): { valid: boolean; reason?: string } {
  if (!link) {
    return { valid: false, reason: 'Link not found' }
  }

  if (!link.active) {
    return { valid: false, reason: 'Link has been deactivated' }
  }

  if (isLinkExpired(link.expiresAt)) {
    return { valid: false, reason: 'Link has expired' }
  }

  return { valid: true }
}

/**
 * Hash an IP address for privacy (stores only first 3 octets + hash)
 */
export function hashIpAddress(ip: string): string {
  // For IPv4, keep first 3 octets and hash the last one
  const parts = ip.split('.')
  if (parts.length === 4) {
    const visiblePart = parts.slice(0, 3).join('.')
    const hashedPart = createHash('sha256').update(parts[3]).digest('hex').substring(0, 8)
    return `${visiblePart}.${hashedPart}`
  }

  // For IPv6 or other formats, hash the entire IP
  return createHash('sha256').update(ip).digest('hex').substring(0, 16)
}

/**
 * Get a safe expiration date (max 90 days from now)
 */
export function getSafeExpirationDate(requestedDate: number): number {
  const maxDays = 90
  const maxExpiration = Date.now() + (maxDays * 24 * 60 * 60 * 1000)

  return Math.min(requestedDate, maxExpiration)
}

/**
 * Format expiration date for display
 */
export function formatExpirationDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
