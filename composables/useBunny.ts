// composables/useBunny.ts
import type { BunnyMedia } from '~/types'

export const useBunny = () => {
  const { $firebase } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Bearer token of the signed-in user (subscriber or admin), if any
  const authHeaders = async (): Promise<Record<string, string>> => {
    const user = $firebase.auth.currentUser
    return user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {}
  }

  // Get all videos from Bunny (admin only)
  const getVideos = async (): Promise<BunnyMedia[]> => {
    loading.value = true
    error.value = null

    try {
      const videos = await $fetch<BunnyMedia[]>('/api/bunny/media', {
        headers: await authHeaders(),
      })
      return videos
    } catch (err: Error | unknown) {
      console.error('Bunny API error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch videos'
      return []
    } finally {
      loading.value = false
    }
  }

  // Get a single video by ID.
  // Auth: session token of a subscriber/admin, or a press link token for this video.
  const getVideo = async (id: string, pressToken?: string): Promise<BunnyMedia | null> => {
    loading.value = true
    error.value = null

    try {
      const headers = pressToken
        ? { 'x-press-token': pressToken }
        : await authHeaders()

      const video = await $fetch<BunnyMedia>(`/api/bunny/media/${id}`, { headers })
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
