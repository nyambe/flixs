<script setup lang="ts">
// pages/movie/[id].vue
import { ref } from 'vue'

const route = useRoute()
const movieId = route.params.id
const { getMovieById } = useMovieData()
const imagePath = useImagePath()
const isPlaying = ref(false)
const showTrailer = ref(false)

const movie = getMovieById(Number(movieId))

const togglePlay = () => {
  // isPlaying.value = !isPlaying.value
  // If movie has a video_id, use it; otherwise use a default
  const video_id = movie?.video_id || '933381480'
  
  // Instead of toggling play state, navigate to watch page
  navigateTo(`/watch/${video_id}`)
}

const goBack = () => {
  navigateTo('/')
}

// Apply subscription middleware
definePageMeta({
  middleware: 'subscription'
})
</script>

<template>
  <div class="bg-black text-white">
    <!-- Trailer Modal -->
    <TrailerModal 
      v-model:open="showTrailer" 
      :trailer-id="movie?.trailer_id || null"
    />

    <!-- Movie Player Section -->
    <div v-if="isPlaying" class="fixed inset-0 z-50 bg-black">
      <div class="relative h-screen">
        <!-- Video Simulation -->
        <div class="absolute inset-0 flex items-center justify-center bg-black">
          <img 
            :src="imagePath.backdrop(movie?.backdrop_path ?? imagePath.backdrop(''))"
            :alt="movie?.title"
            class="w-full h-full object-contain"
          >
          <!-- Player Controls -->
          <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
            <UButton
              size="xl"
              color="primary"
              variant="ghost"
              icon="i-heroicons-pause"
              class="text-4xl"
              @click="togglePlay"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Movie Details -->
    <div v-else class="min-h-screen">
      <!-- Background -->
      <div class="relative">
        <div class="w-full aspect-[16/9]">
          <img 
            :src="imagePath.backdrop(movie?.backdrop_path ?? imagePath.backdrop(''))"
            :alt="movie?.title"
            class="w-full h-full object-cover"
          >
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <!-- Content -->
      <div class="container mx-auto px-4 -mt-32 relative">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Poster -->
          <div class="w-64 flex-shrink-0">
            <img 
              :src="imagePath.poster(movie?.poster_path ?? imagePath.poster(''))"
              :alt="movie?.title"
              class="w-full rounded-lg shadow-xl"
            >
          </div>

          <!-- Details -->
          <div class="flex-1">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              {{ movie?.title }}
            </h1>
            <div class="flex items-center gap-4 mb-6">
              <span class="flex items-center">
                <span class="text-yellow-400 mr-1">★</span>
                {{ movie?.vote_average.toFixed(1) }}
              </span>
              <span v-if="movie?.release_date">{{ new Date(movie?.release_date).getFullYear() }}</span>
            </div>
            <p class="text-lg text-neutral-300 mb-8">
              {{ movie?.overview }}
            </p>
            <div class="flex gap-4">
              <UButton
                size="xl"
                color="primary"
                label="Play"
                icon="i-heroicons-play"
                class="bg-amber-400 hover:bg-amber-500"
                @click="togglePlay"
              />
              <UButton
                v-if="movie?.trailer_id"
                size="xl"
                color="warning"
                variant="outline"
                label="Trailer"
                icon="i-heroicons-film"
                @click="showTrailer = true"
              />
              <UButton
                size="xl"
                color="warning"
                variant="ghost"
                icon="i-heroicons-arrow-left"
                @click="goBack"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>