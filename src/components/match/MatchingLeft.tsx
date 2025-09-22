import Image from "next/image";

function MatchingLeft() {
    return (
        <div className="w-full h-full flex flex-col">
            <button className="w-full h-full flex flex-col items-center justify-center mb-7 border-1 border-[#A62D82] rounded-lg p-4">
                <Image src="/assets/hearchsearch.png" alt="discover" width={50} height={50} />
                <h4 className="text-2xl font-bold text-[#95002B]">Discover New Match</h4>
                <p className="text-sm text-[#646D89]">Start find and Merry to get know and connect with new friend!</p>
            </button>
            <div className="border-t-[1px] border-[#E4E6ED] mb-5"></div>
            <div className="w-full h-full">
                <h4 className="text-2xl font-bold text-[#2A2E3F]">Merry Match!</h4>
                <div className="flex flex-row gap-2 mt-2">
                    <Image 
                        src="/assets/daeny.png" 
                        alt="daeny" 
                        width={100} 
                        height={100} 
                        className="rounded-xl"
                    />
                    <Image 
                        src="/assets/knal.png" 
                        alt="knal" 
                        width={100} 
                        height={100} 
                        className="rounded-xl"
                    />
                </div>
            </div>
            <div>
                <h4 className="text-2xl mt-10 font-bold text-[#2A2E3F]">Chat with Merry Match</h4>
                <div className="flex flex-row gap-2 m-3 items-center">
                    <Image 
                        src="/assets/daeny.png" 
                        alt="daeny" 
                        width={50} 
                        height={50} 
                        className="rounded-full"
                    />
                    <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-[#2A2E3F]">Daeny</h4>
                        <p className="text-sm text-[#646D89]">Hello, how are you?</p>
                    </div>
                </div>
                <div className="flex flex-row gap-2 m-3 items-center">
                    <Image 
                        src="/assets/knal.png" 
                        alt="knal" 
                        width={50} 
                        height={50} 
                        className="rounded-full"
                    />
                    <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-[#2A2E3F]">Knal</h4>
                        <p className="text-sm text-[#646D89]">หิวข้าววววว</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default MatchingLeft;