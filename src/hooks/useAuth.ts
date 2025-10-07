import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuthContext } from '@/context/AuthContext';

export const useAuth = (redirectTo?: string) => {
  const { isLoggedIn, loading } = useAuthContext();
  const router = useRouter();

  // function logout
  const logout = async (redirectPath: string = '/') => {
    await supabase.auth.signOut();
    router.push(redirectPath);
  };

  if (!isLoggedIn && !loading && redirectTo) {
    router.push(redirectTo);
  }

  return { isLoggedIn, loading, logout };
};