<script setup lang="ts">
  import { useAuth } from '~/composables/useAuth';
  import { useI18n } from 'vue-i18n';
  import type { Stripe } from 'stripe';

  // Initialize i18n
  const { t } = useI18n();

  // State from useAuth
  const { currentUser, register, signIn } = useAuth();

  // Local state
  const price = ref<Stripe.Price | null>(null);
  const error = ref<string>('');
  const loadingPlan = ref<boolean>(true);
  const loadingCheckout = ref<boolean>(false);
  const loadingAuth = ref<boolean>(false);
  
  // Auth form state
  const authMode = ref<'login' | 'signup'>('login');
  const email = ref<string>('');
  const password = ref<string>('');
  const confirmPassword = ref<string>('');
  const name = ref<string>('');
  const authError = ref<string>('');

  // Get the plan (priceId) from the URL query
  const route = useRoute();
  const priceId = route.query.plan as string;

  // Toggle between login and signup forms
  const toggleAuthMode = () => {
    authMode.value = authMode.value === 'login' ? 'signup' : 'login';
    authError.value = '';
  };

  // Handle authentication
  const handleAuth = async () => {
    authError.value = '';
    
    if (!email.value || !password.value) {
      authError.value = t('Please fill in all fields');
      return;
    }

    if (authMode.value === 'signup' && password.value !== confirmPassword.value) {
      authError.value = t('Passwords do not match');
      return;
    }

    loadingAuth.value = true;

    try {
      if (authMode.value === 'signup') {
        await register(email.value, password.value, name.value || email.value);
      } else {
        await signIn(email.value, password.value);
      }
      // After successful auth, clear form
      email.value = '';
      password.value = '';
      confirmPassword.value = '';
      name.value = '';
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('Authentication failed');
      authError.value = errorMessage;
      console.error('Auth error:', err);
    } finally {
      loadingAuth.value = false;
    }
  };

  // Fetch price details from Stripe
  const fetchPrice = async () => {
    if (!priceId) {
      error.value = t('No plan specified in the URL.');
      loadingPlan.value = false;
      return;
    }

    try {
      // Fetch all prices and filter (since we don't have a direct price fetch endpoint yet)
      const prices = await $fetch<Stripe.Price[]>('/api/stripe/prices');
      const selectedPrice = prices.find((p) => p.id === priceId);
      
      if (selectedPrice) {
        price.value = selectedPrice;
      } else {
        error.value = t('Invalid or unavailable plan.');
      }
    } catch (err) {
      error.value = t('Failed to load plan details.');
      console.error('Error fetching price:', err);
    } finally {
      loadingPlan.value = false;
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!currentUser.value) {
      error.value = t('You must be signed in to proceed.');
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
      error.value = t('Failed to initiate checkout. Please try again.');
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
    <h1 class="text-3xl font-bold text-brand mb-6">{{ t('Checkout') }}</h1>

    <UAlert v-if="error" color="red" class="mb-4" :title="error" />

    <!-- Authentication Card (shown if user is not logged in) -->
    <UCard v-if="!currentUser" class="bg-black mb-6">
      <template #header>
        <h2 class="text-lg font-semibold text-neutral-content">
          {{ authMode === 'login' ? t('Sign In') : t('Create Account') }}
        </h2>
      </template>

      <div class="space-y-4">
        <UAlert v-if="authError" color="red" class="mb-4" :title="authError" />

        <UFormGroup :label="t('Email')" required>
          <UInput v-model="email" type="email" placeholder="email@example.com" />
        </UFormGroup>

        <UFormGroup v-if="authMode === 'signup'" :label="t('Name')">
          <UInput v-model="name" type="text" placeholder="Your name (optional)" />
        </UFormGroup>

        <UFormGroup :label="t('Password')" required>
          <UInput v-model="password" type="password" />
        </UFormGroup>

        <UFormGroup v-if="authMode === 'signup'" :label="t('Confirm Password')" required>
          <UInput v-model="confirmPassword" type="password" />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="space-y-4">
          <UButton
            color="brand"
            variant="solid"
            class="w-full bg-brand text-brand-content hover:bg-brand-focus"
            :loading="loadingAuth"
            @click="handleAuth"
          >
            {{ authMode === 'login' ? t('Sign In') : t('Create Account') }}
          </UButton>
          
          <p class="text-center text-sm text-neutral-content">
            {{ authMode === 'login' ? t('Don\'t have an account?') : t('Already have an account?') }}
            <UButton
              variant="link"
              class="text-brand"
              @click="toggleAuthMode"
            >
              {{ authMode === 'login' ? t('Sign Up') : t('Sign In') }}
            </UButton>
          </p>
        </div>
      </template>
    </UCard>

    <UCard class="bg-black">
      <template #header>
        <h2 class="text-lg font-semibold text-neutral-content">{{ t('Subscription Plan') }}</h2>
      </template>

      <div v-if="loadingPlan" class="text-center">
        <USpinner color="brand" />
        <p class="text-neutral-content mt-2">{{ t('Loading plan details...') }}</p>
      </div>
      <div v-else-if="price" class="space-y-4">
        <p class="text-neutral-content">
          {{ t('Plan') }}: {{ price.metadata?.name || t('Selected Plan') }}
        </p>
        <p v-if="price.unit_amount" class="text-brand-focus">
          {{ t('Price') }}: ${{ (price.unit_amount / 100).toFixed(2) }} {{ price.currency.toUpperCase() }}
          {{ price.recurring?.interval ? `/ ${price.recurring.interval}` : '' }}
        </p>
      </div>
      <div v-else>
        <p class="text-support-content">{{ t('No plan selected or invalid plan ID.') }}</p>
      </div>

      <template #footer>
        <UButton
          v-if="price && currentUser"
          color="brand"
          variant="solid"
          class="w-full bg-brand text-brand-content hover:bg-brand-focus"
          :loading="loadingCheckout"
          :disabled="loadingCheckout"
          @click="handleCheckout"
        >
          {{ t('Proceed to Payment') }}
        </UButton>
        <UButton
          v-else-if="!price"
          color="white"
          variant="outline"
          class="w-full"
          to="/subscription/plans"
        >
          {{ t('Choose a Plan') }}
        </UButton>
      </template>
    </UCard>
  </div>
</template>
