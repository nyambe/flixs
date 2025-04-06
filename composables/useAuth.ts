// composables/useAuth.ts
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile, // Add this import
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const useCurrentUser = () => useState<User | null>('currentUser', () => null);
export const useUserSubscription = () => useState<{ active: boolean; type?: string } | null>('userSubscription', () => null);

export const useAuth = () => {
  const { $firebase } = useNuxtApp();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const userSubscription = useUserSubscription();
  
  // Initialize auth state
  onMounted(() => {
    if (import.meta.client) {
      const unsubscribe = onAuthStateChanged($firebase.auth, async (user) => {
        currentUser.value = user;
        
        // Fetch subscription status if user is logged in
        if (user) {
          const userDoc = await getDoc(doc($firebase.firestore, 'users', user.uid));
          const userData = userDoc.data();
          
          userSubscription.value = userData?.subscription || { active: false };
        } else {
          userSubscription.value = null;
        }
      });
      
      // Clean up listener
      onUnmounted(() => unsubscribe());
    }
  });
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword($firebase.auth, email, password);
      router.push('/movies');
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('auth')) {
        return { 
          success: false, 
          error: 'Invalid user or password'
        };
      }
      return { 
        success: false, 
        error: 'An unknown error occurred'
      };
    }
  };
  
  // Register with email and password
  const register = async (email: string, password: string, name: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword($firebase.auth, email, password);
      
      // Update Firebase Authentication profile with displayName
      await updateProfile(user, { displayName: name });
      
      // Create user document in Firestore
      await setDoc(doc($firebase.firestore, 'users', user.uid), {
        email,
        name,
        createdAt: new Date(),
        subscription: {
          active: false,
        },
      });
      
      router.push('/subscription/plans');
      return { success: true };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut($firebase.auth);
      router.push('/');
      return { success: true };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  };
  
  return {
    currentUser,
    userSubscription,
    signIn,
    register,
    signOut,
  };
};