import { FaFacebook } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { FaTwitter } from "react-icons/fa";

function Footer() {
    return (
        <footer className="w-full bg-[#F6F7FC] mx-0 shadow-md">
            <div className="flex flex-col mx-auto px-6 py-4 items-center justify-center">
                <div className="w-auto h-auto flex flex-row">
                    <h1 className="text-4xl">Merry</h1>{" "}
                    <h1 className="text-4xl text-[#C70039] font-bold">Match</h1>
                </div>

                <div className="w-full  h-15 border-[#E4E6ED] border-b-[1px] flex text-center items-start justify-center mt-3">
                    <span>New generation of online dating website for everyone</span>
                </div>
                    <span className="text-[#9AA1B9] mt-3">
                        copyright ©2022 merrymatch.com All rights reserved
                    </span>

                <div className="flex flex-row w-[176px] space-x-4 mt-3">
                    <div className="w-[48px] h-[48px] rounded-full bg-[#A62D82] flex justify-center items-center">
                        <FaFacebook className="w-[20px] h-[20px]" color="white"/>
                    </div>
                    <div className="w-[48px] h-[48px] rounded-full bg-[#A62D82] flex justify-center items-center">
                        <RiInstagramFill className="w-[20px] h-[20px]" color="white"/>
                    </div>
                    <div className="w-[48px] h-[48px] rounded-full bg-[#A62D82] flex justify-center items-center">
                        <FaTwitter className="w-[20px] h-[20px]" color="white"/>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;