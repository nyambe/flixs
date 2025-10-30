<script setup lang="ts">
  import { useAuth } from '~/composables/useAuth';
  import { useI18n } from 'vue-i18n';
  import type { Stripe } from 'stripe';
  import * as z from 'zod';
  import type { FormSubmitEvent } from '@nuxt/ui';

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
  
  // Auth form schema
  const loginSchema = z.object({
    email: z.string().email(t('Invalid email')),
    password: z.string().min(1, t('Password is required'))
  });

  const signupSchema = z.object({
    email: z.string().email(t('Invalid email')),
    name: z.string().optional(),
    password: z.string().min(8, t('Password must be at least 8 characters')),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('Passwords do not match'),
    path: ['confirmPassword']
  });
  
  // Auth form state
  const authMode = ref<'login' | 'signup'>('login');
  const loginState = reactive({
    email: '',
    password: ''
  });
  const signupState = reactive({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
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
  const handleLogin = async (event: FormSubmitEvent<typeof loginState>) => {
    authError.value = '';
    loadingAuth.value = true;
    
    try {
      const result = await signIn(event.data.email, event.data.password);
      
      if (!result.success) {
        authError.value = result.error || t('Authentication failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('Authentication failed');
      authError.value = errorMessage;
      console.error('Auth error:', err);
    } finally {
      loadingAuth.value = false;
    }
  };

  const handleSignup = async (event: FormSubmitEvent<typeof signupState>) => {
    authError.value = '';
    loadingAuth.value = true;
    
    try {
      const result = await register(
        event.data.email, 
        event.data.password, 
        event.data.name || event.data.email
      );
      
      if (!result.success) {
        authError.value = result.error || t('Registration failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('Registration failed');
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
    <UCard class="mb-6">
      <template #header>
        <h1 class="text-3xl font-bold">{{ t('Checkout') }}</h1>
      </template>

      <UAlert v-if="error" color="error" class="mb-4" :title="error" />

      <!-- Authentication Card (shown if user is not logged in) -->
      <UCard v-if="!currentUser" class="mb-6">
        <template #header>
          <h2 class="text-xl font-bold">
            {{ authMode === 'login' ? t('Sign In') : t('Create Account') }}
          </h2>
        </template>

        <UAlert v-if="authError" color="error" class="mb-4" :title="authError" />

        <!-- Login Form -->
        <UForm 
          v-if="authMode === 'login'"
          :schema="loginSchema" 
          :state="loginState" 
          @submit="handleLogin"
          class="space-y-4"
        >
          <UFormField 
            :label="t('Email')" 
            name="email"
            required
          >
            <UInput
              v-model="loginState.email"
              type="email"
              placeholder="email@example.com"
            />
          </UFormField>

          <UFormField 
            :label="t('Password')" 
            name="password"
            required
          >
            <UInput
              v-model="loginState.password"
              type="password"
              placeholder="********"
            />
          </UFormField>

          <div class="pt-4">
            <UButton
              type="submit"
              color="primary"
              :loading="loadingAuth"
              :disabled="loadingAuth"
              block
            >
              {{ t('Sign In') }}
            </UButton>
          </div>
        </UForm>

        <!-- Signup Form -->
        <UForm 
          v-else
          :schema="signupSchema" 
          :state="signupState" 
          @submit="handleSignup"
          class="space-y-4"
        >
          <UFormField 
            :label="t('Email')" 
            name="email"
            required
          >
            <UInput
              v-model="signupState.email"
              type="email"
              placeholder="email@example.com"
            />
          </UFormField>

          <UFormField 
            :label="t('Name')" 
            name="name"
          >
            <UInput
              v-model="signupState.name"
              type="text"
              placeholder="Your name (optional)"
            />
          </UFormField>

          <UFormField 
            :label="t('Password')" 
            name="password"
            required
          >
            <UInput
              v-model="signupState.password"
              type="password"
              placeholder="********"
            />
          </UFormField>

          <UFormField 
            :label="t('Confirm Password')" 
            name="confirmPassword"
            required
          >
            <UInput
              v-model="signupState.confirmPassword"
              type="password"
              placeholder="********"
            />
          </UFormField>

          <div class="pt-4">
            <UButton
              type="submit"
              color="primary"
              :loading="loadingAuth"
              :disabled="loadingAuth"
              block
            >
              {{ t('Create Account') }}
            </UButton>
          </div>
        </UForm>

        <div class="text-center mt-4">
          <p class="text-(--ui-text-muted) text-sm">
            {{ authMode === 'login' ? t('Don\'t have an account?') : t('Already have an account?') }}
            <UButton
              variant="link"
              color="primary"
              @click="toggleAuthMode"
            >
              {{ authMode === 'login' ? t('Sign Up') : t('Sign In') }}
            </UButton>
          </p>
        </div>
      </UCard>

      <UCard class="mt-6">
        <template #header>
          <h2 class="text-xl font-bold">{{ t('Subscription Plan') }}</h2>
        </template>

        <div v-if="loadingPlan" class="text-center py-4">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-(--ui-primary) mx-auto" />
          <p class="mt-2 text-(--ui-text-muted)">{{ t('Loading plan details...') }}</p>
        </div>
        <div v-else-if="price" class="space-y-4 py-4">
          <p class="text-(--ui-text)">
            {{ t('Plan') }}: {{ price.metadata?.name || t('Selected Plan') }}
          </p>
          <p v-if="price.unit_amount" class="text-(--ui-primary) font-semibold">
            {{ t('Price') }}: ${{ (price.unit_amount / 100).toFixed(2) }} {{ price.currency.toUpperCase() }}
            {{ price.recurring?.interval ? `/ ${price.recurring.interval}` : '' }}
          </p>
        </div>
        <div v-else class="py-4">
          <p class="text-(--ui-text-muted)">{{ t('No plan selected or invalid plan ID.') }}</p>
        </div>

        <div class="mt-6">
          <UButton
            v-if="price && currentUser"
            color="primary"
            :loading="loadingCheckout"
            :disabled="loadingCheckout"
            block
            @click="handleCheckout"
          >
            {{ t('Proceed to Payment') }}
          </UButton>
          <UButton
            v-else-if="!price"
            color="neutral"
            variant="outline"
            block
            to="/subscription/plans"
          >
            {{ t('Choose a Plan') }}
          </UButton>
        </div>
      </UCard>
    </UCard>
  </div>
</template>
