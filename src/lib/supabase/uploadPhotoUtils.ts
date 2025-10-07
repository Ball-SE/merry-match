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

    const { error } = await supabase.storage
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
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export const deleteProfilePhoto = async (photoUrl: string): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting photo:', photoUrl); // DEBUG
    
    // Extract path from URL: .../profile-photos/FOLDER/FILE
    // URL format: https://...supabase.co/storage/v1/object/public/profile-photos/gdd_hotmail_com/photo_0_1759860665465.jpg
    const urlParts = photoUrl.split('/profile-photos/');
    if (urlParts.length < 2) {
      console.error('❌ Invalid URL format:', photoUrl);
      return false;
    }
    
    // Get path after /profile-photos/ (e.g., "gdd_hotmail_com/photo_0_1759860665465.jpg")
    const path = urlParts[1];
    console.log('📁 Extracted path:', path); // DEBUG

    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([path]);

    if (error) {
      console.error('❌ Delete error:', error);
      return false;
    }
    
    console.log('✅ Successfully deleted:', path); // DEBUG
    return true;
  } catch (error) {
    console.error('❌ Delete error:', error);
    return false;
  }
};

// ==================== CHAT PHOTO FUNCTIONS ====================

export const uploadChatPhoto = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: 'File size too large. Maximum size is 5MB.' 
      };
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('chat-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-photos')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export const deleteChatPhoto = async (photoUrl: string): Promise<boolean> => {
  try {
    // Extract file path จาก URL
    const path = photoUrl.split('/chat-photos/')[1];
    if (!path) return false;

    const { error } = await supabase.storage
      .from('chat-photos')
      .remove([path]);

    return !error;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};