// composables/usePressScreener.ts
import type { PressLinkValidation } from '~/types'

interface PressVideoResponse {
  videoId: string
  movieId: number
  movieTitle: string
  requiresPassword: boolean
}

export const usePressScreener = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Validate a press link token
  const validateToken = async (token: string): Promise<PressLinkValidation | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await $fetch<PressLinkValidation>(`/api/press/validate/${token}`)
      return result
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to validate press link'
      return null
    } finally {
      loading.value = false
    }
  }

  // Verify password for a protected press link
  const verifyPassword = async (token: string, password: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await $fetch<{ valid: boolean; message?: string }>(`/api/press/verify/${token}`, {
        method: 'POST',
        body: { password },
      })

      if (!result.valid) {
        error.value = result.message || 'Invalid password'
        return false
      }

      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to verify password'
      return false
    } finally {
      loading.value = false
    }
  }

  // Track a view event
  const trackView = async (token: string, duration?: number): Promise<boolean> => {
    try {
      await $fetch(`/api/press/track/${token}`, {
        method: 'POST',
        body: { duration },
      })
      return true
    } catch (err: unknown) {
      console.error('Failed to track view:', err)
      return false
    }
  }

  // Get video details for playback
  const getVideoForToken = async (token: string): Promise<PressVideoResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await $fetch<PressVideoResponse>(`/api/press/video/${token}`)
      return result
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch video'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    validateToken,
    verifyPassword,
    trackView,
    getVideoForToken,
  }
}
