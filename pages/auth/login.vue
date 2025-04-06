<script setup lang="ts">
// pages/auth/login.vue
import { useI18n } from 'vue-i18n';
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const { t } = useI18n();
const { signIn } = useAuth();

const schema = z.object({
  email: z.string().email(t('Invalid email')),
  password: z.string().min(1, t('Password is required'))
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  email: '',
  password: ''
});

const error = ref('');
const loading = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  error.value = '';
  
  const result = await signIn(event.data.email, event.data.password);
  
  if (!result.success) {
    error.value = result.error || '';
  }
  
  loading.value = false;
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16 mb-2 p-4 bg-gray-400 bg-opacity-20 rounded-lg">
    <h1 class="text-3xl font-bold mb-6">{{ t('Sign In') }}</h1>
    
    <UAlert v-if="error" color="red" class="mb-4" :title="error" />
    
    <UForm 
      :schema="schema" 
      :state="state" 
      @submit="onSubmit"
    >
      <UFormField 
        :label="t('Email')" 
        name="email" 
        class="mb-4"
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
        class="mb-6 text-white"
      >
        <UInput
          v-model="state.password"
          type="password"
          placeholder="********"
        />
      </UFormField>
      
      <div class="flex justify-between items-center">
        <UButton
          type="submit"
          color="primary"
          class="bg-brand text-brand-content hover:bg-brand-hover"
          :loading="loading"
          :disabled="loading"
        >
          {{ t('Sign In') }}
        </UButton>
        
        <NuxtLink to="/auth/register" class="text-brand hover:underline">
          {{ t('Need an account?') }}
        </NuxtLink>
      </div>
    </UForm>
  </div>
</template>