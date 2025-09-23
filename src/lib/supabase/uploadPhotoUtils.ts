import { supabase } from '@/lib/supabase/supabaseClient';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadProfilePhoto = async (
  file: File, 
  userId: string, 
  photoIndex: number
): Promise<UploadResult> => {
  try {
    // สร้างชื่อไฟล์ที่ unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/photo_${photoIndex}_${Date.now()}.${fileExt}`;

    // Upload ไฟล์ไปยัง Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // ได้ URL ของรูปที่ upload แล้ว
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };

  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteProfilePhoto = async (photoUrl: string): Promise<boolean> => {
  try {
    // Extract file path จาก URL
    const path = photoUrl.split('/profile-photos/')[1];
    if (!path) return false;

    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([path]);

    return !error;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};