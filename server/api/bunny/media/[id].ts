// server/api/bunny/media/[id].ts
// Proxy endpoint to fetch a single media item from Bunny backend API
import { requireSubscriberOrAdmin } from '~/server/utils/authz'
import { adminDb } from '~/server/utils/firebase-admin'
import { isLinkValid } from '~/server/utils/pressLink'
import type { PressLink } from '~/types'

// Raw response from backend API (may not include computed URLs)
interface BunnyMediaRaw {
  id: string
  filename: string
  originalFilename: string
  size: number
  type: string
  mimeType: string
  projectId: string
  clientId: string
  path: string
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  createdAt: string
  updatedAt: string
  bunnyVideoId: string
  bunnyCollectionId: string
  metadata: {
    description?: string
    duration: number
    resolution: string
    bunnyVideoStatus?: string
    bunnyVideoStatusCode?: number
  }
  thumbnailUrl?: string
  previewUrl?: string
  videoUrl?: string
  playlistUrl?: string
}

// Response with computed URLs
interface BunnyMedia extends BunnyMediaRaw {
  thumbnailUrl: string
  previewUrl: string
  videoUrl: string
  playlistUrl: string
}

// Bunny.net CDN configuration
const BUNNY_LIBRARY_ID = '425878'
const BUNNY_CDN_HOSTNAME = 'vz-911a78b8-b44.b-cdn.net'

export default defineEventHandler(async (event): Promise<BunnyMedia> => {
  const config = useRuntimeConfig()
  const mediaId = event.context.params?.id

  if (!mediaId) {
    throw createError({
      statusCode: 400,
      message: 'Media ID is required',
    })
  }

  // Access: a valid press link token for this exact video, or an active subscriber/admin
  const pressToken = getHeader(event, 'x-press-token')
  if (pressToken) {
    const snapshot = await adminDb.collection('pressLinks')
      .where('token', '==', pressToken)
      .limit(1)
      .get()

    const link = snapshot.empty ? null : (snapshot.docs[0].data() as PressLink)
    const { valid } = isLinkValid(link)

    if (!valid || link?.bunnyId !== mediaId) {
      throw createError({
        statusCode: 403,
        message: 'Invalid press link for this video',
      })
    }
  } else {
    await requireSubscriberOrAdmin(event)
  }

  const apiUrl = config.bunny.apiUrl as string
  const apiKey = config.bunny.apiKey as string

  // Validate configuration
  if (!apiUrl || !apiKey) {
    throw createError({
      statusCode: 500,
      message: 'Bunny API configuration is missing. Check BUNNY_API_URL and BUNNY_API_KEY environment variables.',
    })
  }

  try {
    const endpoint = `${apiUrl}/api/v1/media/${mediaId}`

    const media = await $fetch<BunnyMediaRaw>(endpoint, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    // Construct playback URLs from bunnyVideoId if not provided by backend
    // Use /embed/ endpoint with autoplay and preload for proper playback
    const bunnyVideoId = media.bunnyVideoId
    const videoUrl = media.videoUrl || `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${bunnyVideoId}?autoplay=true&preload=true`
    const thumbnailUrl = media.thumbnailUrl || `https://${BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/thumbnail.jpg`
    const previewUrl = media.previewUrl || `https://${BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/preview.webp`
    const playlistUrl = media.playlistUrl || `https://${BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/playlist.m3u8`

    return {
      ...media,
      videoUrl,
      thumbnailUrl,
      previewUrl,
      playlistUrl,
    }
  } catch (error) {
    console.error('Bunny API error:', error)

    // Handle specific error responses
    if (error && typeof error === 'object' && 'response' in error) {
      const errorResponse = error as { response: { status: number; _data?: { message?: string } } }

      if (errorResponse.response.status === 404) {
        throw createError({
          statusCode: 404,
          message: 'Media not found',
        })
      }

      throw createError({
        statusCode: errorResponse.response.status,
        message: errorResponse.response._data?.message || 'Failed to fetch media from Bunny API',
      })
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch media from Bunny API',
    })
  }
})
