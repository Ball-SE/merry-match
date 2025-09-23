import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import NavBarUsers from "./NavBarUsers";
import NavBarNonUser from "./NavBarNonUser";

function NavBar() {
    // สร้าง state เพื่อเก็บสถานะการ login (null = กำลังโหลด, true = login แล้ว, false = ยังไม่ได้ login)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        // ตัวแปรเพื่อป้องกัน memory leak เมื่อ component ถูก unmount
        let mounted = true;

        // ฟังก์ชันสำหรับตรวจสอบ session เริ่มต้น
        const init = async () => {
            // เรียก API เพื่อดึง session ปัจจุบันจาก Supabase
            const { data } = await supabase.auth.getSession();
            // อัพเดท state เฉพาะเมื่อ component ยังคง mount อยู่
            if (mounted) setIsLoggedIn(!!data?.session);
        };
        // เรียกใช้ฟังก์ชัน init ทันทีเมื่อ component mount
        init();

        // ตั้งค่า listener เพื่อฟังการเปลี่ยนแปลงสถานะ authentication
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            // อัพเดท state เมื่อมีการ login/logout
            if (mounted) setIsLoggedIn(!!session);
        });

        // cleanup function ที่จะทำงานเมื่อ component ถูก unmount
        return () => {
            mounted = false; // ป้องกันการอัพเดท state หลังจาก component ถูก unmount
            authListener?.subscription.unsubscribe(); // ยกเลิกการฟัง auth state changes
        };
    }, []); // dependency array ว่าง = ทำงานแค่ครั้งเดียวเมื่อ component mount

    // ถ้ายังไม่ทราบสถานะการ login (กำลังโหลด) ให้แสดง navbar สำหรับผู้ใช้ที่ยังไม่ได้ login
    if (isLoggedIn === null) return <NavBarNonUser />;

    // ถ้า login แล้วแสดง NavBarUsers, ถ้ายังไม่ได้ login แสดง NavBarNonUser
    return isLoggedIn ? <NavBarUsers /> : <NavBarNonUser />;
}

export default NavBar;