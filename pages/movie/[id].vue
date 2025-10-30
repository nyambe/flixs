<script setup lang="ts">
// pages/movie/[id].vue
import { ref, onMounted } from 'vue'

// Define types for the additional data
interface MovieDetails {
  runtime?: number | null;
  director?: string | null;
  producer?: string | null;
  cast?: string | null;
}

const route = useRoute()
const movieId = route.params.id
const { getMovieById } = useMovieData()
const imagePath = useImagePath()
const { t } = useI18n()
const showTrailer = ref(false)
const additionalData = ref<MovieDetails | null>(null)
const loading = ref(false)

const movie = getMovieById(Number(movieId))

// Fetch additional movie details
const fetchAdditionalData = async () => {
  if (!movie) return
  
  loading.value = true
  try {
    const { data } = await useFetch(`/api/movie/${movie.id}`)
    additionalData.value = data.value
  } catch (error) {
    console.error('Error fetching movie details:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAdditionalData()
})

const togglePlay = () => {
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


    <!-- Movie Details -->
    <div class="min-h-screen">
      <!-- Background -->
      <div class="relative">
        <div class="w-full aspect-[16/9] xl:aspect-[21/9]">
          <img 
            :src="imagePath.backdrop(movie?.backdrop_path ?? imagePath.backdrop(''))"
            :alt="movie?.title"
            class="w-full h-full object-cover opacity-60"
          >
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
      </div>

      <!-- Content -->
      <div class="container mx-auto px-4 -mt-80 xl:-mt-96 relative">
        <div class="flex flex-col md:flex-row gap-4 xl:gap-8 xl:items-start xl:max-w-7xl xl:mx-auto">
          <!-- Poster -->
          <div class="w-64 xl:w-80 flex-shrink-0">
            <img 
              :src="imagePath.poster(movie?.poster_path ?? imagePath.poster(''))"
              :alt="movie?.title"
              class="w-full rounded-lg shadow-xl"
            >
          </div>

          <!-- Details -->
          <div class="flex-1 xl:py-8">
            <h1 class="text-4xl md:text-5xl xl:text-6xl font-bold mb-4">
              {{ movie?.title }}
            </h1>
            <div class="flex items-center gap-4 mb-6">
              <span class="flex items-center text-lg xl:text-xl">
                <span class="text-yellow-400 mr-1">★</span>
                {{ movie?.vote_average.toFixed(1) }}
              </span>
              <span v-if="movie?.release_date" class="text-lg xl:text-xl">{{ new Date(movie?.release_date).getFullYear() }}</span>
            </div>
            <p class="text-lg xl:text-xl text-neutral-300 mb-8 max-w-3xl">
              {{ movie?.overview }}
            </p>
            
            <!-- Additional information -->
            <div class="mb-8 space-y-3 xl:text-lg">
              <div v-if="movie?.release_date" class="flex items-start">
                <span class="font-medium text-neutral-200 w-32">{{ t('Month') }}:</span>
                <span>{{ new Date(movie?.release_date).toLocaleString('es', { month: 'long' }) }}</span>
              </div>
              <div v-if="additionalData?.runtime || movie?.runtime" class="flex items-start">
                <span class="font-medium text-neutral-200 w-32">{{ t('Duration') }}:</span>
                <span>{{ additionalData?.runtime || movie?.runtime }} {{ t('minutes') }}</span>
              </div>
              <div v-if="additionalData?.director || movie?.director" class="flex items-start">
                <span class="font-medium text-neutral-200 w-32">{{ t('Directed by') }}:</span>
                <span>{{ additionalData?.director || movie?.director }}</span>
              </div>
              <div v-if="additionalData?.producer || movie?.producer" class="flex items-start">
                <span class="font-medium text-neutral-200 w-32">{{ t('Produced by') }}:</span>
                <span>{{ additionalData?.producer || movie?.producer }}</span>
              </div>
              <div v-if="additionalData?.cast || movie?.cast" class="flex items-start">
                <span class="font-medium text-neutral-200 w-32">{{ t('Cast') }}:</span>
                <span>{{ additionalData?.cast || movie?.cast }}</span>
              </div>
            </div>
            
            <div class="flex gap-4">
              <UButton
                size="xl"
                color="primary"
                :label="t('Play')"
                icon="i-heroicons-play"
                class="bg-amber-400 hover:bg-amber-500"
                @click="togglePlay"
              />
              <UButton
                v-if="movie?.trailer_id"
                size="xl"
                color="warning"
                variant="outline"
                :label="t('Trailer')"
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