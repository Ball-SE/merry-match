import { useState, useCallback} from 'react';
import { Profile, getMatchingProfiles, ProfileFilters } from '../services/profileService';
import { Card } from '@/components/swipe/SwipeDeck';

// แปลง Profile จาก Supabase เป็น Card สำหรับ SwipeDeck
const profileToCard = (profile: Profile): Card => {
  // จัดการข้อมูล location อย่างปลอดภัย
  let locationData = undefined;
  
  if (profile.location) {
    try {
      // ถ้าเป็น string ให้ parse เป็น JSON
      if (typeof profile.location === 'string') {
        locationData = JSON.parse(profile.location);
      } 
      // ถ้าเป็น object อยู่แล้วให้ใช้เลย
      else if (typeof profile.location === 'object') {
        locationData = profile.location;
      }
    } catch (error) {
      console.warn('Failed to parse location data:', error);
      // ถ้า parse ไม่ได้ให้ใช้ค่า default
      locationData = undefined;
    }
  }

  return {
    id: profile.id,
    title: profile.name,
    age: profile.age?.toString() || 'N/A',
    img: profile.photos && profile.photos.length > 0 
      ? profile.photos 
      : profile.photo_url 
        ? [profile.photo_url] 
        : ['/assets/user.jpg'],
    location: locationData
  };
};

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