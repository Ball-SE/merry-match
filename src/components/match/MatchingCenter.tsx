import Image from "next/image";
import { useState } from "react";

function MatchingCenter() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleLike = () => {
        alert('You liked this profile! ❤️');
        // TODO: เพิ่มฟังก์ชัน Like จริง
      };
      
      const handlePass = () => {
        alert('You passed this profile! ✕');
        // TODO: เพิ่มฟังก์ชัน Pass จริง
      };
    return (
        <div className="flex-1 h-full min-h-0 w-full bg-[#160404] rounded-lg flex items-center justify-center ">
            {/* Left Side - Profile Image */}
            <div className="lg:w-[50%] w-full h-[478px] lg:h-[526px] relative">
                {/* Profile Image Container */}
                <div className="w-full relative rounded-2xl overflow-hidden">
                <Image 
                    src="/assets/daeny.png"
                    alt="Profile" 
                    className="object-cover"
                    width={500}
                    height={500}
                />
                </div>
                
                {/* Controls */}
                <div className="absolute bottom-30 left-47 transform -translate-x-1/2 flex items-center gap-4">
                    {/* Action Buttons */}
                    <button 
                        onClick={handlePass}
                        className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                    >
                        <span className="text-[#9AA1B9] text-2xl font-bold">✕</span>
                    </button>
                    <button 
                        onClick={handleLike}
                        className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                    >
                        <span className="text-[#C70039] text-2xl">❤️</span>
                    </button>
                </div>
                {/* Navigation Arrows */}
                <div className="flex flex-row">
                    <button 
                        onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : 2 - 1)}
                        className="w-10 h-10 flex items-center justify-center transition-all"
                    >
                        <span className="text-[#9AA1B9] text-lg">←</span>
                    </button>
                    <button 
                        onClick={() => setCurrentImageIndex(prev => prev < 2 - 1 ? prev + 1 : 0)}
                        className="w-10 h-10 flex items-center justify-center transition-all"
                    >
                        <span className="text-[#9AA1B9] text-lg">→</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
export default MatchingCenter;