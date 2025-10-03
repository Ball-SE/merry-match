import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';

interface BillingHistoryItem {
  id: number;
  date: string;
  package: string;
  amount: number;
  status: string;
}

export const useBillingHistory = () => {
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/billing/billing-history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch billing history');
      }

      const result = await response.json();
      setBillingHistory(result.billingHistory || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch billing history');
      setBillingHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  return {
    billingHistory,
    loading,
    error,
    refetch: fetchBillingHistory,
  };
};