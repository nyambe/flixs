/**
 * URL Builder Utility for Newsletter and Email Links
 * Handles different environments and ensures proper URL composition
 */

const config = useRuntimeConfig()

/**
 * Get the base URL for the current environment
 * Validates and normalizes the URL
 */
export function getBaseUrl(): string {
  let baseUrl = config.public.baseUrl || 'http://localhost:3000'
  
  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/$/, '')
  
  // Validate URL format
  try {
    new URL(baseUrl)
  } catch (error) {
    console.warn(`⚠️ Invalid BASE_URL: ${baseUrl}, falling back to localhost`)
    baseUrl = 'http://localhost:3000'
  }
  
  // Log the URL being used (helpful for debugging)
  console.log(`🌐 Using base URL: ${baseUrl}`)
  
  return baseUrl
}

/**
 * Build newsletter confirmation URL
 */
export function buildConfirmationUrl(token: string): string {
  const baseUrl = getBaseUrl()
  const confirmationUrl = `${baseUrl}/newsletter/confirm?token=${encodeURIComponent(token)}`
  
  console.log(`🔗 Generated confirmation URL: ${confirmationUrl}`)
  return confirmationUrl
}

/**
 * Build newsletter unsubscribe URL
 */
export function buildUnsubscribeUrl(email: string): string {
  const baseUrl = getBaseUrl()
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
  
  console.log(`🔗 Generated unsubscribe URL: ${unsubscribeUrl}`)
  return unsubscribeUrl
}

/**
 * Build general app URLs
 */
export function buildAppUrl(path: string = ''): string {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const appUrl = `${baseUrl}${cleanPath}`
  
  return appUrl
}

/**
 * Validate if we're in production environment
 */
export function isProduction(): boolean {
  const baseUrl = getBaseUrl()
  return baseUrl.startsWith('https://') && !baseUrl.includes('localhost')
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo() {
  const baseUrl = getBaseUrl()
  const isProd = isProduction()
  
  return {
    baseUrl,
    isProduction: isProd,
    environment: isProd ? 'production' : 'development',
    protocol: baseUrl.startsWith('https://') ? 'https' : 'http'
  }
}
