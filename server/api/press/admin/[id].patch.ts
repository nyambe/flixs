import { adminAuth, adminDb } from '~/server/utils/firebase-admin'
import { hashPassword, getSafeExpirationDate } from '~/server/utils/pressLink'
import type { UpdatePressLinkInput, PressLink } from '~/types'

export default defineEventHandler(async (event): Promise<{ success: boolean; link: PressLink }> => {
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

    const body = await readBody<UpdatePressLinkInput>(event)

    // Build update object with only provided fields (omit undefined for Firestore)
    const updateData: any = {}

    if (body.recipientEmail !== undefined) {
      updateData.recipientEmail = body.recipientEmail
    }

    if (body.recipientName !== undefined) {
      updateData.recipientName = body.recipientName
    }

    if (body.organization !== undefined && body.organization) {
      updateData.organization = body.organization
    }

    if (body.expiresAt !== undefined) {
      updateData.expiresAt = getSafeExpirationDate(body.expiresAt)
    }

    if (body.password !== undefined && body.password) {
      updateData.password = hashPassword(body.password)
    }

    if (body.active !== undefined) {
      updateData.active = body.active
    }

    if (body.notes !== undefined && body.notes) {
      updateData.notes = body.notes
    }

    // Check if there's data to update
    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No update data provided',
      })
    }

    // Update in Firestore
    const docRef = adminDb.collection('pressLinks').doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw createError({
        statusCode: 404,
        message: 'Press link not found',
      })
    }

    await docRef.update(updateData)

    // Fetch updated document
    const updatedDoc = await docRef.get()
    const data = updatedDoc.data()!

    const updatedLink: PressLink = {
      id: updatedDoc.id,
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

    return {
      success: true,
      link: updatedLink,
    }
  } catch (error) {
    console.error('Error updating press link:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to update press link',
    })
  }
})
