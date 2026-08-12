import { adminDb } from '~/server/utils/firebase-admin'
import { requireAdmin } from '~/server/utils/authz'
import type { PressLink } from '~/types'

export default defineEventHandler(async (event): Promise<PressLink> => {
  // Verify admin authentication (custom claim { admin: true })
  await requireAdmin(event)

  try {
    const id = event.context.params?.id

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Press link ID is required',
      })
    }

    // Fetch from Firestore
    const doc = await adminDb.collection('pressLinks').doc(id).get()

    if (!doc.exists) {
      throw createError({
        statusCode: 404,
        message: 'Press link not found',
      })
    }

    const data = doc.data()!
    const link: PressLink = {
      id: doc.id,
      token: data.token,
      videoId: data.videoId,
      movieId: data.movieId,
      movieTitle: data.movieTitle,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      organization: data.organization,
      expiresAt: data.expiresAt,
      password: data.password,
      active: data.active,
      viewCount: data.viewCount || 0,
      firstViewedAt: data.firstViewedAt,
      lastViewedAt: data.lastViewedAt,
      views: data.views || [],
      notes: data.notes,
    }

    return link
  } catch (error) {
    console.error('Error fetching press link:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch press link',
    })
  }
})
