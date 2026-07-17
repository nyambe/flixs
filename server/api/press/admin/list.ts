import { adminDb } from '~/server/utils/firebase-admin'
import { requireAdmin } from '~/server/utils/authz'
import type { PressLink } from '~/types'

interface ListPressLinksQuery {
  status?: 'active' | 'expired' | 'inactive' | 'all'
  limit?: number
  offset?: number
}

export default defineEventHandler(async (event): Promise<{ links: PressLink[]; total: number }> => {
  // Verify admin authentication (custom claim { admin: true })
  await requireAdmin(event)

  try {
    const query = getQuery(event) as ListPressLinksQuery
    const status = query.status || 'all'
    const limit = query.limit || 100
    const now = Date.now()

    // Build Firestore query
    let firestoreQuery = adminDb.collection('pressLinks').orderBy('createdAt', 'desc')

    // Filter by status if specified
    if (status === 'active') {
      firestoreQuery = firestoreQuery.where('active', '==', true)
    } else if (status === 'inactive') {
      firestoreQuery = firestoreQuery.where('active', '==', false)
    }

    // Apply limit
    firestoreQuery = firestoreQuery.limit(limit)

    // Execute query
    const snapshot = await firestoreQuery.get()

    // Convert to PressLink objects and filter expired if needed
    const links: PressLink[] = []
    snapshot.forEach((doc) => {
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

      // Filter by expiration status if needed
      const isExpired = link.expiresAt < now
      if (status === 'expired' && isExpired) {
        links.push(link)
      } else if (status === 'active' && !isExpired && link.active) {
        links.push(link)
      } else if (status === 'all' || status === 'inactive') {
        links.push(link)
      }
    })

    return {
      links,
      total: links.length,
    }
  } catch (error) {
    console.error('Error fetching press links:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch press links',
    })
  }
})
