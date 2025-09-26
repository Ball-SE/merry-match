import { supabase } from '../lib/supabase/supabaseClient';

export interface Profile {
  id: string;
  name: string;
  email: string;
  photo_url: string | null;
  age: number | null;
  bio: string | null;
  location: string | null; // เปลี่ยนจาก city เป็น location
  photos: string[] | null;
  gender?: string | null; // เพิ่ม gender field
  // เพิ่ม fields อื่นๆ ตามต้องการ
}

export interface ProfileFilters {
  genders?: string[];
  minAge?: number;
  maxAge?: number;
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
export async function getMatchingProfiles(filters?: ProfileFilters): Promise<Profile[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return [];
    }

    // ใช้ LEFT JOIN เพื่อ exclude คนที่เคย swipe แล้ว
    let query = supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        age,
        photos,
        photo_url,
        bio,
        location,
        gender,
        sexual_preferences,
        racial_preferences,
        meeting_interests,
        interests
      `)
      .neq('id', user.id); // ไม่รวมตัวเอง

    // เพิ่ม age filter
    if (filters?.minAge && filters.minAge > 18) {
      query = query.gte('age', filters.minAge);
    }
    if (filters?.maxAge && filters.maxAge < 80) {
      query = query.lte('age', filters.maxAge);
    }

    // ดึงข้อมูลทั้งหมด
    const { data, error } = await query.limit(200);

    if (error) {
      console.error('❌ Profiles fetch error:', error);
      return [];
    }

    // ดึง list ของคนที่เคย swipe แล้ว
    const { data: swipedUsers, error: swipeError } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', user.id);

    if (swipeError) {
      console.error('❌ Swipes fetch error:', swipeError);
      // ถ้า error ให้ทำต่อไปได้ แต่ไม่ filter
    }

    const swipedUserIds = new Set(swipedUsers?.map(s => s.swiped_id) || []);
    console.log(`🚫 Already swiped users: ${swipedUserIds.size}`);

    // กรองคนที่เคย swipe แล้วออก
    const unswipedProfiles = data?.filter(profile => !swipedUserIds.has(profile.id)) || [];
    
    console.log(`📊 Profiles before filtering: ${data?.length || 0}`);
    console.log(`📊 Profiles after removing swiped: ${unswipedProfiles.length}`);

    // กรองข้อมูลอื่นๆ ใน JavaScript
    let filteredProfiles = unswipedProfiles.filter(profile => {
      const hasName = profile.name && profile.name.trim() !== '';
      const hasPhotos = (profile.photos && Array.isArray(profile.photos) && profile.photos.length > 0) ||
                       (profile.photo_url && profile.photo_url.trim() !== '') ||
                       true;
      
      // Filter by gender ถ้ามี
      let genderMatch = true;
      if (filters?.genders && filters.genders.length > 0 && !filters.genders.includes('default')) {
        const profileGender = profile.gender?.toLowerCase() || '';
        genderMatch = filters.genders.some(g => g.toLowerCase() === profileGender);
      }
      
      return hasName && hasPhotos && genderMatch;
    }).slice(0, 20);

    console.log(`✅ Found ${filteredProfiles.length} new matching profiles`);
    return filteredProfiles;
  } catch (error) {
    console.error('💥 Error getting matching profiles:', error);
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