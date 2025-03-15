<script setup lang="ts">
const { getAllMovies } = useMovieData()
const imagePath = useImagePath()

const posterAspectRatio = 'aspect-[2/3]'

definePageMeta({
  middleware: 'subscription'
})
</script>

<template>
  <div>
   <!-- Featured Categories Section -->
   <section class="py-16 bg-black">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8">African Film Festival</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NuxtLink 
            v-for="movie in getAllMovies()" 
            :key="movie.id" 
            :to="`/movie/${movie.id}`"
            class="relative group cursor-pointer"
          >
            <div :class="posterAspectRatio" class="w-full">
              <img 
                :src="imagePath.poster(movie.poster_path)"
                :alt="movie.title"
                class="w-full h-full object-cover rounded-lg transition transform group-hover:scale-105"
              >
            </div>
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg">
              <div class="absolute bottom-0 p-4 w-full">
                <h3 class="text-lg font-semibold">{{ movie.title }}</h3>
                <div class="flex items-center mt-1">
                  <span class="text-yellow-400">★</span>
                  <span class="ml-1">{{ movie.vote_average.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>