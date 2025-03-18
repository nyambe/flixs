<script setup lang="ts">
  import { useAuth } from '~/composables/useAuth';
  import type { Stripe } from 'stripe';

  // State from useAuth
  const { currentUser } = useAuth();

  // Local state
  const price = ref<Stripe.Price | null>(null);
  const error = ref<string>('');
  const loadingPlan = ref<boolean>(true);
  const loadingCheckout = ref<boolean>(false);

  // Get the plan (priceId) from the URL query
  const route = useRoute();
  const priceId = route.query.plan as string;

  // Fetch price details from Stripe
  const fetchPrice = async () => {
    if (!priceId) {
      error.value = 'No plan specified in the URL.';
      loadingPlan.value = false;
      return;
    }

    try {
      // Fetch all prices and filter (since we don’t have a direct price fetch endpoint yet)
      const prices = await $fetch<Stripe.Price[]>('/api/stripe/prices');
      const selectedPrice = prices.find((p) => p.id === priceId);
      
      if (selectedPrice) {
        price.value = selectedPrice;
      } else {
        error.value = 'Invalid or unavailable plan.';
      }
    } catch (err) {
      error.value = 'Failed to load plan details.';
      console.error('Error fetching price:', err);
    } finally {
      loadingPlan.value = false;
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!currentUser.value) {
      error.value = 'You must be signed in to proceed.';
      return;
    }

    loadingCheckout.value = true;
    error.value = '';

    try {
      // Get Firebase ID token
      const idToken = await currentUser.value.getIdToken();

      // Call the Stripe checkout endpoint
      const response = await $fetch<{ url: string }>('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: { priceId },
      });

      // Redirect to Stripe Checkout
      window.location.href = response.url;
    } catch (err) {
      error.value = 'Failed to initiate checkout. Please try again.';
      console.error('Checkout error:', err);
    } finally {
      loadingCheckout.value = false;
    }
  };

  // Fetch price details on mount
  onMounted(() => {
    fetchPrice();
  });
</script>
<!-- pages/subscription/checkout.vue -->
<template>
  <div class="max-w-md mx-auto mt-16 mb-20">
    <h1 class="text-3xl font-bold text-brand mb-6">Checkout</h1>

    <UAlert v-if="error" color="red" class="mb-4" :title="error" />

    <UCard class="bg-black">
      <template #header>
        <h2 class="text-lg font-semibold text-neutral-content">Subscription Plan</h2>
      </template>

      <div v-if="loadingPlan" class="text-center">
        <USpinner color="brand" />
        <p class="text-neutral-content mt-2">Loading plan details...</p>
      </div>
      <div v-else-if="price" class="space-y-4">
        <p class="text-neutral-content">
          Plan: {{ price.metadata?.name || 'Selected Plan' }}
        </p>
        <p v-if="price.unit_amount" class="text-brand-focus">
          Price: ${{ (price.unit_amount / 100).toFixed(2) }} {{ price.currency.toUpperCase() }}
          {{ price.recurring?.interval ? `/ ${price.recurring.interval}` : '' }}
        </p>
      </div>
      <div v-else>
        <p class="text-support-content">No plan selected or invalid plan ID.</p>
      </div>

      <template #footer>
        <UButton
          v-if="price"
          color="brand"
          variant="solid"
          class="w-full bg-brand text-brand-content hover:bg-brand-focus"
          :loading="loadingCheckout"
          :disabled="loadingCheckout || !currentUser"
          @click="handleCheckout"
        >
          Proceed to Payment
        </UButton>
        <UButton
          v-else
          color="white"
          variant="outline"
          class="w-full"
          to="/subscription/plans"
        >
          Choose a Plan
        </UButton>
      </template>
    </UCard>
  </div>
</template>
