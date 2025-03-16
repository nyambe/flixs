import { createOrRetrieveStripeCustomer, createSubscription } from '~/server/utils/stripe'

export default defineEventHandler(async (event) => {
  try {
    const { priceId, paymentMethodId } = await readBody(event)
    const { uid, email } = event.context.auth

    if (!priceId || !paymentMethodId) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters'
      })
    }

    // Get or create Stripe customer
    const customerId = await createOrRetrieveStripeCustomer(uid, email)

    // Create the subscription
    const subscription = await createSubscription(
      customerId,
      priceId,
      paymentMethodId
    )

    return subscription
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Error creating subscription'
    })
  }
}) 