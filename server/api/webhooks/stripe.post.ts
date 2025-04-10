import { stripe } from '~/server/utils/stripe'
import { adminDb } from '~/server/utils/firebase-admin'
import type { Stripe } from 'stripe'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event)
  const signature = getHeader(event, 'stripe-signature')

  if (!body || !signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw createError({
      statusCode: 400,
      message: 'Missing required webhook parameters'
    })
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    throw createError({
      statusCode: 400,
      message: 'Invalid webhook signature'
    })
  }

  const subscription = stripeEvent.data.object as Stripe.Subscription
  const customerId = subscription.customer as string

  // Get Firebase user ID from Stripe customer metadata
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  const firebaseUserId = customer.metadata.firebaseUserId

  if (!firebaseUserId) {
    throw createError({
      statusCode: 400,
      message: 'No Firebase user ID found in customer metadata'
    })
  }

  const userRef = adminDb.collection('users').doc(firebaseUserId)

  switch (stripeEvent.type) {
    case 'customer.subscription.created':
      await userRef.update({
        subscription: {
          active: true,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          priceId: subscription.items.data[0].price.id,
          currentPeriodEnd: subscription.current_period_end,
          status: subscription.status,
          subscriptionType: subscription.items.data[0].price.recurring?.interval || 'monthly',
          updatedAt: new Date().toISOString()
        }
      })
      break

    case 'customer.subscription.updated':
      await userRef.update({
        subscription: {
          active: subscription.status === 'active',
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          priceId: subscription.items.data[0].price.id,
          currentPeriodEnd: subscription.current_period_end,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          subscriptionType: subscription.items.data[0].price.recurring?.interval || 'monthly',
          updatedAt: new Date().toISOString()
        }
      })
      break

    case 'customer.subscription.deleted':
      await userRef.update({
        subscription: {
          active: false,
          stripeSubscriptionId: null,
          stripeCustomerId: customerId,
          priceId: null,
          currentPeriodEnd: null,
          status: 'canceled',
          cancelAtPeriodEnd: null,
          subscriptionType: null,
          updatedAt: new Date().toISOString()
        }
      })
      break

    default:
      console.log(`Unhandled event type ${stripeEvent.type}`)
  }

  return { received: true }
}) 