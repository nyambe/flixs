// pages/auth/register.vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { register } = useAuth();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  
  if (password.value !== confirmPassword.value) {
    error.value = t('Passwords do not match');
    loading.value = false;
    return;
  }
  
  const result = await register(email.value, password.value, name.value);
  
  if (!result.success) {
    error.value = result.error || t('An unknown error occurred');
  }
  
  loading.value = false;
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16 mb-20">
    <h1 class="text-3xl font-bold mb-6">{{ t('Create Account') }}</h1>
    
    <UAlert v-if="error" color="error" class="mb-4" :title="error" />
    
    <UForm @submit="handleSubmit">
      <UFormItem :label="t('Name')" name="name" class="mb-4">
        <UInput
          v-model="name"
          type="text"
          placeholder="John Doe"
          required
        />
      </UFormItem>
      
      <UFormItem :label="t('Email')" name="email" class="mb-4">
        <UInput
          v-model="email"
          type="email"
          placeholder="your@email.com"
          required
        />
      </UFormItem>
      
      <UFormItem :label="t('Password')" name="password" class="mb-4">
        <UInput
          v-model="password"
          type="password"
          placeholder="********"
          required
        />
      </UFormItem>
      
      <UFormItem :label="t('Confirm Password')" name="confirmPassword" class="mb-6">
        <UInput
          v-model="confirmPassword"
          type="password"
          placeholder="********"
          required
        />
      </UFormItem>
      
      <div class="flex justify-between items-center">
        <UButton
          type="submit"
          color="primary"
          class="bg-brand text-brand-content hover:bg-brand-hover"
          :loading="loading"
          :disabled="loading"
        >
          {{ t('Sign Up') }}
        </UButton>
        
        <NuxtLink to="/auth/login" class="text-brand hover:underline">
          {{ t('Already have an account?') }}
        </NuxtLink>
      </div>
    </UForm>
  </div>
</template>