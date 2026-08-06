import { stripe } from '~/server/utils/stripe';
import { requireAdmin } from '~/server/utils/authz';

interface StripePlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
  trialPeriodDays: number | null;
  active: boolean;
}

interface APISettings {
  stripe: {
    publicKeyMasked: string;
    webhookUrl: string;
  };
}

interface SettingsResponse {
  plans: StripePlan[];
  apiSettings: APISettings;
}

export default defineEventHandler(async (event): Promise<SettingsResponse> => {
  // Verify the user is an admin (custom claim { admin: true })
  // Note: the auth middleware only fills event.context.auth for /api/protected/**,
  // so this endpoint validates its own Bearer token like the rest of /api/admin.
  await requireAdmin(event);
  
  try {
    // Get Stripe plans
    const pricingResponse = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 20,
    });
    
    // Get API settings from runtime config
    const runtimeConfig = useRuntimeConfig();
    const baseUrl = runtimeConfig.public.baseUrl as string;
    
    // Mask sensitive tokens for security
    const maskToken = (token: string) => {
      if (!token) return '';
      return token.substring(0, 6) + '...' + token.substring(token.length - 4);
    };
    
    // Map Stripe prices to plans
    const plans: StripePlan[] = pricingResponse.data
      .filter(price => price.type === 'recurring')
      .map(price => {
        // Access the product through the expanded field
        const product = price.product as any;
        
        return {
          id: price.id,
          name: product.name,
          amount: price.unit_amount || 0,
          currency: price.currency,
          interval: price.recurring?.interval || 'month',
          trialPeriodDays: price.recurring?.trial_period_days || null,
          active: price.active,
        };
      });
    
    // Construct API settings object with masked tokens
    const apiSettings: APISettings = {
      stripe: {
        publicKeyMasked: maskToken(runtimeConfig.public.stripePublicKey as string),
        webhookUrl: `${baseUrl}/api/webhooks/stripe`,
      },
    };
    
    return {
      plans,
      apiSettings,
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch settings',
      data: error,
    });
  }
}); 