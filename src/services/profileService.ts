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
    console.log('🔍 Getting matching profiles with filters:', filters);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return [];
    }

    console.log('👤 Current user ID:', user.id);

    // สร้าง query พื้นฐาน
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
        gender
      `)
      .neq('id', user.id);

    // เพิ่ม age filter
    if (filters?.minAge && filters.minAge > 18) {
      query = query.gte('age', filters.minAge);
    }
    if (filters?.maxAge && filters.maxAge < 80) {
      query = query.lte('age', filters.maxAge);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('❌ Profiles fetch error:', error);
      return [];
    }

    console.log(`📊 Raw profiles from database: ${data?.length || 0}`);
    console.log('📋 Sample profile:', data?.[0]);

    if (!data || data.length === 0) {
      console.log('⚠️ No profiles found in database');
      return [];
    }

    // กรองข้อมูลใน JavaScript - ผ่อนคลายเงื่อนไข
    let filteredProfiles = data.filter(profile => {
      // ต้องมีชื่อ
      const hasName = profile.name && profile.name.trim() !== '';
      console.log(`Profile ${profile.name}: hasName=${hasName}`);
      
      // ตรวจสอบรูปภาพ - ให้ผ่านได้ง่ายขึ้น
      const hasPhotos = (profile.photos && Array.isArray(profile.photos) && profile.photos.length > 0) ||
                       (profile.photo_url && profile.photo_url.trim() !== '') ||
                       true; // อนุญาตให้ผ่านชั่วคราวเพื่อ debug
      console.log(`Profile ${profile.name}: hasPhotos=${hasPhotos}, photos=${profile.photos}, photo_url=${profile.photo_url}`);
      
      // ตรวจสอบอายุ - ให้ผ่านได้ง่ายขึ้น
      const hasAge = profile.age !== null && profile.age !== undefined;
      console.log(`Profile ${profile.name}: hasAge=${hasAge}, age=${profile.age}`);
      
      // Filter by gender ถ้ามี
      let genderMatch = true;
      if (filters?.genders && filters.genders.length > 0) {
        if (filters.genders.includes('default')) {
          genderMatch = true;
        } else {
          const profileGender = profile.gender?.toLowerCase() || '';
          genderMatch = filters.genders.some(g => g.toLowerCase() === profileGender);
          console.log(`Profile ${profile.name}: genderMatch=${genderMatch}, profileGender=${profileGender}, filterGenders=${filters.genders}`);
        }
      }
      
      const passed = hasName && hasPhotos && genderMatch;
      console.log(`Profile ${profile.name}: FINAL RESULT=${passed}`);
      
      return passed;
    }).slice(0, 20);

    console.log(`✅ Found ${filteredProfiles.length} matching profiles after filtering`);
    console.log('📝 Filtered profiles:', filteredProfiles.map(p => ({ name: p.name, age: p.age, gender: p.gender, location: p.location })));
    
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