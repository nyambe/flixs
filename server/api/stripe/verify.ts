// server/api/stripe/verify.ts
// Confirms a Checkout Session after the success redirect and activates the
// subscription in Firestore. Requires the signed-in user to be the same one
// that started the checkout (#57) — the webhook remains the other writer.
import { stripe } from '~/server/utils/stripe';
import { adminDb } from '~/server/utils/firebase-admin';
import { requireUser } from '~/server/utils/authz';

interface VerifyRequestBody {
  sessionId: string;
}

interface VerifyResponse {
  success: boolean;
}

export default defineEventHandler(async (event): Promise<VerifyResponse> => {
  const user = await requireUser(event);

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

    // The session must belong to the caller
    if (firebaseUid !== user.uid) {
      throw createError({
        statusCode: 403,
        message: 'Session does not belong to the authenticated user',
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
    // Re-throw our own createError responses untouched
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Stripe verify error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to verify payment',
    });
  }
});
