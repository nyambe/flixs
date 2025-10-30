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
  privacy: {
    view: string;
    embed: string;
    download: boolean;
    add: boolean;
    comments: string;
    password?: string;
  };
  status: string;
  id: string;
  thumbnail: string;
}

const { getVideos, formatDuration, formatDate, loading, error } = useVimeoAdmin();
const { t } = useI18n();
const videos = ref<VimeoVideo[]>([]);
const searchQuery = ref('');
const selectedVideo = ref<VimeoVideo | null>(null);
const isModalOpen = ref(false);
const updateLoading = ref(false);
const updateMessage = ref({ type: '', text: '' });
const whitelistDomains = ref('');

// Fetch videos on mount
onMounted(async () => {
  videos.value = await getVideos();
});

// Filtered videos based on search
const filteredVideos = computed(() => {
  if (!searchQuery.value) return videos.value;
  
  const query = searchQuery.value.toLowerCase();
  return videos.value.filter(video => 
    video.name.toLowerCase().includes(query) || 
    video.description?.toLowerCase().includes(query)
  );
});

// Open modal with selected video
const openVideoModal = (video: VimeoVideo) => {
  // Create a deep copy of the video to avoid reference issues
  selectedVideo.value = JSON.parse(JSON.stringify(video));
  
  // Initialize password if not present and selectedVideo exists
  if (selectedVideo.value && !selectedVideo.value.privacy.password) {
    selectedVideo.value.privacy.password = '';
  }
  
  isModalOpen.value = true;
  updateMessage.value = { type: '', text: '' };
  whitelistDomains.value = ''; // Reset whitelist domains
};

// Close modal
const closeModal = () => {
  isModalOpen.value = false;
  selectedVideo.value = null;
};

// Update video privacy/status
const updateVideoStatus = async () => {
  if (!selectedVideo.value) return;
  
  updateLoading.value = true;
  updateMessage.value = { type: '', text: '' };
  
  try {
    // Call API to update video
    await $fetch(`/api/vimeo/admin/video/${selectedVideo.value.id}/update`, {
      method: 'POST',
      body: {
        privacy: selectedVideo.value.privacy,
        name: selectedVideo.value.name,
        description: selectedVideo.value.description,
        domains: selectedVideo.value.privacy.embed === 'whitelist' ? whitelistDomains.value.split(',').map(d => d.trim()) : []
      }
    });
    
    // Update the video in the list
    const index = videos.value.findIndex(v => v.id === selectedVideo.value?.id);
    if (index !== -1 && selectedVideo.value) {
      videos.value[index] = { ...selectedVideo.value };
    }
    
    updateMessage.value = { type: 'success', text: t('Video updated successfully') };
  } catch (err) {
    console.error('Failed to update video:', err);
    updateMessage.value = { type: 'error', text: t('Failed to update video. Please try again.') };
  } finally {
    updateLoading.value = false;
  }
};

// Get status class for badge
const getStatusClass = (status: string) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800';
    case 'uploading': return 'bg-blue-100 text-blue-800';
    case 'transcoding': return 'bg-yellow-100 text-yellow-800';
    case 'unavailable': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get privacy class for badge
