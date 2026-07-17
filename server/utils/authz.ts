// server/utils/authz.ts
// Central authorization helpers for server endpoints.
// Admin status is a Firebase custom claim ({ admin: true }), set with scripts/set-admin-claim.js

import type { H3Event } from 'h3'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { adminAuth } from './firebase-admin'

// Verifies the Bearer token and returns the decoded Firebase user. Throws 401 otherwise.
export async function requireUser(event: H3Event): Promise<DecodedIdToken> {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Missing or invalid authorization token',
    })
  }

  try {
    return await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
  } catch {
    throw createError({
      statusCode: 401,
      message: 'Invalid authorization token',
    })
  }
}

// Requires a signed-in user with the { admin: true } custom claim. Throws 401/403 otherwise.
export async function requireAdmin(event: H3Event): Promise<DecodedIdToken> {
  const user = await requireUser(event)

  if (user.admin !== true) {
    throw createError({
      statusCode: 403,
      message: 'Unauthorized access - admin privileges required',
    })
  }

  return user
}
