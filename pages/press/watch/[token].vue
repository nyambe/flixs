<script setup lang="ts">
const route = useRoute()
const token = route.params.token as string

const { t } = useI18n()
const { loading, error, validateToken, verifyPassword, trackView } = usePressScreener()
const { getVideo } = useVimeo()

const validation = ref<any>(null)
const isPasswordProtected = ref(false)
const isPasswordVerified = ref(false)
const passwordInput = ref('')
const passwordError = ref('')
const video = ref<any>(null)
const isFullscreen = ref(false)
const hasTrackedView = ref(false)

// Validate token on mount
onMounted(async () => {
  const result = await validateToken(token)

  if (!result || !result.valid) {
    validation.value = {
      valid: false,
      message: result?.message || t('press.invalidLink')
    }
    return
  }

  validation.value = result
  isPasswordProtected.value = !!result.requiresPassword

  // If no password required, load video immediately
  if (!isPasswordProtected.value && result.videoId) {
    await loadVideo(result.videoId)
  }
})

// Handle password submission
const handlePasswordSubmit = async () => {
  passwordError.value = ''

  const isValid = await verifyPassword(token, passwordInput.value)

  if (isValid) {
    isPasswordVerified.value = true
    // Load video after password verification
    if (validation.value?.videoId) {
      await loadVideo(validation.value.videoId)
    }
  } else {
    passwordError.value = error.value || t('press.invalidPassword')
  }
}

// Load video from Vimeo
const loadVideo = async (videoId: string) => {
  try {
    const response = await getVideo(videoId)
    if (response && 'uri' in response) {
      video.value = response
      // Track view when video is loaded
      if (!hasTrackedView.value) {
        await trackView(token)
        hasTrackedView.value = true
      }
    }
  } catch (err) {
    console.error('Error loading video:', err)
  }
}

// Get player URL with autoplay
const getPlayerUrl = (video: any) => {
  if (!video?.player_embed_url) return ''

  const baseUrl = video.player_embed_url
  const autoplayParam = baseUrl.includes('?') ? '&autoplay=1' : '?autoplay=1'
  return `${baseUrl}${autoplayParam}`
}

// Toggle fullscreen
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// Dark background
useHead({
  bodyAttrs: {
    class: 'bg-black'
  }
})

// NO subscription middleware for press links
definePageMeta({
  layout: false
})
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header -->
    <div class="bg-black/80 backdrop-blur-sm border-b border-gray-800">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold">{{ validation?.movieTitle || 'Press Screening' }}</h1>
            <p class="text-sm text-gray-400">{{ t('press.privateScreening') }}</p>
          </div>
          <div class="text-sm text-gray-500">
            {{ t('press.poweredBy') }} Flixs
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Invalid Link -->
      <div v-else-if="validation && !validation.valid" class="max-w-md mx-auto text-center py-12">
        <div class="bg-red-900/20 border border-red-700 rounded-lg p-8">
          <svg class="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 class="text-2xl font-bold mb-2">{{ t('press.linkInvalid') }}</h2>
          <p class="text-gray-300">{{ validation.message }}</p>
          <p v-if="validation.expired" class="text-sm text-gray-400 mt-4">
            {{ t('press.linkExpiredInfo') }}
          </p>
        </div>
      </div>

      <!-- Password Required -->
      <div v-else-if="isPasswordProtected && !isPasswordVerified" class="max-w-md mx-auto py-12">
        <div class="bg-gray-900 rounded-lg p-8 border border-gray-700">
          <div class="text-center mb-6">
            <svg class="mx-auto h-16 w-16 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 class="text-2xl font-bold mb-2">{{ t('press.passwordRequired') }}</h2>
            <p class="text-gray-400">{{ t('press.enterPasswordToContinue') }}</p>
          </div>

          <form @submit.prevent="handlePasswordSubmit" class="space-y-4">
            <div>
              <input
                v-model="passwordInput"
                type="password"
                :placeholder="t('press.password')"
                required
                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
              >
              <p v-if="passwordError" class="mt-2 text-sm text-red-400">
                {{ passwordError }}
              </p>
            </div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {{ loading ? t('press.verifying') : t('press.continue') }}
            </button>
          </form>
        </div>
      </div>

      <!-- Video Player (Fullscreen) -->
      <div
        v-else-if="video && isFullscreen"
        class="fixed inset-0 z-50 bg-black flex items-center justify-center"
      >
        <div class="absolute top-4 right-4 z-10">
          <button
            @click="toggleFullscreen"
            class="text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="w-full h-full">
          <iframe
            :src="getPlayerUrl(video)"
            class="w-full h-full"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>

      <!-- Video Player (Regular) -->
      <div v-else-if="video" class="max-w-5xl mx-auto">
        <div class="mb-6">
          <h2 class="text-3xl font-bold mb-2">{{ video.name }}</h2>
          <p v-if="video.description" class="text-gray-300">{{ video.description }}</p>
        </div>

        <div class="relative aspect-video bg-black mb-4 cursor-pointer rounded-lg overflow-hidden" @click="toggleFullscreen">
          <iframe
            :src="getPlayerUrl(video)"
            class="w-full h-full"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          ></iframe>
          <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button class="bg-white/90 rounded-full p-3 transform hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center text-sm text-gray-400 mb-6">
          <span>{{ t('press.duration') }}: {{ Math.floor(video.duration / 60) }}:{{ String(video.duration % 60).padStart(2, '0') }}</span>
          <span class="mx-2">•</span>
          <span>{{ t('press.uploaded') }}: {{ new Date(video.created_time).toLocaleDateString() }}</span>
        </div>

        <!-- Notice -->
        <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-300">
          <p class="font-medium mb-2">{{ t('press.importantNotice') }}</p>
          <p>{{ t('press.screenerNotice') }}</p>
        </div>
      </div>

      <!-- Loading video -->
      <div v-else class="flex justify-center items-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p class="text-gray-400">{{ t('press.loadingVideo') }}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-800 py-3">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500">
        {{ t('press.confidentialScreener') }}
      </div>
    </div>
  </div>
</template>
