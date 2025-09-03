import { z } from 'zod'
import { adminDb } from '~/server/utils/firebase-admin'
import type { H3Error } from 'h3'

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validation = unsubscribeSchema.safeParse(body)
    
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email address',
        data: validation.error.issues,
      })
    }

    const { email } = validation.data

    // Find subscriber by email
    const newsletterRef = adminDb.collection('newsletter_subscribers')
    const subscriberQuery = await newsletterRef
      .where('email', '==', email)
      .get()

    if (subscriberQuery.empty) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Email not found in our newsletter list',
      })
    }

    // Update subscriber to unsubscribed status
    const subscriberDoc = subscriberQuery.docs[0]
    await subscriberDoc.ref.update({
      confirmed: false,
      unsubscribed: true,
      unsubscribedAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.',
    }

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    
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