import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';

export interface Package {
  id: number;
  name: string;
  icon: string;
  details: string[];
  daily_swipe_limit: number;
  price: number;
  currency: string;
  billing_interval: string;
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
        console.log('🔍 Fetching packages from Supabase...');
        
        // ดึงข้อมูลโดยไม่ order ตาม price_cents เพราะคอลัมน์นี้ไม่มี
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('id', { ascending: true }); // เปลี่ยนจาก price_cents เป็น id

        console.log('📦 Supabase response:', { data, error });

        if (error) {
          console.error('❌ Supabase error:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.warn('⚠️ No packages found in database');
          setPackages([]);
          return;
        }

        // เพิ่มค่า default สำหรับฟิลด์ที่ไม่มีในฐานข้อมูล
        const packagesWithDefaults = (data || []).map(pkg => ({
          ...pkg,
          price_cents: pkg.price_cents || 0, // ถ้าไม่มีให้ใช้ 0
          currency: 'THB',
          billing_interval: 'Month'
        }));

        console.log('✅ Packages loaded:', packagesWithDefaults);
        setPackages(packagesWithDefaults);
      } catch (err) {
        console.error('💥 Error fetching packages:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, loading, error };
};