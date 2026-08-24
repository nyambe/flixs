// server/api/stripe/prices.ts
import type Stripe from 'stripe';
import { stripe } from '~/server/utils/stripe';
// Define the shape of the response (just prices for now)
type PriceResponse = Stripe.Price[];

export default defineEventHandler(async (event): Promise<PriceResponse> => {
  const runtimeConfig = useRuntimeConfig();

  // Get the product ID from runtimeConfig (loaded from .env)
  const productId = runtimeConfig.stripe.productId as string;
  if (!productId) {
    throw createError({
      statusCode: 400,
      message: 'Product ID is not configured in environment variables',
    });
  }

  try {
    // Fetch prices for the specific product
    const prices = await stripe.prices.list({
      product: productId, // Filter by the specific product ID
      active: true,       // Only return active prices
      limit: 10,          // Optional: limit the number of prices returned
    });

    return prices.data; // Return the array of prices
  } catch (error) {
    console.error('Stripe error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to retrieve prices',
      data: error,
    });
  }
});