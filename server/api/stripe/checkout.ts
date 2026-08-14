// server/api/stripe/checkout.ts
// Creates a Stripe Checkout Session for one of the known subscription plans.
// priceId is validated against the configured plans (#57).
import { stripe } from '~/server/utils/stripe';
import { requireUser } from '~/server/utils/authz';

interface CheckoutRequestBody {
  priceId: string; // The Stripe Price ID selected by the user
}

interface CheckoutResponse {
  url: string; // The Stripe Checkout URL
}

export default defineEventHandler(async (event): Promise<CheckoutResponse> => {
  const runtimeConfig = useRuntimeConfig();

  const user = await requireUser(event);

  // Parse the request body to get the priceId
  const body = await readBody<CheckoutRequestBody>(event);
  const { priceId } = body;
  if (!priceId) {
    throw createError({
      statusCode: 400,
      message: 'Missing priceId in request body',
    });
  }

  // Only the configured plans can be purchased
  const stripePublic = runtimeConfig.public.stripe as Record<string, string>;
  const allowedPriceIds = [
    stripePublic.basicPriceId,
    stripePublic.premiumPriceId,
    stripePublic.educationPriceId,
  ].filter(Boolean);

  if (!allowedPriceIds.includes(priceId)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid priceId',
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
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    console.error('Stripe error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to create checkout session',
    });
  }
});
