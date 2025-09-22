import { Link as ScrollLink } from "react-scroll";
import Link from "next/link";
import { useRef, useState } from "react";
import UserProfileNavbar from "./UserProfileNavbar";
import { slide as Menu } from "react-burger-menu";
import { AlertNotification } from "./AlertNotification";
import MessageNavbar from "./MessageNavbar";

function NavBarUsers() {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenUserProfile, setIsOpenUserProfile] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleOpenUserProfile = () => {
        setIsOpenUserProfile(!isOpenUserProfile);
    }

    return (
        <nav className="w-full navbar-shadow bg-white shadow-2xl sticky top-0  z-[1300]">
            <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-row justify-between items-center">
                <Link href="/" className="w-auto flex flex-row">
                    <h1 className="sm:text-4xl text-xl">Merry</h1>
                    <h1 className="sm:text-4xl text-xl text-[#C70039] font-bold">Match</h1>
                </Link>

                {/* Desktop menu */}
                <div className="hidden md:flex flex-row gap-2">
                    <Link href="/matching" 
                        className="button-ghost cursor-pointer"
                    >
                        Start Matching!
                    </Link>
                    <Link href="/package"  
                        className="button-ghost cursor-pointer"
                    >
                        Merry Membership
                    </Link>
                    <div className="relative ">
                        <AlertNotification />
                    </div>
                    
                    <div className="relative" ref={userMenuRef}>
                        {isOpenUserProfile && (
                        <div className="absolute right-0 sm:mt-15 mt-2 z-50">
                        <UserProfileNavbar />
                        </div>
                        )}
                        <button onClick={handleOpenUserProfile}>
                            <img src="/assets/user.jpg" alt="user" className="mt-1 w-[50px] h-[40px]" />
                        </button>
                    </div>
                </div>
                
                {/* Mobile hamburger menu */}
                <div className="sm:hidden flex flex-row gap-4 mr-5">
                    <MessageNavbar />
                    <AlertNotification />
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