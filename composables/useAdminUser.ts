import type { User } from 'firebase/auth';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

// Admin status is the Firebase custom claim { admin: true },
// granted with scripts/set-admin-claim.js (requires re-login to take effect).
const hasAdminClaim = async (user: User): Promise<boolean> => {
  const { claims } = await user.getIdTokenResult();
  return claims.admin === true;
};

export const useAdminUser = () => {
  const { $firebase } = useNuxtApp();
  const adminUser = useState<User | null>('adminUser', () => null);
  const isAdmin = useState<boolean>('adminUserIsAdmin', () => false);
  const loading = useState<boolean>('adminAuthLoading', () => false);
  const error = useState<string | null>('adminAuthError', () => null);

  // Sign in admin user
  const signIn = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;

    try {
      const userCredential = await signInWithEmailAndPassword(
        $firebase.auth,
        email,
        password
      );

      // Verify user is an admin (custom claim)
      if (!(await hasAdminClaim(userCredential.user))) {
        // Not an admin, sign them out immediately
        await $firebase.auth.signOut();
        error.value = 'You do not have administrator privileges';
        adminUser.value = null;
        isAdmin.value = false;
        return false;
      }

      // Is admin, store in state
      adminUser.value = userCredential.user;
      isAdmin.value = true;
      return true;
    } catch (e: Error | unknown) {
      // Handle specific error cases
      if (e && typeof e === 'object' && 'code' in e) {
        const authError = e as { code: string };

        if (authError.code === 'auth/invalid-credential') {
          error.value = 'Invalid email or password';
        } else if (authError.code === 'auth/too-many-requests') {
          error.value = 'Too many failed login attempts. Please try again later';
        } else {
          error.value = 'Failed to sign in. Please try again.';
          console.error('Admin login error:', e);
        }
      } else {
        error.value = 'An unexpected error occurred';
        console.error('Admin login error:', e);
      }
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Sign out admin user
  const signOut = async () => {
    try {
      await firebaseSignOut($firebase.auth);
      adminUser.value = null;
      isAdmin.value = false;
    } catch (e) {
      console.error('Error signing out admin:', e);
    }
  };

  // Initialize admin user from session on page load
  onMounted(() => {
    // Listen for auth state changes
    const unsubscribe = $firebase.auth.onAuthStateChanged(async (user) => {
      if (user && (await hasAdminClaim(user))) {
        adminUser.value = user;
        isAdmin.value = true;
      } else {
        adminUser.value = null;
        isAdmin.value = false;
      }
    });

    // Clean up the listener when component unmounts
    onUnmounted(() => {
      unsubscribe();
    });
  });

  return {
    user: adminUser,
    loading,
    error,
    signIn,
    signOut,
    isAdmin
  };
};
