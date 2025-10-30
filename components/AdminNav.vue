<script setup lang="ts">
const { user, signOut } = useAdminUser();
const { t } = useI18n();

const handleSignOut = async () => {
  await signOut();
  navigateTo('/admin/login');
};
</script>

<template>
  <div class="bg-gray-900 text-white">
    <div class="container mx-auto px-4">
      <!-- Admin Navigation -->
      <div class="flex items-center justify-between py-4">
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-bold">{{ t('Admin Panel') }}</h1>

          <nav class="hidden md:flex space-x-6">
            <NuxtLink to="/admin" class="hover:text-blue-400 transition">{{ t('Dashboard') }}</NuxtLink>
            <NuxtLink to="/admin/videos" class="hover:text-blue-400 transition">{{ t('Video Management') }}</NuxtLink>
            <NuxtLink to="/admin/users" class="hover:text-blue-400 transition">{{ t('Users') }}</NuxtLink>
            <NuxtLink to="/admin/settings" class="hover:text-blue-400 transition">{{ t('Settings') }}</NuxtLink>
          </nav>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Admin User Info -->
          <div class="hidden md:flex items-center">
            <span class="text-sm text-gray-400 mr-2">{{ t('Logged in as') }}:</span>
            <span class="text-sm font-medium truncate max-w-[200px]">{{ user?.email }}</span>
          </div>

          <!-- Sign Out Button -->
          <button
            @click="handleSignOut"
            class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            {{ t('Sign Out') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 