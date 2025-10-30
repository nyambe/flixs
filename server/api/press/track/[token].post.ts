import { adminDb } from '~/server/utils/firebase-admin'
import { hashIpAddress, isLinkValid } from '~/server/utils/pressLink'
import type { PressLink, PressLinkView } from '~/types'

interface TrackViewBody {
  duration?: number
}

export default defineEventHandler(async (event): Promise<{ success: boolean; message: string }> => {
  try {
    const token = event.context.params?.token

    if (!token) {
      throw createError({
        statusCode: 400,
        message: 'Token is required',
      })
    }

    const body = await readBody<TrackViewBody>(event)

    // Find press link by token
    const snapshot = await adminDb.collection('pressLinks')
      .where('token', '==', token)
      .limit(1)
      .get()

    if (snapshot.empty) {
      throw createError({
        statusCode: 404,
        message: 'Press link not found',
      })
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
      throw createError({
        statusCode: 403,
        message: validation.reason || 'Press link is not valid',
      })
    }

    // Get IP address and user agent from request
    const ipAddress = getRequestHeader(event, 'x-forwarded-for') ||
                      getRequestHeader(event, 'x-real-ip') ||
                      event.node.req.socket.remoteAddress ||
                      'unknown'
    const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'

    // Create view entry
    const view: PressLinkView = {
      timestamp: Date.now(),
      ipAddress: hashIpAddress(ipAddress),
      userAgent,
      duration: body.duration,
    }

    // Update Firestore document
    const now = Date.now()
    const updateData: any = {
      viewCount: (link.viewCount || 0) + 1,
      lastViewedAt: now,
      views: [...link.views, view],
    }

    // Set firstViewedAt if this is the first view
    if (!link.firstViewedAt) {
      updateData.firstViewedAt = now
    }

    await adminDb.collection('pressLinks').doc(doc.id).update(updateData)

    return {
      success: true,
      message: 'View tracked successfully',
    }
  } catch (error) {
    console.error('Error tracking view:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to track view',
    })
  }
})
