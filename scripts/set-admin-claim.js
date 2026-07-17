// Grants (or revokes) the { admin: true } custom claim on a Firebase user.
// The affected user must sign out and back in for the claim to take effect.
//
// Usage:
//   node --env-file=.env scripts/set-admin-claim.js admin@example.com
//   node --env-file=.env scripts/set-admin-claim.js admin@example.com --remove

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const email = process.argv[2]
const remove = process.argv.includes('--remove')

if (!email || email.startsWith('--')) {
  console.error('Usage: node --env-file=.env scripts/set-admin-claim.js <email> [--remove]')
  process.exit(1)
}

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('Missing FIREBASE_* env vars. Run with: node --env-file=.env scripts/set-admin-claim.js <email>')
  process.exit(1)
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
})

const auth = getAuth(app)
const user = await auth.getUserByEmail(email)
await auth.setCustomUserClaims(user.uid, remove ? { admin: null } : { admin: true })

console.log(`${remove ? 'Revoked' : 'Granted'} admin claim for ${email} (uid: ${user.uid})`)
console.log('The user must sign out and sign in again for the change to take effect.')
