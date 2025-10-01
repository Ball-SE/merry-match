import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';

export interface Package {
  id: number;
  name: string;
  icon: string;
  details: string[];
  daily_swipe_limit: number;
  price_cents: number;
  currency: string;
  billing_interval: string;
  is_active: boolean;
  order_index?: number;
}

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('packages')
          .select('id, name, icon, details, daily_swipe_limit, price_cents, currency, billing_interval, is_active, order_index')
          .eq('is_active', true)
          .order('price_cents', { ascending: true });

        if (error) {
          throw error;
        }

        setPackages(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, loading, error };
};