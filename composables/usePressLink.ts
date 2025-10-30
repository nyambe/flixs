// composables/usePressLink.ts
import type { PressLink, CreatePressLinkInput, UpdatePressLinkInput } from '~/types'

export const usePressLink = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { $firebase } = useNuxtApp()

  // Get auth token
  const getAuthToken = async (): Promise<string> => {
    const user = $firebase.auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }
    return await user.getIdToken()
  }

  // Create a new press link
  const createPressLink = async (input: CreatePressLinkInput): Promise<{ success: boolean; link: PressLink; url: string } | null> => {
    loading.value = true
    error.value = null

    try {
      const token = await getAuthToken()
      const result = await $fetch<{ success: boolean; link: PressLink; url: string }>('/api/press/admin/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: input,
      })
      return result
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create press link'
      return null
    } finally {
      loading.value = false
    }
  }

  // Get all press links
  const getPressLinks = async (status?: 'active' | 'expired' | 'inactive' | 'all'): Promise<PressLink[]> => {
    loading.value = true
    error.value = null

    try {
      const token = await getAuthToken()
      const query = status ? `?status=${status}` : ''
      const result = await $fetch<{ links: PressLink[]; total: number }>(`/api/press/admin/list${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      return result.links
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch press links'
      return []
    } finally {
      loading.value = false
    }
  }

  // Get a single press link by ID
  const getPressLink = async (id: string): Promise<PressLink | null> => {
    loading.value = true
    error.value = null

    try {
      const token = await getAuthToken()
      const result = await $fetch<PressLink>(`/api/press/admin/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      return result
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch press link'
      return null
    } finally {
      loading.value = false
    }
  }

  // Update a press link
  const updatePressLink = async (id: string, input: UpdatePressLinkInput): Promise<{ success: boolean; link: PressLink } | null> => {
    loading.value = true
    error.value = null

    try {
      const token = await getAuthToken()
      const result = await $fetch<{ success: boolean; link: PressLink }>(`/api/press/admin/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: input,
      })
      return result
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to update press link'
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete (deactivate) a press link
  const deletePressLink = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const token = await getAuthToken()
      await $fetch(`/api/press/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to delete press link'
      return false
    } finally {
      loading.value = false
    }
  }

  // Format expiration date
  const formatExpirationDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return 'Expired'
    } else if (diffDays === 0) {
      return 'Expires today'
    } else if (diffDays === 1) {
      return 'Expires tomorrow'
    } else if (diffDays < 7) {
      return `Expires in ${diffDays} days`
    } else {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  // Check if link is expired
  const isExpired = (expiresAt: number): boolean => {
    return Date.now() > expiresAt
  }

  // Get link status
  const getLinkStatus = (link: PressLink): 'active' | 'expired' | 'inactive' => {
    if (!link.active) return 'inactive'
    if (isExpired(link.expiresAt)) return 'expired'
    return 'active'
  }

  return {
    loading,
    error,
    createPressLink,
    getPressLinks,
    getPressLink,
    updatePressLink,
    deletePressLink,
    formatExpirationDate,
    isExpired,
    getLinkStatus,
  }
}
