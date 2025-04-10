// server/api/stripe-verify.ts
import Stripe from 'stripe';
import { adminDb } from '~/server/utils/firebase-admin';

interface VerifyRequestBody {
  sessionId: string;
}

interface VerifyResponse {
  success: boolean;
}

export default defineEventHandler(async (event): Promise<VerifyResponse> => {
  const runtimeConfig = useRuntimeConfig();
  const stripe = new Stripe(runtimeConfig.stripe.secretKey as string, {
    apiVersion: '2025-02-24.acacia', // Updated to latest version
    typescript: true,
  });
 

  const body = await readBody<VerifyRequestBody>(event);
  const { sessionId } = body;

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Missing sessionId',
    });
  }

  try {
    // Retrieve the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const firebaseUid = session.metadata?.firebaseUid;

    if (!firebaseUid) {
      throw createError({
        statusCode: 400,
        message: 'Invalid session: Missing Firebase UID',
      });
    }

    if (session.payment_status !== 'paid' || !session.subscription) {
      throw createError({
        statusCode: 400,
        message: 'Payment not completed or subscription not created',
      });
    }

    // Update Firestore with subscription status using admin SDK
    await adminDb.doc(`users/${firebaseUid}`).set({
      subscription: {
        active: true,
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
        updatedAt: new Date().toISOString(),
        status: 'active',
        subscriptionType: session.mode === 'subscription' ? 'monthly' : 'education' // Default to monthly for subscription mode
      },
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Stripe verify error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to verify payment',
      data: error,
    });
  }
});