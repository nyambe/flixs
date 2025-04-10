<script setup lang="ts">
// pages/auth/login.vue
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
    console.log(result);
    error.value = result.error || '';
  }
  
  loading.value = false;
}
</script>

<template>
  <UCard class="max-w-md mx-auto mt-16 mb-8 shadow-lg">
    <UCardTitle class="text-3xl font-bold">{{ t('Sign In') }}</UCardTitle>
    
    <UAlert v-if="error" color="error" class="mb-4" :title="error" />
    
    <UForm 
      :schema="schema" 
      :state="state" 
      @submit="onSubmit"
      class="space-y-4"
    >
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
      
      <div class="flex justify-between items-center pt-4">
        <UButton
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="loading"
        >
          {{ t('Sign In') }}
        </UButton>
        
        <NuxtLink to="/auth/register" class="text-(--ui-primary) hover:underline">
          {{ t('Need an account?') }}
        </NuxtLink>
      </div>
    </UForm>
  </UCard>
</template>