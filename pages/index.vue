<script setup lang="ts">
// app.vue


const { featuredMovie, popularMovies } = useMovieData()
const imagePath = useImagePath()

// Calculate aspect ratios
const backdropAspectRatio = 'aspect-[16/9]'
const posterAspectRatio = 'aspect-[2/3]'

const payUrl = "https://buy.stripe.com/test_5kA6sgdCf3xk2DSaEG"
</script>

<template>
  <div class=" bg-black text-white">
    <!-- Hero Section -->
    <section class="relative min-h-[60vh] overflow-hidden">
      <div class="absolute inset-0">
        <div :class="backdropAspectRatio" class="w-full ">
          <img 
            :src="imagePath.backdrop(featuredMovie.backdrop_path)"
            :alt="featuredMovie.title"
            class="w-full aspect-[16/9]  object-cover"
          >
        </div>
        <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <div class="flex container mx-auto px-4 relative pt-48 h-full">
        <div class="max-w-2xl">
          <h1 class="text-5xl md:text-7xl font-bold mb-4">
            {{ featuredMovie.title }}
          </h1>
          <p class="text-xl text-gray-300 mb-8 h-32 line-clamp-3">
            {{ featuredMovie.overview }}
          </p>
          <div class="flex space-x-4">
            <UButton
              size="xl"
              color="brand"
              label="Play"
              icon="i-heroicons-play"
              class="bg-brand hover:bg-amber-500"
              @click="() => navigateTo(`/movie/${featuredMovie.id}`)"
            />
            <UButton
              size="xl"
              color="black"
              variant="ghost"
              label="More Info"
              icon="i-heroicons-information-circle"
              :to="`/movie/${featuredMovie.id}`"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories Section -->
    <section class="py-16 bg-black">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8">Popular African Films</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NuxtLink 
            v-for="movie in popularMovies" 
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

<style>
.backdrop-blur {
  backdrop-filter: blur(8px);
}
</style>