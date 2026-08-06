<script setup lang="ts">
// Bunny-only playback: the route param is the Bunny media id.
// (Vimeo was retired in #20 — old /watch/<vimeoId>?source=vimeo links show "Video not found".)

interface DisplayVideo {
  name: string;
  description: string | null;
  duration: number;
  created_time: string;
  playerUrl: string;
  playlistUrl?: string;  // HLS playlist
  thumbnailUrl?: string;
}

const route = useRoute();
const videoId = route.params.id as string

const { getVideo: getBunnyVideo, loading, error } = useBunny();
const { t } = useI18n();

const video = ref<DisplayVideo | null>(null);
const isFullscreen = ref(true);

onMounted(async () => {
  try {
    const response = await getBunnyVideo(videoId);
    if (response) {
      video.value = {
        name: response.filename,
        description: response.metadata?.description || null,
        duration: response.metadata?.duration || 0,
        created_time: response.createdAt,
        playerUrl: response.videoUrl,
        playlistUrl: response.playlistUrl,
        thumbnailUrl: response.thumbnailUrl,
      };
    }
  } catch (err) {
    console.error('Error fetching video:', err);
  }

  // Listen for escape key to exit fullscreen
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      isFullscreen.value = false;
    }
  });
});

// Function to toggle fullscreen
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// Add meta to make page background dark
useHead({
  bodyAttrs: {
    class: 'bg-black'
  }
});
// Apply subscription middleware to ensure only subscribers can watch videos
definePageMeta({
  middleware: 'subscription'
})

</script>

<template>
  <!-- Fullscreen Modal -->
  <div
    v-if="video && isFullscreen"
    class="fixed inset-0 z-50 bg-black flex items-center justify-center"
  >
    <div class="absolute top-4 right-4 z-10">
      <button
        @click="toggleFullscreen"
        class="text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
        :aria-label="t('Exit fullscreen')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Video player wrapper for fullscreen -->
    <div class="w-full h-full relative">
      <BunnyPlayer
        v-if="video?.playlistUrl"
        :playlist-url="video.playlistUrl"
        :poster="video.thumbnailUrl"
        :autoplay="true"
      />
    </div>
  </div>

  <!-- Regular content when not in fullscreen -->
  <div v-else class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="error" class="text-red-500 text-center">
      {{ error }}
    </div>

    <div v-else-if="video" class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold mb-4 text-white">{{ video.name }}</h1>

      <!-- Video player - 16:9 aspect ratio -->
      <div class="relative bg-black mb-4 rounded-lg overflow-hidden" style="padding-top: 56.25%;">
        <div v-if="video?.playlistUrl" class="absolute inset-0">
          <BunnyPlayer
            :playlist-url="video.playlistUrl"
            :poster="video.thumbnailUrl"
            :autoplay="true"
          />
        </div>
      </div>

      <div class="mb-4">
        <p v-if="video.description" class="text-gray-300">{{ video.description }}</p>
        <p v-else class="text-gray-500 italic">{{ t('No description available') }}</p>
      </div>

      <div class="flex items-center text-sm text-gray-400">
        <span>{{ t('Duration') }}: {{ Math.floor(video.duration / 60) }}:{{ String(video.duration % 60).padStart(2, '0') }}</span>
        <span class="mx-2">•</span>
        <span>{{ t('Uploaded') }}: {{ new Date(video.created_time).toLocaleDateString() }}</span>
      </div>

      <div class="mt-6">
        <NuxtLink to="/movies" class="text-blue-400 hover:underline">
          {{ t('Back to all videos') }}
        </NuxtLink>
      </div>
    </div>

    <div v-else class="text-center text-gray-500">
      {{ t('Video not found') }}
    </div>
  </div>
</template>

<style scoped>
html, body {
  overflow: hidden;
}
</style>
