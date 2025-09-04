// pages/auth/register.vue
<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { doc, setDoc } from 'firebase/firestore';

const { t } = useI18n();
const { register } = useAuth();

const schema = z.object({
  name: z.string().min(1, t('Name is required')),
  email: z.string().email(t('Invalid email address')),
  birthDate: z.string().optional(),
  phoneNumber: z.string().optional(),
  country: z.string().min(1, t('Country is required')),
  password: z.string().min(8, t('Password must be at least 8 characters')),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: t('You must accept the terms and conditions')
  }),
  humanVerification: z.boolean().refine(val => val === true, {
    message: t('Please verify that you are human')
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: t('Passwords do not match'),
  path: ['confirmPassword']
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  name: '',
  email: '',
  birthDate: '',
  phoneNumber: '',
  country: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
  humanVerification: false
});

const countries = [
  { value: 'ES', label: 'España' },
  { value: 'AO', label: 'Angola' },
  { value: 'PT', label: 'Portugal' },
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
];

const error = ref('');
const loading = ref(false);
const verificationQuestion = ref('');
const verificationAnswer = ref('');

// Simple human verification questions
const verificationQuestions = [
  { question: t('What is 2 + 2?'), answer: '4' },
  { question: t('What is the color of the sky?'), answer: 'blue' },
  { question: t('How many days are in a week?'), answer: '7' },
  { question: t('What comes after the letter A?'), answer: 'b' },
  { question: t('Is fire hot or cold?'), answer: 'hot' }
];

// Pre-fill email from URL query parameter and set verification question
onMounted(() => {
  // Handle email pre-fill from URL query parameter (e.g., from newsletter)
  const route = useRoute();
  if (route.query.email && typeof route.query.email === 'string') {
    state.email = decodeURIComponent(route.query.email);
  }
  
  // Set a random verification question
  const randomIndex = Math.floor(Math.random() * verificationQuestions.length);
  verificationQuestion.value = verificationQuestions[randomIndex].question;
  verificationAnswer.value = verificationQuestions[randomIndex].answer.toLowerCase();
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  error.value = '';
  
  try {
    const result = await register(
      event.data.email, 
      event.data.password, 
      event.data.name
    );
    
    if (result.success) {
      // Also save additional user data to Firestore
      const { $firebase } = useNuxtApp();
      const { currentUser } = useAuth();
      
      if (currentUser.value) {
        await setDoc(
          doc($firebase.firestore, 'users', currentUser.value.uid),
          { 
            name: event.data.name,
            email: event.data.email,
            birthDate: event.data.birthDate,
            phoneNumber: event.data.phoneNumber,
            country: event.data.country,
            registrationDate: new Date().toISOString(),
            subscriptionType: 'Basic',
            subscriptionStatus: 'Trial',
            subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7-day trial
          },
          { merge: true }
        );
      }
    } else {
      error.value = result.error || t('An unknown error occurred');
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : t('An unknown error occurred');
  } finally {
    loading.value = false;
  }
};

const userVerificationInput = ref('');
const verifyHuman = () => {
  if (userVerificationInput.value.toLowerCase() === verificationAnswer.value) {
    state.humanVerification = true;
  } else {
    error.value = t('Incorrect answer. Please try again.');
    state.humanVerification = false;
  }
};
</script>

<template>
  <UCard class="max-w-md mx-auto mt-16 mb-8 shadow-lg">
    <UCardTitle class="text-3xl font-bold">{{ t('Create Account') }}</UCardTitle>
    
    <UAlert v-if="error" color="error" class="mb-4" :title="error" />
    
    <UForm 
      :schema="schema" 
      :state="state" 
      @submit="onSubmit"
      class="space-y-4"
    >
      <UFormField 
        :label="t('Name')" 
        name="name"
      >
        <UInput
          v-model="state.name"
          type="text"
          placeholder="John Doe"
        />
      </UFormField>
      
      <UFormField 
        :label="t('Email')" 
        name="email"
      >
        <UInput
          v-model="state.email"
          type="email"
          placeholder="your@email.com"
        />
      </UFormField>
      
      <UFormField 
        :label="t('Date of Birth')" 
        name="birthDate"
      >
        <UInput
          v-model="state.birthDate"
          type="date"
        />
      </UFormField>
      
      <UFormField 
        :label="t('Phone Number')" 
        name="phoneNumber"
      >
        <UInput
          v-model="state.phoneNumber"
          type="tel"
          placeholder="+34 123 456 789"
        />
      </UFormField>
      
      <UFormField 
        :label="t('Country')" 
        name="country"
      >
        <USelectMenu v-model="state.country" :options="countries" />
      </UFormField>
      
      <UFormField 
        :label="t('Password')" 
        name="password"
      >
        <UInput
          v-model="state.password"
          type="password"
          placeholder="********"
        />
        <template #description>
          <span class="text-sm text-gray-500">{{ t('Must be at least 8 characters') }}</span>
        </template>
      </UFormField>
      
      <UFormField 
        :label="t('Confirm Password')" 
        name="confirmPassword"
      >
        <UInput
          v-model="state.confirmPassword"
          type="password"
          placeholder="********"
        />
      </UFormField>
      
      <!-- Human Verification Field -->
      <UFormField
        :label="t('Human Verification')"
        name="humanVerification"
      >
        <div class="border rounded-lg p-4 mb-2 bg-gray-50 dark:bg-gray-800">
          <p class="font-medium mb-2">{{ verificationQuestion }}</p>
          <div class="flex gap-2">
            <UInput
              v-model="userVerificationInput"
              type="text"
              placeholder="Your answer"
              class="flex-grow"
            />
            <UButton 
              color="primary" 
              @click="verifyHuman"
              size="sm"
            >
              {{ t('Verify') }}
            </UButton>
          </div>
          <div v-if="state.humanVerification" class="mt-2 text-green-600">
            <span class="flex items-center">
              <UIcon name="i-heroicons-check-circle" class="mr-1" />
              {{ t('Verification successful') }}
            </span>
          </div>
        </div>
      </UFormField>
      
      <!-- Terms and Conditions -->
      <UFormField
        name="termsAccepted"
      >
        <UCheckbox
          v-model="state.termsAccepted"
          :label="t('I accept the Terms and Conditions')"
        />
      </UFormField>
      
      <div class="flex justify-between items-center pt-4">
        <UButton
          type="submit"
          color="primary"
          class="bg-amber-400 hover:bg-amber-500 text-black"
          :loading="loading"
          :disabled="loading"
        >
          {{ t('Sign Up') }}
        </UButton>
        
        <NuxtLink to="/auth/login" class="text-(--ui-primary) hover:underline">
          {{ t('Already have an account?') }}
        </NuxtLink>
      </div>
    </UForm>
  </UCard>
</template>