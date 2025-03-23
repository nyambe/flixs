// composables/useVimeoAdmin.ts

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

export const useVimeoAdmin = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Get all videos with admin details
  const getVideos = async (): Promise<VimeoVideo[]> => {
    loading.value = true;
    error.value = null;
    
    try {
      const videos = await $fetch<VimeoVideo[]>('/api/vimeo/admin/videos');
      return videos;
    } catch (err: Error | unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch videos';
      return [];
    } finally {
      loading.value = false;
    }
  };
  
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
  
  return {
    loading,
    error,
    getVideos,
    formatDuration,
    formatDate
  };
}; 