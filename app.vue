<script setup lang="ts">
// app.vue
const navigationItems = [
  { label: 'Home', path: '/' },
  { label: 'TV Shows', path: '/shows' },
  { label: 'Movies', path: '/movies' },
  { label: 'New & Popular', path: '/new' },
  { label: 'My List', path: '/my-list' },
]

</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Navigation -->
    <header class="fixed w-full z-50 bg-gradient-to-b from-black/80 to-transparent">
      <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-2xl font-bold text-red-600">
          StreamFlix
        </NuxtLink>

        <div class="hidden md:flex items-center space-x-6">
          <NuxtLink 
            v-for="item in navigationItems" 
            :key="item.path" 
            :to="item.path"
            class="text-gray-300 hover:text-white transition">
            {{ item.label }}
          </NuxtLink>
        </div>

        <div class="flex items-center space-x-4">
          <UButton 
            color="white" 
            variant="ghost"
            icon="i-heroicons-magnifying-glass"
          />
          <UButton 
            color="red" 
            label="Sign In"
            class="bg-red-600 hover:bg-red-700"
          />
        </div>
      </nav>
    </header>

   <NuxtPage />

  </div>
</template>

<style>
.backdrop-blur {
  backdrop-filter: blur(8px);
}
</style>