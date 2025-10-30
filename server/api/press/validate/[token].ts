import { adminDb } from '~/server/utils/firebase-admin'
import { isLinkValid } from '~/server/utils/pressLink'
import type { PressLink, PressLinkValidation } from '~/types'

export default defineEventHandler(async (event): Promise<PressLinkValidation> => {
  try {
    const token = event.context.params?.token

    if (!token) {
      throw createError({
        statusCode: 400,
        message: 'Token is required',
      })
    }

    // Find press link by token
    const snapshot = await adminDb.collection('pressLinks')
      .where('token', '==', token)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return {
        valid: false,
        message: 'Press link not found',
      }
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

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

    // Check if link is valid
    const validation = isLinkValid(link)

    if (!validation.valid) {
      return {
        valid: false,
        expired: validation.reason === 'Link has expired',
        message: validation.reason,
      }
    }

    // Link is valid, return info
    return {
      valid: true,
      requiresPassword: !!link.password,
      movieTitle: link.movieTitle,
      movieId: link.movieId,
      videoId: link.videoId,
    }
  } catch (error) {
    console.error('Error validating press link:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to validate press link',
    })
  }
})
