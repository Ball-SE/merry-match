import { useState, useEffect } from 'react';
import { Profile } from '../services/profileService';
import { getCurrentUserProfile } from '../services/profileService';
import { updatePhotoUrl } from '../services/profileService';
import { Card } from '@/components/swipe/SwipeDeck';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันสำหรับดึง profile ของ user ปัจจุบัน
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await getCurrentUserProfile();
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับอัปเดต photo ของ user
  const updatePhoto = async (photoUrl: string) => {
    try {
      const success = await updatePhotoUrl(photoUrl);
      if (success) {
        // อัปเดต state ทันที
        setProfile(prev => prev ? { ...prev, photo_url: photoUrl } : null);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update photo');
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    // ข้อมูล profile ของ user ปัจจุบัน
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updatePhoto,
  };
};