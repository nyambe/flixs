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
  };
  status: string;
  id: string;
  thumbnail: string;
}

const { getVideos, formatDuration, formatDate, loading, error } = useVimeoAdmin();
const videos = ref<VimeoVideo[]>([]);
const searchQuery = ref('');
const selectedVideo = ref<VimeoVideo | null>(null);
const isModalOpen = ref(false);
const updateLoading = ref(false);
const updateMessage = ref({ type: '', text: '' });

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
  selectedVideo.value = { ...video };
  isModalOpen.value = true;
  updateMessage.value = { type: '', text: '' };
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
        description: selectedVideo.value.description
      }
    });
    
    // Update the video in the list
    const index = videos.value.findIndex(v => v.id === selectedVideo.value.id);
    if (index !== -1 && selectedVideo.value) {
      videos.value[index] = { ...selectedVideo.value };
    }
    
    updateMessage.value = { type: 'success', text: 'Video updated successfully' };
  } catch (err) {
    console.error('Failed to update video:', err);
    updateMessage.value = { type: 'error', text: 'Failed to update video. Please try again.' };
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
        <h1 class="text-3xl font-bold">Video Management</h1>
        <p class="text-gray-600 mt-1">Manage your Vimeo videos</p>
      </div>
      
      <!-- Search and Filters -->
      <div class="flex mb-6">
        <div class="relative flex-grow">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search videos..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span class="absolute right-3 top-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Loading videos...</p>
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Privacy</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                    <div class="text-sm text-gray-500 max-w-xs truncate">{{ video.description || 'No description' }}</div>
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
                  {{ video.privacy?.view || 'Unknown' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  @click="openVideoModal(video)" 
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <a 
                  :href="video.link" 
                  target="_blank" 
                  class="text-gray-600 hover:text-gray-900"
                >
                  View
                </a>
              </td>
            </tr>
            <tr v-if="filteredVideos.length === 0" class="hover:bg-gray-50">
              <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                No videos found
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
          <h3 class="text-lg font-medium text-gray-900">Edit Video</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="selectedVideo" class="px-6 py-4">
          <!-- Video Preview -->
          <div class="mb-4 flex items-center">
            <img :src="selectedVideo.thumbnail" alt="Video thumbnail" class="h-24 w-36 object-cover rounded">
            <div class="ml-4">
              <p class="text-xs text-gray-500">Video ID: {{ selectedVideo.id }}</p>
              <p class="text-xs text-gray-500">Status: {{ selectedVideo.status }}</p>
            </div>
          </div>
          
          <!-- Form -->
          <div class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Title</label>
              <input 
                v-model="selectedVideo.name" 
                type="text" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                v-model="selectedVideo.description" 
                rows="3" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            
            <!-- Privacy Settings -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Privacy</label>
              <select 
                v-model="selectedVideo.privacy.view" 
                class="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="anybody">Public (anybody)</option>
                <option value="password">Password Protected</option>
                <option value="disable">Private (disable)</option>
                <option value="nobody">Private (nobody)</option>
              </select>
            </div>
            
            <!-- Update Message -->
            <div v-if="updateMessage.text" :class="[
              'p-3 rounded',
              updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            ]">
              {{ updateMessage.text }}
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 bg-gray-50 flex justify-end">
          <button 
            @click="closeModal" 
            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
          >
            Cancel
          </button>
          <button 
            @click="updateVideoStatus" 
            :disabled="updateLoading" 
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg v-if="updateLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 