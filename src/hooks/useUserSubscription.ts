import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';

interface UserSubscription {
  id: number;
  user_id: string;
  package_id: number;
  status: string;
  current_period_start: string;
  current_period_end: string;
  package: {
    id: number;
    name: string;
    daily_swipe_limit: number;
    details: string[];
    price: number;
  };
}

export const useUserSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          packages (
            id,
            name,
            daily_swipe_limit,
            details,
            price
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
        throw fetchError;
      }

      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    hasActiveSubscription: !!subscription,
    packageName: subscription?.package?.name || 'Free',
  };
};