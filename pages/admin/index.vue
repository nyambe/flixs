<script lang="ts" setup>
import type { BunnyMedia } from '~/types'

// Bunny library dashboard (#20): read-only listing of everything uploaded,
// with copyable IDs to wire movies.json (bunny_id / bunny_trailer_id).
const { getVideos, loading, error } = useBunny();

const videos = ref<BunnyMedia[]>([]);
const copiedId = ref<string | null>(null);

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const copyId = async (id: string) => {
  await navigator.clipboard.writeText(id);
  copiedId.value = id;
  setTimeout(() => { copiedId.value = null; }, 1500);
};

// Load videos when component mounts
onMounted(async () => {
  videos.value = await getVideos();
});
</script>

<template>
  <div>
    <!-- Admin Navigation -->
    <AdminNav />

    <div class="px-6 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-2">Bunny Video Library</h1>
        <p class="text-gray-600">Vídeos subidos a Bunny (vía uptron). Copia el ID para enlazarlo en movies.json (bunny_id / bunny_trailer_id).</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
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
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Media ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="video in videos" :key="video.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex-shrink-0 h-16 w-24">
                  <img :src="video.thumbnailUrl" :alt="video.filename" class="h-full w-full object-cover rounded">
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ video.originalFilename || video.filename }}</div>
                <div v-if="video.metadata?.description" class="text-sm text-gray-500 truncate max-w-xs">{{ video.metadata.description }}</div>
                <div v-else class="text-sm text-gray-400 italic">No description</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  class="font-mono text-xs hover:text-brand"
                  :title="'Copiar ' + video.id"
                  @click="copyId(video.id)"
                >
                  {{ copiedId === video.id ? '✓ copiado' : video.id.slice(0, 8) + '… 📋' }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': video.status === 'ready',
                    'bg-yellow-100 text-yellow-800': video.status === 'uploading' || video.status === 'processing',
                    'bg-red-100 text-red-800': video.status === 'failed'
                  }"
                >
                  {{ video.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDuration(video.metadata?.duration || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(video.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <NuxtLink :to="`/watch/${video.id}`" class="text-green-600 hover:text-green-900">Watch</NuxtLink>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="videos.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                No videos found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
