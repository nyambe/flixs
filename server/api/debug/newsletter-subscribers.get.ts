import { adminDb } from '~/server/utils/firebase-admin'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 Fetching all newsletter subscribers for debugging...')
    
    const newsletterRef = adminDb.collection('newsletter_subscribers')
    const allSubscribers = await newsletterRef.limit(10).get()
    
    console.log(`📊 Found ${allSubscribers.size} subscribers in database`)
    
    const subscribers = allSubscribers.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        email: data.email,
        confirmed: data.confirmed,
        hasConfirmationToken: !!data.confirmationToken,
        tokenPreview: data.confirmationToken ? data.confirmationToken.substring(0, 20) + '...' : null,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
        lastConfirmationSent: data.lastConfirmationSent?.toDate?.()?.toISOString?.() || null,
      }
    })
    
    return {
      success: true,
      count: allSubscribers.size,
      subscribers
    }
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch subscribers',
    })
  }
})
