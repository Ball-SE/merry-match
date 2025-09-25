import { useState, useEffect } from 'react';
import { Profile, getMatchingProfiles } from '../services/profileService';
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
      : ['/assets/user.jpg'] // default image
});

export const useMatchingProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchingProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const profilesData = await getMatchingProfiles();
      setProfiles(profilesData);
      
      // แปลงเป็น Card objects สำหรับ SwipeDeck
      const cardsData = profilesData.map(profileToCard);
      setCards(cardsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matching profiles');
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับลบ card ที่ swiped แล้ว
  const removeCard = (cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
    setProfiles(prev => prev.filter(profile => profile.id !== cardId));
  };

  useEffect(() => {
    fetchMatchingProfiles();
  }, []);

  return {
    profiles,
    cards,
    loading,
    error,
    refetch: fetchMatchingProfiles,
    removeCard
  };
};