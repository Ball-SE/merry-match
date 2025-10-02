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
  // อนุญาตเฉพาะ PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use PUT method."
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

    // รับข้อมูลจาก request body
    const {
      name,
      date_of_birth,
      location,
      city,
      username,
      gender,
      sexual_preferences,
      racial_preferences,
      meeting_interests,
      bio,
      interests
    } = req.body;

    console.log('📥 Received update data:', {
      name,
      date_of_birth,
      location,
      city,
      username,
      gender,
      sexual_preferences,
      racial_preferences,
      meeting_interests,
      bio,
      interests
    });

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long."
      });
    }

    if (!username || username.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 6 characters long."
      });
    }

    // คำนวณอายุจาก date_of_birth
    let age = null;
    if (date_of_birth) {
      const birthDate = new Date(date_of_birth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // เตรียมข้อมูลสำหรับอัปเดต
    const updateData: any = {
      name: name.trim(),
      username: username.trim(),
      updated_at: new Date().toISOString()
    };

    // เพิ่มข้อมูลที่ส่งมา (ถ้ามี)
    if (date_of_birth) updateData.date_of_birth = date_of_birth;
    if (age !== null) updateData.age = age;
    
    // อัปเดต location เป็น JSON object เหมือนใน register
    if (location || city) {
      updateData.location = {
        location: location || '',
        city: city || ''
      };
      console.log('🏠 Setting location data:', updateData.location);
    }
    
    if (gender) updateData.gender = gender;
    if (sexual_preferences) updateData.sexual_preferences = sexual_preferences;
    if (racial_preferences) updateData.racial_preferences = racial_preferences;
    if (meeting_interests) updateData.meeting_interests = meeting_interests;
    if (bio) updateData.bio = bio;
    if (interests && Array.isArray(interests)) updateData.interests = interests;

    // อัปเดตข้อมูลใน database
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error updating profile:', updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: updateError.message
      });
    }

    console.log('📤 Sending updated profile:', updatedProfile);
    console.log('🏠 Updated location data:', updatedProfile?.location);
    console.log('🏠 Updated city data:', updatedProfile?.city);

    // ส่งข้อมูลกลับ
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
