import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import UserProfileNavbar from "./UserProfileNavbar";
import { slide as Menu } from "react-burger-menu";
import { AlertNotification } from "./AlertNotification";
import { useNotifications } from '@/hooks/useNotifications';
import MessageNavbar from "./MessageNavbar";
import Img from "next/image";
import { useProfile } from "../hooks/useProfile";

function NavBarUsers() {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenUserProfile, setIsOpenUserProfile] = useState(false);
    const { profile } = useProfile();

    const { notifications, unreadCount, loading, error, markAsRead } = useNotifications();

    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleOpenUserProfile = () => {
        setIsOpenUserProfile(!isOpenUserProfile);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setIsOpenUserProfile(false);
            }
        }

        // เมื่อ dropdown เปิด → เริ่มฟัง event
        if (isOpenUserProfile) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        // cleanup เมื่อ component ถูก unmount หรือ dropdown ปิด
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpenUserProfile]);

    return (
        <nav className="w-full navbar-shadow bg-white shadow-2xl sticky top-0  z-[1300]">
            <div className="w-full mx-auto px-4 sm:px-36 py-4 flex flex-row justify-between items-center">
                <Link href="/" className="w-auto flex flex-row">
                    <h1 className="sm:text-4xl text-xl select-none">Merry</h1>
                    <h1 className="sm:text-4xl text-xl text-[#C70039] font-bold select-none">Match</h1>
                </Link>

                {/* Desktop menu */}
                <div className="hidden md:flex flex-row gap-2">
                    <Link href="/matching"
                        className="button-ghost cursor-pointer select-none hover:text-red-500 transition-colors duration-250"
                    >
                        Start Matching!
                    </Link>
                    <Link href="/package"
                        className="button-ghost cursor-pointer select-none hover:text-red-500 transition-colors duration-250"
                    >
                        Merry Membership
                    </Link>
                    <div className="relative">
                        <AlertNotification
                            notifications={notifications}
                            unreadCount={unreadCount}
                            loading={loading}
                            error={error}
                            markAsRead={markAsRead}
                        />
                    </div>

                    <div className="relative" ref={userMenuRef}>
                        {isOpenUserProfile && (
                            <div className="absolute right-0 sm:mt-15 mt-2 z-50 animate-fadeIn">
                                <UserProfileNavbar />
                            </div>
                        )}
                        <button onClick={handleOpenUserProfile}
                            className=""
                        >
                            {profile?.photo_url && (
                                <Img
                                    src={profile.photo_url}
                                    alt="user"
                                    width={50}
                                    height={50}
                                    className="rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover select-none transition-transform duration-500 hover:scale-105 cursor-pointer"
                                />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile hamburger menu */}
                <div className="sm:hidden flex flex-row gap-2 mr-7">
                    <MessageNavbar />
                    <AlertNotification 
                        notifications={notifications}
                        unreadCount={unreadCount}
                        loading={loading}
                        error={error}
                        markAsRead={markAsRead}
                    />
                    <Menu
                        className="custom-burger-menu"
                        menuClassName="custom-bm-menu"
                        right
                        isOpen={isOpen}
                        onStateChange={({ isOpen }: { isOpen: boolean }) => setIsOpen(isOpen)}
                    >
                        <UserProfileNavbar />
                    </Menu>
                </div>
            </div>
        </nav>
    )
}

export default NavBarUsers;