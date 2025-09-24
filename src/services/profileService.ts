import { supabase } from '../lib/supabase/supabaseClient';

export interface Profile {
  id: string;
  name: string;
  email: string;
  photo_url: string | null;
  age: number | null;
  bio: string | null;
  city: string | null;
  photos: string[] | null;
  // เพิ่ม fields อื่นๆ ตามต้องการ
}

// ดึงข้อมูล profile ของ user ปัจจุบัน
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    // ดึงข้อมูล user ปัจจุบันจาก Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return null;
    }

    // ดึงข้อมูล profile จาก table profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
}

// ดึงข้อมูล profile ของ user อื่นๆ
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// อัปเดต photo_url
export async function updatePhotoUrl(photoUrl: string): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ photo_url: photoUrl })
      .eq('id', user.id);

    if (error) {
      console.error('Update photo error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating photo:', error);
    return false;
  }
}

// ดึง profiles สำหรับ matching (ไม่รวมตัวเอง)
export async function getMatchingProfiles(): Promise<Profile[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        age,
        photos,
        photo_url,
        bio,
        city
      `)
      .neq('id', user.id)
      .not('photos', 'is', null)
      .not('photos', 'eq', '[]')
      .limit(20);

    if (error) {
      console.error('Profiles fetch error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting matching profiles:', error);
    return [];
  }
}