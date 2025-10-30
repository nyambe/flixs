import { adminDb } from '~/server/utils/firebase-admin'
import { verifyPassword, isLinkValid } from '~/server/utils/pressLink'
import type { PressLink } from '~/types'

interface VerifyPasswordBody {
  password: string
}

export default defineEventHandler(async (event): Promise<{ valid: boolean; message?: string }> => {
  try {
    const token = event.context.params?.token

    if (!token) {
      throw createError({
        statusCode: 400,
        message: 'Token is required',
      })
    }

    const body = await readBody<VerifyPasswordBody>(event)

    if (!body.password) {
      throw createError({
        statusCode: 400,
        message: 'Password is required',
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
        message: validation.reason,
      }
    }

    // Check if password is required
    if (!link.password) {
      return {
        valid: true,
        message: 'No password required',
      }
    }

    // Verify password
    const isPasswordValid = verifyPassword(body.password, link.password)

    if (!isPasswordValid) {
      return {
        valid: false,
        message: 'Invalid password',
      }
    }

    return {
      valid: true,
      message: 'Password verified successfully',
    }
  } catch (error) {
    console.error('Error verifying password:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to verify password',
    })
  }
})
