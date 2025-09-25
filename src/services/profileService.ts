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

    // ดึงข้อมูลทั้งหมดก่อน แล้วค่อยกรองใน JavaScript
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
      .limit(50); // เพิ่ม limit เพื่อให้มีข้อมูลมากขึ้นหลังจากกรอง

    if (error) {
      console.error('Profiles fetch error:', error);
      return [];
    }

    // กรองข้อมูลใน JavaScript
    const filteredProfiles = (data || []).filter(profile => {
      // ต้องมีรูปภาพ (photos หรือ photo_url)
      const hasPhotos = (profile.photos && Array.isArray(profile.photos) && profile.photos.length > 0) ||
                       (profile.photo_url && profile.photo_url.trim() !== '');
      
      // ต้องมีชื่อและอายุ
      const hasBasicInfo = profile.name && profile.name.trim() !== '' && profile.age;
      
      return hasPhotos && hasBasicInfo;
    }).slice(0, 20); // จำกัดผลลัพธ์เป็น 20 records

    console.log(`Found ${filteredProfiles.length} matching profiles`);
    return filteredProfiles;
  } catch (error) {
    console.error('Error getting matching profiles:', error);
    return [];
  }
}

// เพิ่มฟังก์ชันสำหรับบันทึกการ like/pass
export async function recordSwipeAction(
  targetUserId: string, 
  action: 'like' | 'pass'
): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return false;
    }

    const { error } = await supabase
      .from('swipes') // สมมติว่ามี table swipes
      .insert({
        user_id: user.id,
        target_user_id: targetUserId,
        action: action,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording swipe action:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error recording swipe action:', error);
    return false;
  }
}