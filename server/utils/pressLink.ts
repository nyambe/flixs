import { randomBytes, createHash } from 'node:crypto'
import type { PressLink } from '~/types'

/**
 * Generate a unique, cryptographically secure token for press links
 */
export function generatePressToken(): string {
  const randomString = randomBytes(32).toString('hex')
  const timestamp = Date.now().toString(36)
  return `${randomString}-${timestamp}`
}

/**
 * Hash a password using SHA-256
 * Note: For production, consider using bcrypt or argon2 for stronger hashing
 */
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password)
  return passwordHash === hash
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
