// pages/auth/register.vue
<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const { t } = useI18n();
const { register } = useAuth();

const schema = z.object({
  name: z.string().min(1, t('Name is required')),
  email: z.string().email(t('Invalid email address')),
  password: z.string().min(8, t('Password must be at least 8 characters')),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: t('Passwords do not match'),
  path: ['confirmPassword']
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const error = ref('');
const loading = ref(false);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  error.value = '';
  
  try {
    const result = await register(event.data.email, event.data.password, event.data.name);
    
    if (!result.success) {
      error.value = result.error || t('An unknown error occurred');
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : t('An unknown error occurred');
  } finally {
    loading.value = false;
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
        :label="t('Password')" 
        name="password"
      >
        <UInput
          v-model="state.password"
          type="password"
          placeholder="********"
        />
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
      
      <div class="flex justify-between items-center pt-4">
        <UButton
          type="submit"
          color="primary"
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