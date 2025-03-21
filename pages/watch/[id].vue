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
}

const route = useRoute();
const videoId = route.params.id as string
const { getVideo, loading, error } = useVimeo();

const video = ref<VimeoVideo | null>(null);

onMounted(async () => {
  video.value = await getVideo(videoId);
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="error" class="text-red-500 text-center">
      {{ error }}
    </div>
    
    <div v-else-if="video" class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold mb-4">{{ video.name }}</h1>
      
      <div class="aspect-video bg-black mb-4">
        <iframe
          :src="video.player_embed_url"
          class="w-full h-full"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
      
      <div class="mb-4">
        <p v-if="video.description" class="text-gray-700">{{ video.description }}</p>
        <p v-else class="text-gray-500 italic">No description available</p>
      </div>
      
      <div class="flex items-center text-sm text-gray-500">
        <span>Duration: {{ Math.floor(video.duration / 60) }}:{{ String(video.duration % 60).padStart(2, '0') }}</span>
        <span class="mx-2">•</span>
        <span>Uploaded: {{ new Date(video.created_time).toLocaleDateString() }}</span>
      </div>
      
      <div class="mt-6">
        <NuxtLink to="/movies" class="text-blue-500 hover:underline">
          Back to all videos
        </NuxtLink>
      </div>
    </div>
    
    <div v-else class="text-center text-gray-500">
      Video not found
    </div>
  </div>
</template> 