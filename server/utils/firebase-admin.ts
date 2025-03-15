import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const apps = getApps()

// Initialize Firebase Admin if it hasn't been initialized
const app = apps.length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  : apps[0]

// Export the admin services we'll need
export const adminAuth = getAuth(app)
export const adminDb = getFirestore(app)

// Utility function to verify Firebase ID token
export async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return { 
      valid: true, 
      uid: decodedToken.uid,
      email: decodedToken.email,
    }
  } catch (error) {
    console.error('Error verifying Firebase token:', error)
    return { 
      valid: false, 
      error: 'Invalid token' 
    }
  }
} 