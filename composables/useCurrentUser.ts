import type { User } from 'firebase/auth';

export const useCurrentUser = () => {
  const user = useState<User | null>('currentUser', () => null);

  return user;
}; 