import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ProfileModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ["/assets/daeny.png", "/assets/ygritte.png"];

  const handleLike = () => {
    alert('You liked this profile! ❤️');
    // TODO: เพิ่มฟังก์ชัน Like จริง
  };
  
  const handlePass = () => {
    alert('You passed this profile! ✕');
    // TODO: เพิ่มฟังก์ชัน Pass จริง
  };

  return (
    <div className="fixed inset-0 z-[2000]">
      {/* Backdrop คลิกเพื่อปิด */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* กล่องโปรไฟล์ */}
      <div className="relative mx-auto mt-10 max-w-4xl w-[92%] bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white shadow grid place-items-center text-[#9AA1B9] hover:text-[#C70039]"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* รูป */}
          <div className="lg:w-1/2 w-full h-[480px] relative">
            <img
              src={images[currentImageIndex]}
              alt="Profile"
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute bottom-4 left-4 text-white">
              {currentImageIndex + 1}/{images.length}
            </div>

            {/* ปุ่มควบคุมรูป */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
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
              
              {/* Navigation Arrows */}
              <button 
                onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                className="w-10 h-10 flex items-center justify-center transition-all"
              >
                <span className="text-[#9AA1B9] text-lg">←</span>
              </button>
              <button 
                onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                className="w-10 h-10 flex items-center justify-center transition-all"
              >
                <span className="text-[#9AA1B9] text-lg">→</span>
              </button>
            </div>
          </div>

          {/* ข้อมูล */}
          <div className="lg:w-1/2 w-full pt-2">
            <h1 className="text-3xl font-bold text-gray-800">Daeny 24</h1>
            <div className="mt-2 flex items-center text-gray-600">
              <span className="text-[#C70039] mr-2">📍</span>Bangkok, Thailand
            </div>

            <div className="mt-6 space-y-2 text-base">
              <div className="flex"><span className="w-40 text-[#9AA1B9]">Sexual identities:</span><span className="ml-4 font-medium">Female</span></div>
              <div className="flex"><span className="w-40 text-[#9AA1B9]">Sexual preferences:</span><span className="ml-4 font-medium">Male</span></div>
              <div className="flex"><span className="w-40 text-[#9AA1B9]">Racial preferences:</span><span className="ml-4 font-medium">Indefinite</span></div>
              <div className="flex"><span className="w-40 text-[#9AA1B9]">Meeting interests:</span><span className="ml-4 font-medium">Long-term commitment</span></div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-1">About me</h3>
              <p className="text-[#9AA1B9] italic">"I know nothing...but you"</p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Hobbies and Interests</h3>
              <div className="flex flex-wrap gap-2">
                {["dragon","romantic relationship","political","black hair","friendly","fire"].map(t => (
                  <span key={t} className="bg-white border border-pink-200 text-[#C70039] px-3 py-1 rounded-full text-sm font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
