import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // The auth middleware will handle verification before this runs
  const { uid } = event.context.auth

  return {
    message: 'Protected route accessed successfully',
    userId: uid,
    timestamp: new Date().toISOString()
  }
}) 