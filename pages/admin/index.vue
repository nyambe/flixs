<script lang="ts" setup>

// Define interface for Vimeo video
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
  privacy: {
    view: string;
    embed: string;
    download: boolean;
    add: boolean;
    comments: string;
  };
  status: string;
  id: string;
  thumbnail: string;
}

// Since we don't have useVimeoAdmin composable yet, we'll implement it inline
const loading = ref(false);
const error = ref<string | null>(null);
const videos = ref<VimeoVideo[]>([]);

// Format duration as mm:ss
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Format date to readable format
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get videos from admin API
const getVideos = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    videos.value = await $fetch<VimeoVideo[]>('/api/vimeo/admin/videos');
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch videos';
  } finally {
    loading.value = false;
  }
};

// Load videos when component mounts
onMounted(() => {
  getVideos();
});
</script>

<template>
  <div>
    <!-- Admin Navigation -->
    <AdminNav />
    
    <div class="px-6 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-2">Vimeo Video Management</h1>
        <p class="text-gray-600">Manage your Vimeo videos and their settings</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{{ error }}</p>
      </div>
      
      <!-- Videos Table -->
      <div v-else class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thumbnail
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Video ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Privacy
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="video in videos" :key="video.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex-shrink-0 h-16 w-24">
                  <img :src="video.thumbnail" :alt="video.name" class="h-full w-full object-cover rounded">
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ video.name }}</div>
                <div v-if="video.description" class="text-sm text-gray-500 truncate max-w-xs">{{ video.description }}</div>
                <div v-else class="text-sm text-gray-400 italic">No description</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ video.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': video.privacy.view === 'anybody',
                    'bg-yellow-100 text-yellow-800': video.privacy.view === 'password',
                    'bg-red-100 text-red-800': video.privacy.view === 'nobody',
                    'bg-blue-100 text-blue-800': video.privacy.view === 'contacts' || video.privacy.view === 'users'
                  }"
                >
                  {{ video.privacy.view }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': video.status === 'available',
                    'bg-yellow-100 text-yellow-800': video.status === 'uploading' || video.status === 'transcoding',
                    'bg-red-100 text-red-800': video.status === 'quota_exceeded' || video.status === 'error'
                  }"
                >
                  {{ video.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDuration(video.duration) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(video.created_time) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <a :href="video.link" target="_blank" class="text-indigo-600 hover:text-indigo-900">View</a>
                  <NuxtLink :to="`/watch/${video.id}`" class="text-green-600 hover:text-green-900">Watch</NuxtLink>
                </div>
              </td>
            </tr>
            
            <!-- Empty State -->
            <tr v-if="videos.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                No videos found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style>
.table-wrapper {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
</style>