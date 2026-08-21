// server/api/stripe/products.ts
import type Stripe from 'stripe';
import { stripe } from '~/server/utils/stripe';
// Define the shape of a Product with Prices
interface ProductWithPrices extends Stripe.Product {
  prices: Stripe.Price[];
}

export default defineEventHandler(async (event): Promise<ProductWithPrices[]> => {
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