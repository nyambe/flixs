import { z } from 'zod'
import { adminDb } from '~/server/utils/firebase-admin'
import { sendWelcomeEmail } from '~/server/utils/resend'
import type { H3Error } from 'h3'

const confirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export default defineEventHandler(async (event) => {
  try {
    console.log('📧 Newsletter confirmation attempt started')
    const body = await readBody(event)
    console.log('📝 Request body received:', { token: body.token?.substring(0, 20) + '...' })
    
    const validation = confirmSchema.safeParse(body)
    
    if (!validation.success) {
      console.error('❌ Token validation failed:', validation.error.issues)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid token',
        data: validation.error.issues,
      })
    }

    const { token } = validation.data
    console.log('✅ Token validated:', token.substring(0, 20) + '...')

    // Find subscriber by confirmation token
    const newsletterRef = adminDb.collection('newsletter_subscribers')
    console.log('🔍 Searching for subscriber with token...')
    
    const subscriberQuery = await newsletterRef
      .where('confirmationToken', '==', token)
      .where('confirmed', '==', false)
      .get()

    console.log(`📊 Query results: ${subscriberQuery.size} documents found`)
    
    if (subscriberQuery.empty) {
      // Let's also check if there's a confirmed user with this token
      const confirmedQuery = await newsletterRef
        .where('confirmationToken', '==', token)
        .get()
      
      console.log(`📊 Confirmed query results: ${confirmedQuery.size} documents found`)
      
      if (!confirmedQuery.empty) {
        const doc = confirmedQuery.docs[0]
        const data = doc.data()
        console.log('👤 Found confirmed subscriber:', { email: data.email, confirmed: data.confirmed })
        
        if (data.confirmed) {
          return {
            success: true,
            message: 'Email already confirmed. You can now complete your registration.',
            email: data.email,
            alreadyConfirmed: true
          }
        }
      }
      
      console.error('❌ No subscriber found with token:', token.substring(0, 20) + '...')
      throw createError({
        statusCode: 404,
        statusMessage: 'Invalid or expired confirmation token',
      })
    }

    const subscriberDoc = subscriberQuery.docs[0]
    const subscriberData = subscriberDoc.data()
    console.log('👤 Found subscriber:', { email: subscriberData.email, confirmed: subscriberData.confirmed })

    // Check if token is not too old (7 days max)
    const tokenAge = Date.now() - subscriberData.lastConfirmationSent.toDate().getTime()
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    
    console.log(`⏰ Token age: ${Math.round(tokenAge / (1000 * 60 * 60))} hours (max: ${Math.round(maxAge / (1000 * 60 * 60))} hours)`)
    
    if (tokenAge > maxAge) {
      console.error('❌ Token expired')
      throw createError({
        statusCode: 410,
        statusMessage: 'Confirmation token has expired',
      })
    }

    // Update subscriber to confirmed status
    console.log('✅ Confirming subscriber...')
    await subscriberDoc.ref.update({
      confirmed: true,
      confirmedAt: new Date(),
      confirmationToken: null, // Remove token after confirmation
      updatedAt: new Date(),
    })
    console.log('✅ Subscriber confirmed successfully')

    // Send welcome email
    try {
      await sendWelcomeEmail(subscriberData.email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the confirmation if welcome email fails
    }

    return {
      success: true,
      message: 'Email confirmed successfully! Welcome to MOABA Cinema TV.',
      email: subscriberData.email,
    }

  } catch (error) {
    console.error('Newsletter confirmation error:', error)
    
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