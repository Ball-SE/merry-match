import Link from "next/link";
import { slide as Menu } from "react-burger-menu";
import { useState } from "react";
import {AlertNotification} from "./AlertNotification";
import { Link as ScrollLink } from "react-scroll";

function NavBarNonUser() {
    const [isOpen, setIsOpen] = useState(false);

    return (
            <nav className="w-full navbar-shadow bg-white shadow-2xl sticky top-0 left-0 right-0 z-[1300]">
            <div className="w-full mx-auto px-36 py-4 flex flex-row justify-between items-center">
            <Link href="/" className="w-auto flex flex-row">
                <h1 className="sm:text-4xl text-xl">Merry</h1>
                <h1 className="sm:text-4xl text-xl text-[#C70039] font-bold">Match</h1>
            </Link>


            <div className="hidden md:flex">
            <ScrollLink 
                        to="why-merry-match" 
                        smooth={true}
                        duration={500}  
                        className="button-ghost cursor-pointer"
                    >
                        Why Merry Match?
                    </ScrollLink>
                    <ScrollLink 
                        to="how-to-merry" 
                        smooth={true} 
                        duration={500} 
                        className="button-ghost cursor-pointer"
                    >
                        How to Merry
                    </ScrollLink>
                <Link href="/login" className="button-primary bg-[#C70039] text-white">Login</Link>
            </div>
            {/* Mobile hamburger */}
                <div className="sm:hidden flex flex-row gap-4 mr-5">
                <AlertNotification />
                <Menu className="menu-item" right isOpen={isOpen} onStateChange={({ isOpen }: { isOpen: boolean }) => setIsOpen(isOpen)}>
                    <ScrollLink to="why-merry-match" smooth={true} duration={500} className="button-ghost">Why Merry Match?</ScrollLink>
                    <ScrollLink to="how-to-merry" smooth={true} duration={500} className="button-ghost">How to Merry</ScrollLink>
                    <Link href="/login" className="button-primary text-center bg-[#C70039] text-white">Login</Link>
                </Menu>
                </div>
            </div>
        </nav>
    )
}

export default NavBarNonUser;