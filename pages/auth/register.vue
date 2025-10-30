// pages/auth/register.vue
<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const { t } = useI18n();
const appConfig = useAppConfig();

// Redirect to home if newsletter is disabled
if (!appConfig.features.newsletter.enabled) {
  navigateTo('/');
}

const schema = z.object({
  name: z.string().min(1, t('Name is required')),
  email: z.string().email(t('Invalid email address')),
  howDidYouFindUs: z.string().optional(),
  privacyConsent: z.boolean().refine(val => val === true, {
    message: t('You must accept the privacy policy')
  })
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  name: '',
  email: '',
  howDidYouFindUs: '',
  privacyConsent: false
});

const howDidYouFindUsOptions = [
  { value: 'search', label: t('Search Engine') },
  { value: 'social', label: t('Social Media') },
  { value: 'friend', label: t('Friend Recommendation') },
  { value: 'advertisement', label: t('Advertisement') },
  { value: 'other', label: t('Other') }
];

const error = ref('');
const loading = ref(false);
const success = ref(false);

// Pre-fill email from URL query parameter
onMounted(() => {
  const route = useRoute();
  if (route.query.email && typeof route.query.email === 'string') {
    state.email = decodeURIComponent(route.query.email);
  }
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: {
        email: event.data.email,
        source: 'registration_page',
        privacyConsent: event.data.privacyConsent
      }
    });
    
    if (response.success) {
      success.value = true;
    } else {
      error.value = response.message || t('An unknown error occurred');
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : t('An unknown error occurred');
  } finally {
    loading.value = false;
  }
};

</script>

<template>
  <div class="max-w-md mx-auto mt-16 mb-8">
    <UCard>
      <template #header>
        <h1 class="text-3xl font-bold">{{ t('Subscribe to Newsletter') }}</h1>
      </template>
      
      <UAlert v-if="success" color="success" class="mb-4" :title="t('Successfully subscribed to newsletter!')" />
      <UAlert v-else-if="error" color="error" class="mb-4" :title="error" />
      
      <UForm 
        v-if="!success"
        :schema="schema" 
        :state="state" 
        @submit="onSubmit"
        class="space-y-4"
      >
        <UFormField :label="t('Name')" name="name" required>
          <UInput
            v-model="state.name"
            type="text"
            :placeholder="t('John Doe')"
          />
        </UFormField>
        
        <UFormField :label="t('Email')" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            :placeholder="t('your@email.com')"
          />
        </UFormField>
        
        <UFormField :label="t('How did you find us?')" name="howDidYouFindUs">
          <USelect
            v-model="state.howDidYouFindUs"
            :items="howDidYouFindUsOptions"
            :placeholder="t('Select an option')"
          />
        </UFormField>

        <UFormField name="privacyConsent" required>
          <div class="flex items-start gap-3">
            <UCheckbox
              v-model="state.privacyConsent"
              :label="t('I accept the privacy policy and consent to receive emails from MOABA Cinema TV')"
            />
          </div>
          <template #help>
            <NuxtLink to="/privacy" class="text-amber-400 hover:text-amber-300 underline text-sm">
              {{ t('Read our privacy policy') }}
            </NuxtLink>
          </template>
        </UFormField>

        <div class="pt-4">
          <UButton
            type="submit"
            color="primary"
            class="w-full"
            :loading="loading"
            :disabled="loading"
          >
            {{ t('Subscribe') }}
          </UButton>
        </div>
      </UForm>
      
      <div v-else class="text-center py-4">
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          {{ t('Thank you for subscribing! You\'ll receive updates about our latest content.') }}
        </p>
        <UButton
          color="primary"
          variant="outline"
          @click="() => { success = false; error = ''; state.name = ''; state.email = ''; state.howDidYouFindUs = ''; state.privacyConsent = false; }"
        >
          {{ t('Subscribe Another Email') }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>