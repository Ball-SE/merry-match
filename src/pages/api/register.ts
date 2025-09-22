import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/supabaseClient";
import { validateCompleteRegistration } from "@/middleware/register-validation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // อนุญาตเฉพาะ POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const formData = req.body;

    // ตรวจสอบข้อมูลทั้งหมดก่อนบันทึก
    const validation = validateCompleteRegistration(formData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // 1) สร้างบัญชีผู้ใช้ด้วย Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            name: formData.name,
          },
        },
      }
    );

    if (signUpError) {
      console.error("SignUp Error:", signUpError);
      return res.status(400).json({
        error: signUpError.message || "การสร้างบัญชีผู้ใช้ล้มเหลว",
      });
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      return res.status(500).json({
        error: "ไม่สามารถสร้างบัญชีผู้ใช้ได้",
      });
    }

    // 2) บันทึกข้อมูลโปรไฟล์ลงตาราง profiles
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: userId,
        name: formData.name,
        email: formData.email,
        username: formData.username,
        date_of_birth: formData.dateOfBirth,
        city: formData.city,

        // ใช้ field ที่มีใน database โดยตรง
        gender: formData.sexualIdentities,
        sexual_preferences: formData.sexualPreferences,
        racial_preferences: formData.racialPreferences,
        meeting_interests: formData.meetingInterests,
        sexual_identities: formData.sexualIdentities,

        // สำหรับ array fields
        interests: formData.interests || [],
        photos: formData.photos || [],

        // ข้อมูลเพิ่มเติม
        bio: formData.meetingInterests || "",
        photo_url:
          formData.photos && formData.photos.length > 0
            ? formData.photos[0]
            : null,

        // คำนวณอายุจาก date_of_birth
        age: formData.dateOfBirth
          ? new Date().getFullYear() -
            new Date(formData.dateOfBirth).getFullYear()
          : null,

        // ใช้ jsonb fields สำหรับข้อมูลเพิ่มเติม
        preferences: {
          additional_preferences: formData.interests || [],
        },

        location: {
          location: formData.location,
          city: formData.city,
        },
      },
    ]);

    if (insertError) {
      console.error("Insert Error:", insertError);

      // ถ้าบันทึกโปรไฟล์ไม่ได้ ให้ลบ user ที่สร้างไว้ออก (optional)
      // await supabase.auth.admin.deleteUser(userId);

      return res.status(500).json({
        error: insertError.message || "ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้",
      });
    }

    // ส่งผลลัพธ์สำเร็จกลับ
    return res.status(201).json({
      success: true,
      message: "การสมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
      userId: userId,
    });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      error: error.message || "เกิดข้อผิดพลาดในระบบ",
    });
  }
}
