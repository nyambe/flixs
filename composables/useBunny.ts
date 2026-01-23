// composables/useBunny.ts
import type { BunnyMedia } from '~/types'

export const useBunny = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get all videos from Bunny
  const getVideos = async (): Promise<BunnyMedia[]> => {
    loading.value = true
    error.value = null

    try {
      const videos = await $fetch<BunnyMedia[]>('/api/bunny/media')
      return videos
    } catch (err: Error | unknown) {
      console.error('Bunny API error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch videos'
      return []
    } finally {
      loading.value = false
    }
  }

  // Get a single video by ID
  const getVideo = async (id: string): Promise<BunnyMedia | null> => {
    loading.value = true
    error.value = null

    try {
      const video = await $fetch<BunnyMedia>(`/api/bunny/media/${id}`)
      return video
    } catch (err: Error | unknown) {
      console.error('Bunny API error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch video'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getVideos,
    getVideo,
  }
}
