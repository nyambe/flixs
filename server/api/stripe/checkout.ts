// server/api/stripe/checkout.ts
import Stripe from 'stripe';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

interface CheckoutRequestBody {
  priceId: string; // The Stripe Price ID selected by the user
}

interface CheckoutResponse {
  url: string; // The Stripe Checkout URL
}

export default defineEventHandler(async (event): Promise<CheckoutResponse> => {
  const runtimeConfig = useRuntimeConfig();
  const stripe = new Stripe(runtimeConfig.stripe.secretKey as string, {
    apiVersion: '2024-04-10',
    typescript: true,
  });

  // Get the Firebase ID token from the Authorization header
  const authHeader = getRequestHeader(event, 'Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: Missing or invalid Authorization header',
    });
  }
  const idToken = authHeader.split('Bearer ')[1];

  // Verify the Firebase ID token
  let user;
  try {
    user = await getAuth().verifyIdToken(idToken);
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: Invalid Firebase ID token',
    });
  }

  // Parse the request body to get the priceId
  const body = await readBody<CheckoutRequestBody>(event);
  const { priceId } = body;
  if (!priceId) {
    throw createError({
      statusCode: 400,
      message: 'Missing priceId in request body',
    });
  }

  try {
    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',           // For recurring payments (subscriptions)
      payment_method_types: ['card'], // Accept card payments
      line_items: [
        {
          price: priceId,            // The selected plan’s price ID
          quantity: 1,
        },
      ],
      customer_email: user.email,    // Pre-fill with the user’s email
      success_url: `${runtimeConfig.public.baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${runtimeConfig.public.baseUrl}/subscription/plans`, // Redirect back if canceled
      metadata: {
        firebaseUid: user.uid,       // Store the user’s Firebase UID for later use
      },
    });

    if (!session.url) {
      throw createError({
        statusCode: 500,
        message: 'Failed to create checkout session URL',
      });
    }

    return { url: session.url };
  } catch (error) {
    console.error('Stripe error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to create checkout session',
      data: error,
    });
  }
});