import { z } from 'zod'
import { adminDb } from '~/server/utils/firebase-admin'
import { sendConfirmationEmail } from '~/server/utils/resend'
import type { H3Error } from 'h3'

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional().default('subscription_hero'),
  privacyConsent: z.boolean().refine(val => val === true, 'Privacy consent is required'),
})

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5 // 5 attempts per window
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes in milliseconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

function generateConfirmationToken(): string {
  return crypto.randomUUID() + '-' + Date.now().toString(36)
}

export default defineEventHandler(async (event) => {
  try {
    // Rate limiting
    const clientIP = getClientIP(event, { xForwardedFor: true }) || 'unknown'
    if (!checkRateLimit(clientIP)) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again later.',
      })
    }

    // Validate request body
    const body = await readBody(event)
    const validation = subscribeSchema.safeParse(body)
    
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: validation.error.issues,
      })
    }

    const { email, source, privacyConsent } = validation.data

    // Check if email already exists
    const newsletterRef = adminDb.collection('newsletter_subscribers')
    const existingSubscriber = await newsletterRef.where('email', '==', email).get()
    
    if (!existingSubscriber.empty) {
      const doc = existingSubscriber.docs[0]
      const data = doc.data()
      
      if (data.confirmed) {
        return { 
          success: true, 
          message: 'You are already subscribed to our newsletter.',
          alreadySubscribed: true
        }
      } else {
        // Resend confirmation email for unconfirmed subscribers
        const confirmationToken = generateConfirmationToken()
        await doc.ref.update({
          confirmationToken,
          updatedAt: new Date(),
          lastConfirmationSent: new Date(),
        })
        
        await sendConfirmationEmail(email, confirmationToken)
        
        return { 
          success: true, 
          message: 'Confirmation email sent. Please check your inbox.',
          resent: true
        }
      }
    }

    // Create new subscriber record
    const confirmationToken = generateConfirmationToken()
    const subscriberData = {
      email,
      source,
      privacyConsent,
      consentTimestamp: new Date(),
      confirmed: false,
      confirmationToken,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastConfirmationSent: new Date(),
      ipAddress: clientIP, // For audit purposes
    }

    await newsletterRef.add(subscriberData)

    // Send confirmation email
    await sendConfirmationEmail(email, confirmationToken)

    return {
      success: true,
      message: 'Confirmation email sent. Please check your inbox to complete your subscription.',
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    
    const h3Error = error as H3Error
    if (h3Error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error. Please try again later.',
    })
  }
})