import { supabase } from '@/lib/supabase/supabaseClient';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadProfilePhoto = async (
  file: File, 
  folderPath: string,   // เปลี่ยนจาก userId -> folderPath
  photoIndex: number
): Promise<UploadResult> => {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${folderPath}/photo_${photoIndex}_${Date.now()}.${fileExt}`;

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