import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        // ตรวจสอบ is_admin จาก app_metadata
        const isAdminUser = user.app_metadata?.is_admin === true;
        
        if (mounted) {
          setIsAdmin(isAdminUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    checkAdminStatus();

    // ฟังการเปลี่ยนแปลง auth state
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const isAdminUser = session.user.app_metadata?.is_admin === true;
        if (mounted) {
          setIsAdmin(isAdminUser);
          setLoading(false);
        }
      } else {
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading };
};