import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase/supabaseClient';

export const useAuth = (redirectTo?: string) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // function logout
  const logout = async (redirectPath: string = '/') => {
    await supabase.auth.signOut();
    router.push(redirectPath);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setIsLoggedIn(!!data?.session);
          setLoading(false);
          
          if (!data?.session && redirectTo) {
            router.push(redirectTo);
          }
        }
      } catch (error) {
        if (mounted) {
          setIsLoggedIn(false);
          setLoading(false);
        }
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsLoggedIn(!!session);
        setLoading(false);
        
        if (!session && redirectTo) {
          router.push(redirectTo);
        }
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [router, redirectTo]);

  return { isLoggedIn, loading, logout };
};