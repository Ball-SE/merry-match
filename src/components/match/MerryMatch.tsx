import Image from "next/image";
import { useRouter } from "next/navigation";

function MerryMatch() {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center left-0 right-0 sm:pt-50 pb-130">
            <Image src="/assets/merrymatch.png" alt="Merry Match" width={278} height={132} />
            <button 
            className="bg-[#FFE1EA] text-[#95002B] mt-20 text-sm px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#ffd2de] transition-colors"
            onClick={() => router.push('/chat')}
            >
                Start Conversation
            </button>
        </div>
    )
}

export default MerryMatch;