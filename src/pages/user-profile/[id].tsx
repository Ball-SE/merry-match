import React from 'react';
import { useRouter } from 'next/router';
import UserProfileView from '@/components/profile/UserProfileView';

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') {
    return null;
  }

  return <UserProfileView userId={id} />;
}