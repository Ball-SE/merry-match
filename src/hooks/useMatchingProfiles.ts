import { useState, useEffect, useCallback, useMemo } from 'react';
import { Profile, getMatchingProfiles, ProfileFilters } from '../services/profileService';
import { Card } from '@/components/swipe/SwipeDeck';

// แปลง Profile จาก Supabase เป็น Card สำหรับ SwipeDeck
const profileToCard = (profile: Profile): Card => ({
  id: profile.id,
  title: profile.name,
  age: profile.age?.toString() || 'N/A',
  img: profile.photos && profile.photos.length > 0 
    ? profile.photos 
    : profile.photo_url 
      ? [profile.photo_url] 
      : ['/assets/user.jpg']
});

export const useMatchingProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchingProfiles = useCallback(async (filters?: ProfileFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      // ประมวลผล "default" filter ก่อนส่งไปยัง service
      let processedFilters = filters;
      if (filters?.genders?.includes('default')) {
        const { getCurrentUserProfile } = await import('../services/profileService');
        const currentUser = await getCurrentUserProfile();
        if (currentUser?.sexual_preferences) {
          processedFilters = {
            ...filters,
            genders: filters.genders
              .filter(g => g !== 'default')
              .concat(currentUser.sexual_preferences)
          };
        }
      }
      
      const profilesData = await getMatchingProfiles(processedFilters);
      setProfiles(profilesData);
      
      // แปลงเป็น Card objects สำหรับ SwipeDeck
      const cardsData = profilesData.map(profileToCard);
      setCards(cardsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matching profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  // ฟังก์ชันสำหรับลบ card ที่ swiped แล้ว
  const removeCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
    setProfiles(prev => prev.filter(profile => profile.id !== cardId));
  }, []);

  // ฟังก์ชันสำหรับอัพเดทด้วย filter ใหม่
  const updateWithFilters = useCallback((newFilters: ProfileFilters) => {
    fetchMatchingProfiles(newFilters);
  }, [fetchMatchingProfiles]);

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    fetchMatchingProfiles();
  }, []);

  return {
    profiles,
    cards,
    loading,
    error,
    refetch: fetchMatchingProfiles,
    removeCard,
    updateWithFilters
  };
};