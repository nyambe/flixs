import { z } from 'zod'
import { getHeader } from 'h3'
import { adminDb } from '~/server/utils/firebase-admin'
import { sendConfirmationEmail } from '~/server/utils/resend'
import { validateEnvironmentConfig } from '~/server/utils/env-validation'
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
    console.log('📧 Newsletter subscription attempt started')
    
    // Validate environment configuration
    validateEnvironmentConfig()

    // Rate limiting
    const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
    console.log(`🔍 Client IP: ${clientIP}`)
    
    if (!checkRateLimit(clientIP)) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${clientIP}`)
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again later.',
      })
    }

    // Validate request body
    const body = await readBody(event)
    console.log(`📝 Request body received: ${JSON.stringify({ email: body.email, source: body.source, privacyConsent: body.privacyConsent })}`)
    
    const validation = subscribeSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.error.issues)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: validation.error.issues,
      })
    }

    const { email, source, privacyConsent } = validation.data
    console.log(`✅ Validated subscription for: ${email}`)

    // Check if email already exists
    const newsletterRef = adminDb.collection('newsletter_subscribers')
    console.log('🔍 Checking for existing subscriber...')
    
    const existingSubscriber = await newsletterRef.where('email', '==', email).get()
    
    if (!existingSubscriber.empty) {
      const doc = existingSubscriber.docs[0]
      const data = doc.data()
      console.log(`👤 Existing subscriber found: confirmed=${data.confirmed}`)
      
      if (data.confirmed) {
        console.log('✅ User already confirmed, returning success')
        return { 
          success: true, 
          message: 'You are already subscribed to our newsletter.',
          alreadySubscribed: true
        }
      } else {
        // Resend confirmation email for unconfirmed subscribers
        console.log('📧 Resending confirmation email...')
        const confirmationToken = generateConfirmationToken()
        
        await doc.ref.update({
          confirmationToken,
          updatedAt: new Date(),
          lastConfirmationSent: new Date(),
        })
        
        console.log('💌 Sending confirmation email...')
        await sendConfirmationEmail(email, confirmationToken)
        console.log('✅ Confirmation email resent successfully')
        
        return { 
          success: true, 
          message: 'Confirmation email sent. Please check your inbox.',
          resent: true
        }
      }
    }

    // Create new subscriber record
    console.log('🆕 Creating new subscriber record...')
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

    console.log('💾 Saving subscriber to Firebase...')
    await newsletterRef.add(subscriberData)
    console.log('✅ Subscriber saved successfully')

    // Send confirmation email
    console.log('💌 Sending confirmation email...')
    await sendConfirmationEmail(email, confirmationToken)
    console.log('✅ Newsletter subscription process completed successfully')

    return {
      success: true,
      message: 'Confirmation email sent. Please check your inbox to complete your subscription.',
    }

  } catch (error) {
    console.error('❌ Newsletter subscription error:', error)
    
    // Log additional details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    const h3Error = error as H3Error
    if (h3Error.statusCode) {
      console.error(`HTTP Error ${h3Error.statusCode}: ${h3Error.statusMessage}`)
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error. Please try again later.',
    })
  }
})