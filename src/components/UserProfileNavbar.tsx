import { RiUserFill } from "react-icons/ri";
import { RiHeartFill } from "react-icons/ri";
import { RiBox3Fill } from "react-icons/ri";
import { FaExclamationTriangle } from "react-icons/fa";
import { RiLogoutBoxRLine } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase/supabaseClient";

function UserProfileNavbar() {
    const router = useRouter();
    
    const handleLogout = async () => {
        await supabase.auth.signOut(); // ลบ session ออกจาก cookie/localstorage
        router.push("/"); // redirect ไปหน้าแรก  
    }
    
    return (
        <div className="flex flex-col sm:w-[198px] sm:h-[308px] bg-white sm:border-[1px] sm:border-[#E4E6ED] sm:rounded-2xl sm:shadow-md p-3">
            <div className="flex justify-center">
                <div className="bg-gradient-to-r from-[#742138] w-[343px] to-[#A878BF] rounded-full px-3 py-2 flex items-center justify-center gap-2 text-[#FFFFFF] text-sm font-medium">
                    <img src="/assets/star.png" alt="star" className="w-[20px] h-[20px]" />
                    <span>More limit Merry!</span>
                </div>
            </div>

            <div className="mt-4 text-sm font-medium space-y-1.5">
                <Link href="/profile" className="w-full flex text-[#646D89] flex-row items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50">
                    <RiUserFill className="text-pink-400" />
                    <span>Profile</span>
                </Link>
                <Link href="/merry-list" className="w-full text-[#646D89] flex flex-row items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50">
                    <RiHeartFill className="text-pink-400" />
                    <span>Merry list</span>
                </Link>
                <Link href="/package" className="w-full text-[#646D89] flex flex-row items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50">
                    <RiBox3Fill className="text-pink-400" />
                    <span>Merry Membership</span>
                </Link>
                <Link href="/compliant" className="w-full text-[#646D89] flex flex-row items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50">
                    <FaExclamationTriangle className="text-pink-400" />
                    <span>Compliant</span>
                </Link>
            </div>

            <div className="mt-auto pt-2 border-t border-[#E4E6ED]">
                <button onClick={handleLogout} className="w-full text-[#646D89] flex flex-row items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50">
                    <RiLogoutBoxRLine />
                    <span>Log out</span>
                </button>
            </div>
        </div>
    )
}

export default UserProfileNavbar;