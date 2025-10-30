import { adminAuth, adminDb } from '~/server/utils/firebase-admin'
import type { PressLink } from '~/types'

export default defineEventHandler(async (event): Promise<PressLink> => {
  // Verify admin authentication
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Missing or invalid authorization token',
    })
  }

  const idToken = authHeader.split('Bearer ')[1]
  let adminUser
  try {
    adminUser = await adminAuth.verifyIdToken(idToken)
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid authorization token',
    })
  }

  // Verify admin privileges
  if (!adminUser.email?.includes('developer')) {
    throw createError({
      statusCode: 403,
      message: 'Unauthorized access - admin privileges required',
    })
  }

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
