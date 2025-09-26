import Image from "next/image";

function MerryMatch() {
    return (
        <div className="flex flex-col items-center justify-center left-0 right-0 pt-50">
            <Image src="/assets/merrymatch.png" alt="Merry Match" width={278} height={132} />
            <button className="bg-[#FFE1EA] text-[#95002B] mt-20 text-sm px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#ffd2de] transition-colors">Start Conversation</button>
        </div>
    )
}

export default MerryMatch;