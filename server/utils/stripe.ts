import Stripe from 'stripe'
import { adminDb } from './firebase-admin'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia'
})

export const subscriptionPlans = {
  basic: {
    name: 'Basic Plan',
    price: 9.99,
    features: ['HD streaming', 'Watch on 1 device', 'Limited movie library']
  },
  premium: {
    name: 'Premium Plan',
    price: 19.99,
    features: ['4K streaming', 'Watch on 4 devices', 'Full movie library', 'Early access']
  }
}

export async function createOrRetrieveStripeCustomer(userId: string, email: string) {
  const userRef = adminDb.collection('users').doc(userId)
  const userDoc = await userRef.get()
  
  if (userDoc.exists) {
    const userData = userDoc.data()
    if (userData?.stripeCustomerId) {
      return userData.stripeCustomerId
    }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      firebaseUserId: userId
    }
  })

  // Update user document with Stripe customer ID
  await userRef.set({
    stripeCustomerId: customer.id,
    email
  }, { merge: true })

  return customer.id
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId: string
) {
  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent'],
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.cancel(subscriptionId)
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export async function retrieveSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    throw error
  }
} 