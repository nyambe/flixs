import { adminAuth, adminDb } from '~/server/utils/firebase-admin'

export default defineEventHandler(async (event): Promise<{ success: boolean; message: string }> => {
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

    // Check if document exists
    const docRef = adminDb.collection('pressLinks').doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw createError({
        statusCode: 404,
        message: 'Press link not found',
      })
    }

    // Soft delete - just set active to false
    await docRef.update({ active: false })

    return {
      success: true,
      message: 'Press link deactivated successfully',
    }
  } catch (error) {
    console.error('Error deleting press link:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to delete press link',
    })
  }
})
