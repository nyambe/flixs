import type { H3Event } from 'h3'
import { verifyFirebaseToken } from '../utils/firebase-admin'

export default defineEventHandler(async (event: H3Event) => {
  // Skip auth for non-protected routes
  if (!event.path.startsWith('/api/protected')) {
    return
  }

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Missing or invalid authorization header'
    })
  }

  const token = authHeader.split('Bearer ')[1]
  const { valid, uid, error } = await verifyFirebaseToken(token)

  if (!valid) {
    throw createError({
      statusCode: 401,
      message: error || 'Invalid authentication'
    })
  }

  // Add the verified user ID to the event context
  event.context.auth = { uid }
}) 