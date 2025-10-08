import { RiUserFill } from "react-icons/ri";
import { RiHeartFill } from "react-icons/ri";
import { RiBox3Fill } from "react-icons/ri";
import { FaExclamationTriangle } from "react-icons/fa";
import { RiLogoutBoxRLine } from "react-icons/ri";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import Img from "next/image";

function UserProfileNavbar() {
    const { logout } = useAuth();
    const { packageName, loading } = useUserSubscription();
    
    // เช็คว่าเป็น free package หรือไม่
    const isFreePackage = packageName?.toLowerCase() === 'free';
    
    return (
        <div className="flex flex-col w-full sm:w-[198px] sm:h-auto bg-white sm:border-[1px] sm:border-[#E4E6ED] sm:rounded-2xl sm:shadow-md p-3 transition-all ease-in-out duaration-400 hover:scale-102">
            {/* แสดงปุ่มเชิญชวนเฉพาะเมื่อ user มี package เป็น free */}
            {!loading && isFreePackage && (
                <div className="mb-3">
                    <Link href="/package" className="w-full bg-gradient-to-r from-[#742138] to-[#A878BF] rounded-full px-3 py-2 flex items-center justify-center gap-2 text-[#FFFFFF] text-sm font-medium hover:opacity-90 transition-opacity">
                        <Img src="/assets/star.png" alt="star" className="w-[18px] h-[18px] select-none" width={18} height={18} />
                        <span>More limit Merry!</span>
                    </Link>
                </div>
            )}

            <div className="text-sm font-medium space-y-1 select-none">
                <Link href="/profile/edit" className="w-full flex text-[#646D89] flex-row items-center gap-2 px-3 py-2 rounded-lg hover:text-pink-400 hover:bg-black/9 transition-colors duration-250">
                    <RiUserFill className="text-pink-400" />
                    <span>Profile</span>
                </Link>
                <Link href="/merry-list" className="w-full text-[#646D89] flex flex-row items-center gap-2 px-3 py-2 rounded-lg hover:text-pink-400 hover:bg-black/9 transition-colors duration-250">
                    <RiHeartFill className="text-pink-400" />
                    <span>Merry list</span>
                </Link>
                
                {/* แสดง Merry Membership เฉพาะเมื่อ user มี package ที่ไม่ใช่ free */}
                {!loading && !isFreePackage && (
                    <Link href="/member" className="w-full text-[#646D89] flex flex-row items-center gap-2 px-3 py-2 rounded-lg hover:text-pink-400 hover:bg-black/9 transition-colors duration-250">
                        <RiBox3Fill className="text-pink-400" />
                        <span>Merry Membership</span>
                    </Link>
                )}
                
                <Link href="/complaint" className="w-full text-[#646D89] flex flex-row items-center gap-2 px-3 py-2 rounded-lg hover:text-pink-400 hover:bg-black/9 transition-colors duration-250">
                    <FaExclamationTriangle className="text-pink-400" />
                    <span>Complaint</span>
                </Link>
            </div>

            <div className="mt-auto pt-3 border-t border-[#E4E6ED]">
                <button onClick={() => logout('/')} className="w-full text-[#646D89] flex flex-row items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/9 transition-colors cursor-pointer select-none hover:text-red-600 transition-colors duration-250">
                    <RiLogoutBoxRLine />
                    <span>Log out</span>
                </button>
            </div>
        </div>
    )
}

export default UserProfileNavbar;