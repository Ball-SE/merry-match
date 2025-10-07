import { useAuthContext } from '@/context/AuthContext';

export const useAdmin = () => {
  const { isAdmin, loading } = useAuthContext();

  return { isAdmin, loading };
};