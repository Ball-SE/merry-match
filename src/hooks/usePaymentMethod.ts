import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export const usePaymentMethod = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethod = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/billing/payment-method', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment method');
      }

      const result = await response.json();
      setPaymentMethod(result.paymentMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment method');
      setPaymentMethod(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  return {
    paymentMethod,
    loading,
    error,
    refetch: fetchPaymentMethod,
  };
};