import { stripe } from '~/server/utils/stripe'
import { adminDb } from '~/server/utils/firebase-admin'
import type { Stripe } from 'stripe'

interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  lastLogin: string | null;
  createdAt: string;
  subscription: {
    active: boolean;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    priceId?: string;
    currentPeriodEnd?: number;
    status?: string;
    cancelAtPeriodEnd?: boolean;
    updatedAt?: string;
    subscriptionType?: 'monthly' | 'yearly' | 'education';
  } | null;
}

// Helper function to determine subscription type
const determineSubscriptionType = async (priceId: string): Promise<'monthly' | 'yearly' | 'education'> => {
  try {
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product']
    });
    
    const interval = price.recurring?.interval || 'month';
    const unitAmount = price.unit_amount || 0;
    const product = price.product as Stripe.Product;
    const metadata = product.metadata || {};
    
    // Check if it's an education plan based on metadata or price
    if (metadata.type === 'education' || 
        (interval === 'year' && unitAmount >= 1000)) { // 10000 in cents = $100
      return 'education';
    }
    
    // Otherwise, determine by interval
    return interval === 'month' ? 'monthly' : 'yearly';
  } catch (error) {
    console.error('Error determining subscription type:', error);
    return 'monthly'; // Default to monthly if there's an error
  }
};

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
  const priceId = subscription.items.data[0].price.id;
  let subscriptionType: 'monthly' | 'yearly' | 'education' | null = null;
  
  switch (stripeEvent.type) {
    case 'customer.subscription.created':
      subscriptionType = await determineSubscriptionType(priceId);
      await userRef.update({
        subscription: {
          active: true,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          priceId: priceId,
          currentPeriodEnd: subscription.current_period_end,
          status: subscription.status,
          subscriptionType: subscriptionType,
          updatedAt: new Date().toISOString()
        }
      });
      break;

    case 'customer.subscription.updated':
      subscriptionType = await determineSubscriptionType(priceId);
      await userRef.update({
        subscription: {
          active: subscription.status === 'active',
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          priceId: priceId,
          currentPeriodEnd: subscription.current_period_end,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          subscriptionType: subscriptionType,
          updatedAt: new Date().toISOString()
        }
      });
      break;

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
      });
      break;

    default:
      console.log(`Unhandled event type ${stripeEvent.type}`)
  }

  return { received: true }
}) 