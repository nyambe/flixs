// pages/auth/login.vue
<script setup lang="ts">
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  const result = await signIn(email.value, password.value)
  
  if (!result.success) {
    error.value = result.error
  }
  
  loading.value = false
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16 mb-20">
    <h1 class="text-3xl font-bold mb-6">Sign In</h1>
    
    <UAlert v-if="error" color="red" class="mb-4">{{ error }}</UAlert>
    
    <form @submit.prevent="handleSubmit">
      <UFormGroup label="Email" name="email" class="mb-4">
        <UInput
          v-model="email"
          type="email"
          placeholder="your@email.com"
          required
        />
      </UFormGroup>
      
      <UFormGroup label="Password" name="password" class="mb-6">
        <UInput
          v-model="password"
          type="password"
          placeholder="********"
          required
        />
      </UFormGroup>
      
      <div class="flex justify-between items-center">
        <UButton
          type="submit"
          color="primary"
          class="bg-brand text-brand-content hover:bg-brand-hover"
          :loading="loading"
          :disabled="loading"
        >
          Sign In
        </UButton>
        
        <NuxtLink to="/auth/register" class="text-brand hover:underline">
          Need an account?
        </NuxtLink>
      </div>
    </form>
  </div>
</template>