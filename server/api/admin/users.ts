import { adminAuth, adminDb } from '~/server/utils/firebase-admin';
import { requireAdmin } from '~/server/utils/authz';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  lastLogin: string | null;
  createdAt: string;
  subscription: {
    active: boolean;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    priceId?: string;
    currentPeriodEnd?: number;
    status?: string;
    cancelAtPeriodEnd?: boolean;
    updatedAt?: string;
    subscriptionType?: 'monthly' | 'yearly' | 'education';
  } | null;
}

export default defineEventHandler(async (event): Promise<User[]> => {
  // Verify the user is an admin (custom claim { admin: true })
  await requireAdmin(event);

  try {
    // Get all users from Firebase Auth
    const { users: authUsers } = await adminAuth.listUsers(100); // Limit to 100 users for performance
    
    // Get subscription data from Firestore
    const usersData = await Promise.all(
      authUsers.map(async (authUser) => {
        try {
          // Get user document from Firestore
          const userDoc = await adminDb.collection('users').doc(authUser.uid).get();
          const userData = userDoc.data() || {};
          
          // Construct user object with both auth and subscription data
          return {
            id: authUser.uid,
            email: authUser.email || '',
            displayName: authUser.displayName || null,
            photoURL: authUser.photoURL || null,
            lastLogin: authUser.metadata.lastSignInTime || null,
            createdAt: authUser.metadata.creationTime || '',
            subscription: userData.subscription || null,
          };
        } catch (err) {
          console.error(`Error fetching data for user ${authUser.uid}:`, err);
          
          // Return user with basic info if Firestore data is unavailable
          return {
            id: authUser.uid,
            email: authUser.email || '',
            displayName: authUser.displayName || null,
            photoURL: authUser.photoURL || null,
            lastLogin: authUser.metadata.lastSignInTime || null,
            createdAt: authUser.metadata.creationTime || '',
            subscription: null,
          };
        }
      })
    );
    
    // Filter out users without stripeSubscriptionId and ensure subscription is active
    const filteredUsers = usersData.filter(user => 
      user.subscription?.stripeSubscriptionId 
    );
    
    return filteredUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch users',
      data: error,
    });
  }
}); 