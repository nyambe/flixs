import { adminAuth, adminDb } from '~/server/utils/firebase-admin'
import { generatePressToken, hashPassword, getSafeExpirationDate } from '~/server/utils/pressLink'
import type { CreatePressLinkInput, PressLink } from '~/types'

export default defineEventHandler(async (event): Promise<{ success: boolean; link: PressLink; url: string }> => {
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
    const body = await readBody<CreatePressLinkInput>(event)

    // Validate required fields
    if (!body.videoId || !body.movieId || !body.movieTitle || !body.recipientEmail || !body.recipientName || !body.expiresAt) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: videoId, movieId, movieTitle, recipientEmail, recipientName, expiresAt',
      })
    }

    // Generate unique token
    const token = generatePressToken()

    // Hash password if provided
    const hashedPassword = body.password ? hashPassword(body.password) : undefined

    // Ensure expiration date is within safe limits (max 90 days)
    const safeExpiresAt = getSafeExpirationDate(body.expiresAt)

    // Create press link document
    const pressLink: Omit<PressLink, 'id'> = {
      token,
      videoId: body.videoId,
      movieId: body.movieId,
      movieTitle: body.movieTitle,
      createdBy: adminUser.email,
      createdAt: Date.now(),
      recipientEmail: body.recipientEmail,
      recipientName: body.recipientName,
      organization: body.organization,
      expiresAt: safeExpiresAt,
      password: hashedPassword,
      active: true,
      viewCount: 0,
      views: [],
      notes: body.notes,
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
