<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Use the admin user composable
const { signIn, loading, error: authError, user } = useAdminUser();

// Form data
const email = ref('');
const password = ref('');

// Handle form submission
const handleLogin = async () => {
  if (!email.value || !password.value) {
    return;
  }
  
  const success = await signIn(email.value, password.value);
  
  if (success) {
    // Redirect to admin dashboard on success
    navigateTo('/admin');
  }
};

// If already logged in as admin, redirect to admin page
onMounted(() => {
  if (user.value) {
    navigateTo('/admin');
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex flex-col justify-center">
    <div class="max-w-md w-full mx-auto">
      <!-- Logo/Header -->
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-white">Admin Control Panel</h1>
        <p class="mt-2 text-gray-400">Authorized personnel only</p>
      </div>
      
      <!-- Login Card -->
      <div class="bg-gray-800 rounded-lg shadow-xl p-8 mb-6">
        <h2 class="text-xl font-semibold text-white mb-6">Administrator Login</h2>
        
        <form @submit.prevent="handleLogin">
          <!-- Email Field -->
          <div class="mb-6">
            <label for="email" class="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@example.com"
              required
              autofocus
            />
          </div>
          
          <!-- Password Field -->
          <div class="mb-6">
            <label for="password" class="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          
          <!-- Error Message -->
          <div v-if="authError" class="mb-6">
            <p class="text-red-500 text-sm">{{ authError }}</p>
          </div>
          
          <!-- Submit Button -->
          <div>
            <button 
              type="submit" 
              :disabled="loading" 
              class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
            >
              <span v-if="loading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
              <span v-else>Sign In</span>
            </button>
          </div>
        </form>
      </div>
      
      <!-- Back to main site link -->
      <div class="text-center">
        <NuxtLink to="/" class="text-sm text-gray-400 hover:text-white transition-colors">
          &larr; Return to Main Site
        </NuxtLink>
      </div>
    </div>
    
    <!-- Security Notice -->
    <div class="mt-10 text-center">
      <p class="text-xs text-gray-500">
        This is a restricted area. Unauthorized access attempts will be logged and reported.
      </p>
    </div>
  </div>
</template> 