// pages/auth/register.vue
<script setup lang="ts">
const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }
  
  const result = await register(email.value, password.value, name.value)
  
  if (!result.success) {
    error.value = result.error
  }
  
  loading.value = false
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16 mb-20">
    <h1 class="text-3xl font-bold mb-6">Create Account</h1>
    
    <UAlert v-if="error" color="red" class="mb-4" :title="error" />
    
    <form @submit.prevent="handleSubmit">
      <UFormGroup label="Name" name="name" class="mb-4">
        <UInput
          v-model="name"
          type="text"
          placeholder="John Doe"
          required
        />
      </UFormGroup>
      
      <UFormGroup label="Email" name="email" class="mb-4">
        <UInput
          v-model="email"
          type="email"
          placeholder="your@email.com"
          required
        />
      </UFormGroup>
      
      <UFormGroup label="Password" name="password" class="mb-4">
        <UInput
          v-model="password"
          type="password"
          placeholder="********"
          required
        />
      </UFormGroup>
      
      <UFormGroup label="Confirm Password" name="confirmPassword" class="mb-6">
        <UInput
          v-model="confirmPassword"
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
          Sign Up
        </UButton>
        
        <NuxtLink to="/auth/login" class="text-brand hover:underline">
          Already have an account?
        </NuxtLink>
      </div>
    </form>
  </div>
</template>