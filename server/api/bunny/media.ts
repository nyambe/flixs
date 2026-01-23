// server/api/bunny/media.ts
// Proxy endpoint to fetch all media from Bunny backend API

interface BunnyMediaResponse {
  data: BunnyMediaRaw[]
  total: number
  page: number
  limit: number
  totalPages: number
}

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

// Helper to construct playback URLs
function constructUrls(media: BunnyMediaRaw): BunnyMedia {
  const bunnyVideoId = media.bunnyVideoId
  return {
    ...media,
    videoUrl: media.videoUrl || `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${bunnyVideoId}?autoplay=true&preload=true`,
    thumbnailUrl: media.thumbnailUrl || `https://${BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/thumbnail.jpg`,
    previewUrl: media.previewUrl || `https://${BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/preview.webp`,
    playlistUrl: media.playlistUrl || `https://${BUNNY_CDN_HOSTNAME}/${bunnyVideoId}/playlist.m3u8`,
  }
}

export default defineEventHandler(async (): Promise<BunnyMedia[]> => {
  const config = useRuntimeConfig()

  const apiUrl = config.bunny.apiUrl as string
  const apiKey = config.bunny.apiKey as string
  const projectId = config.bunny.projectId as string

  // Validate configuration
  if (!apiUrl || !apiKey || !projectId) {
    throw createError({
      statusCode: 500,
      message: 'Bunny API configuration is missing. Check BUNNY_API_URL, BUNNY_API_KEY, and BUNNY_PROJECT_ID environment variables.',
    })
  }

  try {
    const endpoint = `${apiUrl}/api/v1/projects/${projectId}/media`

    const response = await $fetch<BunnyMediaResponse>(endpoint, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      query: {
        type: 'video',
        status: 'ready',
      },
    })

    // Construct playback URLs for each media item
    return response.data.map(constructUrls)
  } catch (error) {
    console.error('Bunny API error:', error)

    // Handle specific error responses
    if (error && typeof error === 'object' && 'response' in error) {
      const errorResponse = error as { response: { status: number; _data?: { message?: string } } }
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
