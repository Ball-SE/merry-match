import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/supabaseClient";

type Data = {
  success: boolean;
  message: string;
  data?: object | null;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // อนุญาตเฉพาะ GET และ PUT method
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use GET or PUT method."
    });
  }

  try {
    // ตรวจสอบ authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first."
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first."
      });
    }

    if (req.method === 'GET') {
      // ดึงข้อมูล profile จาก database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
          error: profileError.message
        });
      }

      // แปลงข้อมูลให้ตรงกับ frontend format
      const formattedProfile = {
        ...profile,
        // แปลง location object เป็น string fields
        location: profile.location?.location || profile.location || '',
        city: profile.location?.city || profile.city || '',
        // แปลง interests array ถ้าเป็น null
        interests: profile.interests || [],
        // แปลง photos array ถ้าเป็น null
        photos: profile.photos || []
      };

      // ส่งข้อมูลกลับ
      res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        data: formattedProfile
      });
    } else if (req.method === 'PUT') {
      // อัปเดตข้อมูล profile
      const formData = req.body;
      
      // Debug: ดูข้อมูลที่จะอัปเดต
      console.log('📝 Updating profile with formData:', formData);

      // แปลงข้อมูลให้ตรงกับ database schema
      const updateData = {
        name: formData.name,
        username: formData.username,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        sexual_preferences: formData.sexual_preferences,
        racial_preferences: formData.racial_preferences,
        meeting_interests: formData.meeting_interests,
        bio: formData.bio,
        interests: formData.interests,
        photos: formData.photos,
        // แปลง location และ city เป็น JSON object
        location: {
          location: formData.location,
          city: formData.city
        },
        // คำนวณอายุใหม่
        age: formData.date_of_birth 
          ? new Date().getFullYear() - new Date(formData.date_of_birth).getFullYear()
          : null,
        // อัปเดต photo_url ถ้ามีรูปใหม่
        photo_url: formData.photos && formData.photos.length > 0 
          ? formData.photos[0] 
          : null
      };

      console.log('📝 Processed updateData:', updateData);

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Update profile error:', updateError);
        return res.status(400).json({
          success: false,
          message: "Failed to update profile",
          error: updateError.message
        });
      }

      // แปลงข้อมูลที่อัปเดตแล้วให้ตรงกับ frontend format
      const formattedUpdatedProfile = {
        ...updatedProfile,
        // แปลง location object เป็น string fields
        location: updatedProfile.location?.location || updatedProfile.location || '',
        city: updatedProfile.location?.city || updatedProfile.city || '',
        // แปลง interests array ถ้าเป็น null
        interests: updatedProfile.interests || [],
        // แปลง photos array ถ้าเป็น null
        photos: updatedProfile.photos || []
      };

      // ส่งข้อมูลที่อัปเดตแล้วกลับ
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: formattedUpdatedProfile
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}