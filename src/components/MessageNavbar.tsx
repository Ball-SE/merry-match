import { LuMessageCircleMore } from "react-icons/lu";

function MessageNavbar() {
    return (
        <div className="w-[28px] h-[28px] sm:w-[48px] sm:h-[48px] rounded-full bg-[#F6F7FC] flex justify-center items-center">
            <LuMessageCircleMore className="w-[20px] h-[21px]" color="#FFB1C8"/>
        </div>
    )
}

export default MessageNavbar;