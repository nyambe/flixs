<script setup lang="ts">
// pages/auth/login.vue
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { signIn } = useAuth();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  
  const result = await signIn(email.value, password.value);
  
  if (!result.success) {
    error.value = result.error || '';
  }
  
  loading.value = false;
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16 mb-2 p-4 bg-gray-400 bg-opacity-20 rounded-lg">
    <h1 class="text-3xl font-bold mb-6">{{ t('Sign In') }}</h1>
    
    <UAlert v-if="error" color="error" class="mb-4" :title="error" />
    
    <UForm @submit="handleSubmit">
      <UFormField :label="t('Email')" name="email" class="mb-4">
        <UInput
          v-model="email"
          type="email"
          placeholder="your@email.com"
          required
        />
      </UFormField>
      
      <UFormField :label="t('Password')" name="password" class="mb-6 text-white">
        <UInput
          v-model="password"
          type="password"
          placeholder="********"
          required
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