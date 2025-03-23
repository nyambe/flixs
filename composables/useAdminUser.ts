import type { User } from 'firebase/auth';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

export const useAdminUser = () => {
  const { $firebase } = useNuxtApp();
  const adminUser = useState<User | null>('adminUser', () => null);
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
      
      // Verify user is an admin (has "developer" in email)
      if (!userCredential.user.email?.includes('developer')) {
        // Not an admin, sign them out immediately
        await $firebase.auth.signOut();
        error.value = 'You do not have administrator privileges';
        adminUser.value = null;
        return false;
      }
      
      // Is admin, store in state
      adminUser.value = userCredential.user;
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
    } catch (e) {
      console.error('Error signing out admin:', e);
    }
  };

  // Check if user is an admin
  const isAdmin = computed(() => {
    return !!adminUser.value?.email?.includes('developer');
  });

  // Initialize admin user from session on page load
  onMounted(() => {
    // Listen for auth state changes
    const unsubscribe = $firebase.auth.onAuthStateChanged((user) => {
      if (user && user.email?.includes('developer')) {
        adminUser.value = user;
      } else {
        adminUser.value = null;
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