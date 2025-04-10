<script setup lang="ts">
// app.vue

const { featuredMovie, popularMovies } = useMovieData()
const imagePath = useImagePath()
const showTrailer = ref(false)

// Calculate aspect ratios
const backdropAspectRatio = 'aspect-[16/9]'
const posterAspectRatio = 'aspect-[2/3]'

// Add SEO metadata
useSeoMeta({
  title: 'MOABA Cinema TV - African Movies on Demand',
  ogTitle: 'MOABA Cinema TV - African Movies on Demand',
  description: 'Stream premium African movies and TV shows. Experience the richness of African cinema with MOABA TV.',
  ogDescription: 'Stream premium African movies and TV shows. Experience the richness of African cinema with MOABA TV.',
  ogImage: featuredMovie.backdrop_path ? imagePath.backdrop(featuredMovie.backdrop_path) : '/logo.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class=" bg-black text-white">
    <!-- Trailer Modal -->
    <TrailerModal 
      v-model:open="showTrailer" 
      :trailer-id="featuredMovie.trailer_id || null"
    />
    
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
          <p class="text-md text-neutral-300 mb-8 max-h-48 overflow-hidden relative">
            {{ featuredMovie.overview }}
            <span class="absolute bottom-0 right-0 bg-gradient-to-l from-black to-transparent px-4">&hellip;</span>
          </p>
          <div class="flex space-x-4">
            <UButton
              v-if="featuredMovie.video_id"
              size="xl"
              color="primary"
              label="Play"
              icon="i-heroicons-play"
              class="bg-amber-400 hover:bg-amber-500"
              @click="navigateTo(`/watch/${featuredMovie.video_id}`)"
            />
            <!-- <UButton
              v-else
              size="xl"
              color="primary"
              label="Play"
              icon="i-heroicons-play"
              class="bg-amber-400 hover:bg-amber-500"
              @click="navigateTo(`/movie/${featuredMovie.id}`)"
            /> -->
            <UButton
              v-if="featuredMovie.trailer_id"
              size="xl"
              color="warning"
              variant="outline"
              label="Trailer"
              icon="i-heroicons-film"
              @click="showTrailer = true"
            />
            <UButton
              size="xl"
              color="neutral"
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
        <h2 class="text-3xl font-bold mb-8">Las Joyas de MOABA</h2>
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