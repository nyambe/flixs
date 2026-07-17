import { adminDb } from '~/server/utils/firebase-admin'
import { requireAdmin } from '~/server/utils/authz'
import { generatePressToken, hashPassword, getSafeExpirationDate } from '~/server/utils/pressLink'
import type { CreatePressLinkInput, PressLink } from '~/types'

export default defineEventHandler(async (event): Promise<{ success: boolean; link: PressLink; url: string }> => {
  // Verify admin authentication (custom claim { admin: true })
  const adminUser = await requireAdmin(event)

  try {
    const body = await readBody<CreatePressLinkInput>(event)

    // Validate required fields - must have either videoId (Vimeo) or bunnyId (Bunny)
    const hasVideoSource = body.videoId || body.bunnyId
    if (!hasVideoSource || !body.movieId || !body.movieTitle || !body.recipientEmail || !body.recipientName || !body.expiresAt) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: (videoId or bunnyId), movieId, movieTitle, recipientEmail, recipientName, expiresAt',
      })
    }

    // Generate unique token
    const token = generatePressToken()

    // Hash password if provided
    const hashedPassword = body.password ? hashPassword(body.password) : undefined

    // Ensure expiration date is within safe limits (max 90 days)
    const safeExpiresAt = getSafeExpirationDate(body.expiresAt)

    // Determine video source
    const videoSource = body.videoSource || (body.bunnyId ? 'bunny' : 'vimeo')

    // Create press link document (omit undefined values for Firestore)
    const pressLink: any = {
      token,
      videoId: body.videoId || '',
      movieId: body.movieId,
      movieTitle: body.movieTitle,
      videoSource,
      createdBy: adminUser.email,
      createdAt: Date.now(),
      recipientEmail: body.recipientEmail,
      recipientName: body.recipientName,
      expiresAt: safeExpiresAt,
      active: true,
      viewCount: 0,
      views: [],
    }

    // Only add optional fields if they have values
    if (body.bunnyId) {
      pressLink.bunnyId = body.bunnyId
    }

    if (body.organization) {
      pressLink.organization = body.organization
    }

    if (hashedPassword) {
      pressLink.password = hashedPassword
    }

    if (body.notes) {
      pressLink.notes = body.notes
    }

    // Save to Firestore
    const docRef = await adminDb.collection('pressLinks').add(pressLink)

    const createdLink: PressLink = {
      id: docRef.id,
      ...pressLink,
    }

    // Generate the full URL
    const config = useRuntimeConfig()
    const baseUrl = config.public.siteUrl || 'http://localhost:3000'
    const url = `${baseUrl}/press/watch/${token}`

    return {
      success: true,
      link: createdLink,
      url,
    }
  } catch (error) {
    console.error('Error creating press link:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to create press link',
    })
  }
})
