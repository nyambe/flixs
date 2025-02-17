// app.vue
<script setup lang="ts">
import type { NavigationItem } from '~/types'

const navigationItems: NavigationItem[] = [
  { label: 'Home', path: '/' },
  { label: 'TV Shows', path: '/shows' },
  { label: 'Movies', path: '/movies' },
  { label: 'New & Popular', path: '/new' },
  { label: 'My List', path: '/my-list' },
]

const { featuredMovie, popularMovies } = useMovieData()

// Calculate aspect ratio for backdrop images
const backdropAspectRatio = 'aspect-[16/9]'
const posterAspectRatio = 'aspect-[2/3]'
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Navigation -->
    <header class="fixed w-full z-50 bg-gradient-to-b from-black/80 to-transparent">
      <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="text-2xl font-bold text-red-600">
          StreamFlix
        </NuxtLink>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-6">
          <NuxtLink 
            v-for="item in navigationItems" 
            :key="item.path" 
            :to="item.path"
            class="text-gray-300 hover:text-white transition">
            {{ item.label }}
          </NuxtLink>
        </div>

        <!-- Right Section -->
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

    <!-- Hero Section -->
    <section class="relative min-h-screen">
      <!-- Background Image with 16:9 aspect ratio -->
      <div class="absolute inset-0">
        <div :class="backdropAspectRatio" class="w-full">
          <img 
            :src="`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`"
            :alt="featuredMovie.title"
            class="w-full h-full object-cover"
          >
        </div>
        <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <!-- Hero Content -->
      <div class="container mx-auto px-4 relative pt-48">
        <div class="max-w-2xl">
          <h1 class="text-5xl md:text-7xl font-bold mb-4">
            {{ featuredMovie.title }}
          </h1>
          <p class="text-xl text-gray-300 mb-8">
            {{ featuredMovie.overview }}
          </p>
          <div class="flex space-x-4">
            <UButton
              size="xl"
              color="red"
              label="Play Now"
              icon="i-heroicons-play"
              class="bg-red-600 hover:bg-red-700"
            />
            <UButton
              size="xl"
              color="gray"
              variant="ghost"
              label="More Info"
              icon="i-heroicons-information-circle"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories Section -->
    <section class="py-16 bg-black">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8">Popular on StreamFlix</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            v-for="movie in popularMovies" 
            :key="movie.id" 
            class="relative group cursor-pointer"
          >
            <div :class="posterAspectRatio" class="w-full">
              <img 
                :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                :alt="movie.title"
                class="w-full h-full object-cover rounded-lg transition transform group-hover:scale-105"
              >
            </div>
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.backdrop-blur {
  backdrop-filter: blur(8px);
}
</style>