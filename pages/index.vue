<script setup lang="ts">
// app.vue
const { t } = useI18n()
const localePath = useLocalePath()
const { featuredMovie, popularMovies } = useMovieData()
const imagePath = useImagePath()
const showTrailer = ref(false)
const { currentUser } = useAuth()
const appConfig = useAppConfig()

// Overlay transparente del header sobre este hero (ver Task 1 / composables/useHeaderOverlay.ts)
const heroVisible = useHeroVisible()
const heroSentinel = ref<HTMLElement | null>(null)
let heroObserver: IntersectionObserver | null = null

onMounted(() => {
  heroVisible.value = true
  if (!heroSentinel.value) return
  heroObserver = new IntersectionObserver(
    ([entry]) => {
      heroVisible.value = entry.isIntersecting
    },
    { threshold: 0 }
  )
  heroObserver.observe(heroSentinel.value)
})

onUnmounted(() => {
  heroObserver?.disconnect()
})

// Add email handling for subscription
const handleSubscribe = async (email: string) => {
  try {
    await navigateTo(localePath('/auth/register') + '?email=' + encodeURIComponent(email))
  } catch (error) {
    console.error('Error during subscription:', error)
  }
}

// Handle skip newsletter
const handleSkip = async () => {
  try {
    await navigateTo(localePath('/auth/register'))
  } catch (error) {
    console.error('Error during navigation:', error)
  }
}

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
  <div class="bg-canvas dark:bg-black text-black dark:text-white">
    <!-- Trailer Modal -->
    <TrailerModal 
      v-model:open="showTrailer" 
      :trailer-id="featuredMovie.bunny_trailer_id || null"
    />
    
    <!-- Hero Section for logged-in users OR when newsletter is disabled -->
    <section v-if="currentUser || !appConfig.features.newsletter.showOnHomepage" class="relative min-h-[100dvh] overflow-hidden text-white">
      <div class="absolute inset-0">
        <div class="w-full h-full">
          <img
            :src="imagePath.backdrop(featuredMovie.backdrop_path)"
            :alt="featuredMovie.title"
            class="w-full h-full object-cover"
          >
        </div>
        <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <div class="flex items-center w-full max-w-7xl mx-auto px-8 md:px-16 relative min-h-[100dvh]">
        <div class="max-w-2xl">
          <h1 class="text-5xl md:text-7xl font-bold mb-3">
            {{ featuredMovie.title }}
          </h1>
          <p class="text-md text-neutral-300 mb-5 line-clamp-4">
            {{ featuredMovie.overview }}
          </p>
          <div class="flex gap-3">
            <UButton
              v-if="featuredMovie.bunny_id"
              size="xl"
              color="primary"
              :label="t('Play')"
              icon="i-heroicons-play"
              class="bg-brand hover:bg-brand-focus"
              @click="navigateTo(localePath(`/watch/${featuredMovie.bunny_id}`))"
            />
            <UButton
              v-if="featuredMovie.bunny_trailer_id"
              size="xl"
              color="warning"
              variant="outline"
              :label="t('Trailer')"
              icon="i-heroicons-film"
              class="bg-black/30 backdrop-blur-sm"
              @click="showTrailer = true"
            />
            <UButton
              size="xl"
              color="neutral"
              variant="ghost"
              :label="t('More Info')"
              icon="i-heroicons-information-circle"
              class="text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              :to="localePath(`/movie/${featuredMovie.id}`)"
            />
          </div>
        </div>
      </div>

      <div ref="heroSentinel" class="absolute bottom-0 left-0 h-px w-full" />
    </section>
    
    <!-- Subscription Hero for non-logged-in users (only if newsletter enabled) -->
    <SubscriptionHero
      v-else-if="appConfig.features.newsletter.showOnHomepage"
      :movie="featuredMovie"
      @subscribe="handleSubscribe"
      @skip="handleSkip"
    />

    <!-- Featured Categories Section -->
    <section class="py-16 bg-canvas dark:bg-black">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8">{{ t('Las Joyas de MOABA') }}</h2>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 max-w-4xl">
          <NuxtLink
            v-for="movie in popularMovies"
            :key="movie.id"
            :to="localePath(`/movie/${movie.id}`)"
            class="relative group cursor-pointer"
          >
            <div :class="posterAspectRatio" class="w-full">
              <img
                :src="imagePath.poster(movie.poster_path)"
                :alt="movie.title"
                class="w-full h-full object-cover rounded-lg shadow-md transition duration-300 group-hover:scale-105 group-hover:shadow-xl"
              >
            </div>
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg text-white">
              <div class="absolute bottom-0 p-2 sm:p-3 w-full">
                <h3 class="text-xs sm:text-sm font-semibold leading-tight">{{ movie.title }}</h3>
                <div class="flex items-center mt-1 text-xs">
                  <span class="text-brand">★</span>
                  <span class="ml-1">{{ movie.vote_average.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </NuxtLink>

          <!-- "Lámpara" (Rubén Monsuy Ndong Andeme, mismo director de Ureka
               y MAMADÍ): todavía no tiene video listo, así que no es una
               entrada real del catálogo (jsons/movies.json) — se muestra como
               teaser a /proximamente hasta que Samuel suba el video y se le
               pueda dar de alta como película. -->
          <NuxtLink :to="localePath('/proximamente')" class="relative group cursor-pointer">
            <div :class="posterAspectRatio" class="w-full">
              <img
                src="/images/movies/la-lampara-poster.jpg"
                alt="Lámpara"
                class="w-full h-full object-cover rounded-lg shadow-md transition duration-300 group-hover:scale-105 group-hover:shadow-xl"
              >
            </div>
            <div class="absolute top-2 left-2 bg-brand text-brand-content text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded">
              {{ t('Coming soon') }}
            </div>
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg text-white">
              <div class="absolute bottom-0 p-2 sm:p-3 w-full">
                <h3 class="text-xs sm:text-sm font-semibold leading-tight">Lámpara</h3>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Sponsors/Patrocinadores Section -->
    <section class="py-16 bg-amber-50 dark:bg-black">
      <div class="container mx-auto px-4">
        <h2 class="text-xl font-bold mb-8">{{ t('Patrocinadores') }}</h2>
        <div class="flex flex-col items-center gap-3 py-8 text-neutral-500 dark:text-neutral-400">
          <UIcon name="i-heroicons-sparkles" class="h-8 w-8" />
          <p class="text-lg font-medium italic">{{ t('Coming soon') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
