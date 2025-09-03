import { z } from 'zod'
import { adminDb } from '~/server/utils/firebase-admin'
import { sendWelcomeEmail } from '~/server/utils/resend'
import type { H3Error } from 'h3'

const confirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validation = confirmSchema.safeParse(body)
    
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid token',
        data: validation.error.issues,
      })
    }

    const { token } = validation.data

    // Find subscriber by confirmation token
    const newsletterRef = adminDb.collection('newsletter_subscribers')
    const subscriberQuery = await newsletterRef
      .where('confirmationToken', '==', token)
      .where('confirmed', '==', false)
      .get()

    if (subscriberQuery.empty) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invalid or expired confirmation token',
      })
    }

    const subscriberDoc = subscriberQuery.docs[0]
    const subscriberData = subscriberDoc.data()

    // Check if token is not too old (7 days max)
    const tokenAge = Date.now() - subscriberData.lastConfirmationSent.toDate().getTime()
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    
    if (tokenAge > maxAge) {
      throw createError({
        statusCode: 410,
        statusMessage: 'Confirmation token has expired',
      })
    }

    // Update subscriber to confirmed status
    await subscriberDoc.ref.update({
      confirmed: true,
      confirmedAt: new Date(),
      confirmationToken: null, // Remove token after confirmation
      updatedAt: new Date(),
    })

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