// server/api/stripe/products.ts
import Stripe from 'stripe';
// Define the shape of a Product with Prices
interface ProductWithPrices extends Stripe.Product {
  prices: Stripe.Price[];
}

export default defineEventHandler(async (event): Promise<ProductWithPrices[]> => {
  const runtimeConfig = useRuntimeConfig();
  const stripe = new Stripe(runtimeConfig.stripe.secretKey as string, {
    apiVersion: '2024-04-10',
    typescript: true, // Ensures TypeScript compatibility
  });

  try {
    // Fetch products
    const products = await stripe.products.list({
      limit: 10,
    });

    // Fetch prices for each product
    const productsWithPrices: ProductWithPrices[] = await Promise.all(
      products.data.map(async (product: Stripe.Product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });
        return {
          ...product,
          prices: prices.data,
        };
      })
    );

    return productsWithPrices;
  } catch (error) {
    console.error('Stripe error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to retrieve products',
      data: error,
    });
  }
});