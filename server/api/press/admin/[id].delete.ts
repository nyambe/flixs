import { adminDb } from '~/server/utils/firebase-admin'
import { requireAdmin } from '~/server/utils/authz'

export default defineEventHandler(async (event): Promise<{ success: boolean; message: string }> => {
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
