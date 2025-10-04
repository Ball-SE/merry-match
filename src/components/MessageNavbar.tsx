import { LuMessageCircleMore } from "react-icons/lu";
import Link from "next/link";

function MessageNavbar() {
    return (
        <Link href="/chat">
            <div className="w-[28px] h-[28px] sm:w-[48px] sm:h-[48px] rounded-full bg-[#F6F7FC] flex justify-center items-center cursor-pointer hover:bg-[#FFB1C8] hover:bg-opacity-20 transition-colors">
                <LuMessageCircleMore className="w-[20px] h-[21px]" color="#FFB1C8"/>
            </div>
        </Link>
    )
}

export default MessageNavbar;