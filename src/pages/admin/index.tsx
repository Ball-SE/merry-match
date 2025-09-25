import Head from 'next/head';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase/supabaseClient';

const AdminPage = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }

        // ตรวจสอบ admin role
        if (user.app_metadata?.is_admin === true) {
          setIsAuthorized(true);
        } else {
          // ถ้าไม่ใช่ admin ให้ redirect ไปหน้าแรก
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/login');
      }
    };

    checkAdminAccess();
  }, [router]);

  // แสดง loading ขณะตรวจสอบ
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // ถ้าไม่ได้รับอนุญาต ไม่แสดงอะไร (จะ redirect แล้ว)
  if (!isAuthorized) {
    return null;
  }
  return (
    <>
      <Head>
        <title>Admin Dashboard - MerryMatch</title>
        <meta name="description" content="Admin panel for MerryMatch application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AdminDashboard />
    </>
  );
};

export default AdminPage;