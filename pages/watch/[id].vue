<script setup lang="ts">
interface VimeoVideo {
  uri: string;
  name: string;
  description: string | null;
  duration: number;
  pictures: {
    sizes: { width: number; height: number; link: string }[];
  };
  created_time: string;
  link: string;
  player_embed_url: string;
  id: string;
  thumbnail: string;
  privacy: {
    view: string;
    embed: string;
    download: boolean;
    add: boolean;
    comments: string;
  };
  embed?: {
    html: string;
  };
  status: string;
}

const route = useRoute();
const videoId = route.params.id as string
const { getVideo, loading, error } = useVimeo();
const { t } = useI18n();

const video = ref<VimeoVideo | null>(null);
const isFullscreen = ref(true);

onMounted(async () => {
  try {
    const response = await getVideo(videoId);
    if (response && 'uri' in response) {
      video.value = response as VimeoVideo;
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

// Add autoplay parameter to player URL
const getPlayerUrl = (video: VimeoVideo) => {
  if (!video.player_embed_url) return '';
  
  // Base URL is already configured for private videos from the API
  const baseUrl = video.player_embed_url;
  
  // Add autoplay parameter if not already present
  if (!baseUrl.includes('autoplay=')) {
    const autoplayParam = baseUrl.includes('?') ? '&autoplay=1' : '?autoplay=1';
    return `${baseUrl}${autoplayParam}`;
  }
  
  return baseUrl;
};

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
      
      <div class="relative aspect-video bg-black mb-4 cursor-pointer" @click="toggleFullscreen">
        <iframe
          :src="getPlayerUrl(video)"
          class="w-full h-full"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
        ></iframe>
        <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <button class="bg-white/90 rounded-full p-3 transform hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
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