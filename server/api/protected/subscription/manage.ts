import { adminDb } from '~/server/utils/firebase-admin'
import { cancelSubscription, retrieveSubscription } from '~/server/utils/stripe'

export default defineEventHandler(async (event) => {
  const { uid } = event.context.auth

  if (event.method === 'GET') {
    try {
      // Get user's subscription data from Firestore
      const userDoc = await adminDb.collection('users').doc(uid).get()
      const userData = userDoc.data()

      if (!userData?.subscriptionId) {
        return { status: 'no_subscription' }
      }

      const subscription = await retrieveSubscription(userData.subscriptionId)
      return {
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: subscription.items.data[0].price.id
      }
    } catch (error) {
      console.error('Error retrieving subscription:', error)
      throw createError({
        statusCode: 500,
        message: 'Error retrieving subscription'
      })
    }
  }

  if (event.method === 'DELETE') {
    try {
      const userDoc = await adminDb.collection('users').doc(uid).get()
      const userData = userDoc.data()

      if (!userData?.subscriptionId) {
        throw createError({
          statusCode: 400,
          message: 'No active subscription found'
        })
      }

      await cancelSubscription(userData.subscriptionId)
      
      // Update user document
      await adminDb.collection('users').doc(uid).update({
        subscriptionStatus: 'canceled'
      })

      return { status: 'canceled' }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw createError({
        statusCode: 500,
        message: 'Error canceling subscription'
      })
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed'
  })
}) 