<script setup lang="ts">
const navigationItems = [
  { label: 'Home', path: '/' },
  { label: 'Movies', path: '/movies' },
  // Uncomment these as needed
  // { label: 'TV Shows', path: '/shows' },
  // { label: 'New & Popular', path: '/new' },
  // { label: 'My List', path: '/my-list' },
]
</script>

<template>
  <header class="sticky top-0 w-full z-50 bg-black/50 backdrop-blur">
    <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="text-2xl font-bold text-brand">
        Moaba Cinema TV
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
          color="black"
          variant="ghost"
          icon="i-heroicons-magnifying-glass"
        />
        <UButton 
          color="brand" 
          label="Subscribe"
          class="bg-brand text-brand-content hover:bg-brand-hover"
        />
        <UButton 
          color="white" 
          variant="outline"
          label="Sign In"
        />
      </div>
    </nav>
  </header>
</template> 