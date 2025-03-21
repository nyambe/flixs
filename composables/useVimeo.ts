// composables/useVimeo.ts

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

export const useVimeo = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Get all videos
  const getVideos = async (): Promise<VimeoVideo[]> => {
    loading.value = true;
    error.value = null;
    
    try {
      const videos = await $fetch<VimeoVideo[]>('/api/vimeo/videos');
      return videos;
    } catch (err: Error | unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch videos';
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  // Get a single video by ID
  const getVideo = async (id: string): Promise<VimeoVideo | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      const video = await $fetch<VimeoVideo>(`/api/vimeo/video/${id}`);
      return video;
    } catch (err: Error | unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch video';
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    loading,
    error,
    getVideos,
    getVideo
  };
}; 