const getPrivacyClass = (privacy: VimeoVideo['privacy'] | undefined) => {
  if (!privacy) return 'bg-gray-100 text-gray-800';
  
  switch (privacy.view) {
    case 'anybody': return 'bg-green-100 text-green-800';
    case 'password': return 'bg-yellow-100 text-yellow-800';
    case 'disable': return 'bg-red-100 text-red-800';
    case 'nobody': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
</script>

<template>
  <div>
    <AdminNav />
    
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold">{{ t('Video Management') }}</h1>
        <p class="text-gray-600 mt-1">{{ t('Manage your Vimeo videos') }}</p>
      </div>
      
      <!-- Search and Filters -->
      <div class="flex mb-6">
        <div class="relative flex-grow">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('Search videos...')"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <span class="absolute right-3 top-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        <p class="mt-2 text-gray-600">{{ t('Loading videos...') }}</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg">
        <p>{{ error }}</p>
      </div>
      
      <!-- Videos Table -->
      <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('Video') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('Duration') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('Created') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('Status') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('Privacy') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('Actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="video in filteredVideos" :key="video.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-16 w-24 relative">
                    <img :src="video.thumbnail" :alt="video.name" class="h-full w-full object-cover rounded">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 max-w-xs truncate">{{ video.name }}</div>
                    <div class="text-sm text-gray-500 max-w-xs truncate">{{ video.description || t('No description') }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDuration(video.duration) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(video.created_time) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusClass(video.status)]">
                  {{ video.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full', getPrivacyClass(video.privacy)]">
                  {{ video.privacy?.view || t('Unknown') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                class="text-blue-600 hover:text-blue-900 mr-3"
                @click="openVideoModal(video)" 
                >
                  {{ t('Edit') }}
                </button>
                <a 
                  :href="video.link" 
                  target="_blank" 
                  class="text-gray-600 hover:text-gray-900"
                >
                  {{ t('View') }}
                </a>
              </td>
            </tr>
            <tr v-if="filteredVideos.length === 0" class="hover:bg-gray-50">
              <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                {{ t('No videos found') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Edit Video Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">{{ t('Edit Video') }}</h3>
          <button  class="text-gray-400 hover:text-gray-500" @click="closeModal">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="selectedVideo" class="px-6 py-4 text-neutral">
          <!-- Video Preview -->
          <div class="mb-4 flex items-center">
            <img :src="selectedVideo.thumbnail" alt="Video thumbnail" class="h-24 w-36 object-cover rounded">
            <div class="ml-4">
              <p class="text-xs text-gray-500">{{ t('Video ID') }}: {{ selectedVideo.id }}</p>
              <p class="text-xs text-gray-500">{{ t('Status') }}: {{ selectedVideo.status }}</p>
            </div>
          </div>
          
          <!-- Form -->
          <div class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700">{{ t('Title') }}</label>
              <input 
                v-model="selectedVideo.name" 
                type="text" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700">{{ t('Description') }}</label>
              <textarea 
                v-model="selectedVideo.description" 
                rows="3" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <!-- Privacy Settings -->
            <div>
              <label class="block text-sm font-medium text-gray-700">{{ t('Privacy') }}</label>
              <select
                v-model="selectedVideo.privacy.view"
                class="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="anybody">{{ t('Public (anybody)') }}</option>
                <option value="password">{{ t('Password Protected') }}</option>
                <option value="disable">{{ t('Private (disable)') }}</option>
                <option value="nobody">{{ t('Private (nobody)') }}</option>
              </select>
            </div>
            
            <!-- Password Field (only when password protection is selected) -->
            <div v-if="selectedVideo.privacy.view === 'password'" class="mt-3">
              <label class="block text-sm font-medium text-gray-700">{{ t('Video Password') }}</label>
              <input 
                v-model="selectedVideo.privacy.password" 
                type="text" 
                :placeholder="t('Enter password for video')" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
              <p class="mt-1 text-xs text-gray-500">{{ t('Password must be at least 6 characters') }}</p>
            </div>
            
            <!-- Embed Privacy -->
            <div>
              <label class="block text-sm font-medium text-gray-700">{{ t('Embed Privacy') }}</label>
              <select
                v-model="selectedVideo.privacy.embed"
                class="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="public">{{ t('Public (embed anywhere)') }}</option>
                <option value="private">{{ t('Private (no embedding)') }}</option>
                <option value="whitelist">{{ t('Whitelist (specific domains only)') }}</option>
              </select>
            </div>
            
            <!-- Whitelist Domains -->
            <div v-if="selectedVideo.privacy.embed === 'whitelist'">
              <label class="block text-sm font-medium text-gray-700">{{ t('Whitelist Domains') }}</label>
              <textarea
                v-model="whitelistDomains"
                rows="3"
                :placeholder="t('Example: yourdomain.com, example.org')"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="mt-1 text-sm text-gray-500">{{ t('Enter domain names separated by commas (no http:// or www needed)') }}</p>
            </div>
            
            <!-- Update Message -->
            <div 
            v-if="updateMessage.text" :class="[
              'p-3 rounded',
              updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            ]">
              {{ updateMessage.text }}
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 bg-gray-50 flex justify-end">
          <button 
          class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
          @click="closeModal" 
          >
            {{ t('Cancel') }}
          </button>
          <button 
          :disabled="updateLoading" 
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="updateVideoStatus" 
          >
            <svg v-if="updateLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ t('Save Changes') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 