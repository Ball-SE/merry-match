import { useState } from "react";
import { FaHeart, FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ProfileModal from "./ProfileModal";
import SwipeDeck, { Card } from "@/components/swipe/SwipeDeck";
import { useMatchingProfiles } from "@/hooks/useMatchingProfiles";

function MatchingCenter() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(false);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);

  // ใช้ custom hook เพื่อดึงข้อมูล matching profiles
  const {cards, loading, error, removeCard} = useMatchingProfiles();

  // ฟังก์ชันสำหรับรับ preview cards (การ์ดซ้ายและขวา)
  const getPreviewCards = () => {
    if (cards.length < 2) return { left: null, right: null };
    
    const currentIndex = 0; // การ์ดหลักคือตัวแรกเสมอ
    const leftCard = cards.length > 1 ? cards[1] : null;
    const rightCard = cards.length > 2 ? cards[2] : null;
    
    return { left: leftCard, right: rightCard };
  };

  const { left: leftCard, right: rightCard } = getPreviewCards();

  const handleLike = (card?: Card) => {
    if (card) {
      alert(`You liked ${card.title} ${card.age}! ❤️`);
      removeCard(card.id); // ลบ card ที่ swiped แล้ว
      setCurrentImageIndex(0); // ตั้งค่า card ปัจจุบันเป็น card ตัวแรก
    } else {
      alert("You liked this profile! ❤️");
    }
  };

  const handlePass = (card?: Card) => {
    if (card) {
      alert(`You passed ${card.title} ${card.age}! ✕`);
      removeCard(card.id); // ลบ card ที่ swiped แล้ว
      setCurrentImageIndex(0); // ตั้งค่า card ปัจจุบันเป็น card ตัวแรก
    } else {
      alert("You passed this profile! ✕");
    }
  };

  const handleProfile = () => setOpenProfile(true);
  const closeProfile = () => setOpenProfile(false);

  // ฟังก์ชันสำหรับรับข้อมูลการ์ดปัจจุบันจาก SwipeDeck
  const handleCurrentCardChange = (card: Card | null) => {
    setCurrentCard(card);
  };

  // ฟังก์ชันสำหรับเลื่อนรูปภาพ
  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => {
      // หาจำนวนรูปภาพของโปรไฟล์ปัจจุบัน
      const maxIndex = (currentCard?.img?.length || 1) - 1;
      return prevIndex > 0 ? prevIndex - 1 : maxIndex;
    });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      // หาจำนวนรูปภาพของโปรไฟล์ปัจจุบัน
      const maxIndex = (currentCard?.img?.length || 1) - 1;
      return prevIndex < maxIndex ? prevIndex + 1 : 0;
    });
  };

   // แสดง loading state
   if (loading) {
    return (
      <div className="flex-1 h-full min-h-0 w-full bg-[#160404] rounded-lg flex items-center justify-center">
        <div className="text-white text-xl">Loading matching profiles...</div>
      </div>
    )
  }

  // แสดง error state
  if (error) {
    return (
      <div className="flex-1 h-full min-h-0 w-full bg-[#160404] rounded-lg flex items-center justify-center">
        <div className="text-white text-xl">Error loading matching profiles: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full min-h-0 w-full bg-[#160404] rounded-lg flex items-center justify-center relative overflow-hidden">
      
      {/* Preview Cards Container */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative w-full max-w-6xl px-4 flex items-center justify-center">
          
          {/* Left Preview Card */}
          {leftCard && (
            <div className="absolute -left-16 lg:-left-30 -translate-y-1/2 w-32 h-44 lg:w-40 lg:h-56 ">
              <div className="w-full h-[450px] rounded-xl overflow-hidden shadow-2xl bg-gray-800">
                <img 
                  src={leftCard.img[0]} 
                  alt={`${leftCard.title} ${leftCard.age}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-60 inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
            </div>
          )}
          
          {/* Right Preview Card */}
          {rightCard && (
            <div className="absolute -right-16 lg:-right-30 -translate-y-1/2 w-32 h-44 lg:w-40 lg:h-56 ">
              <div className="w-full h-[450px] rounded-xl overflow-hidden shadow-2xl bg-gray-800">
                <img 
                  src={rightCard.img[0]} 
                  alt={`${rightCard.title} ${rightCard.age}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-60 inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl px-4 relative z-20">
        <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl">

          <SwipeDeck 
            items={cards} 
            onLike={handleLike}
            onPass={handlePass}
            currentImageIndex={currentImageIndex}
            onCurrentCardChange={handleCurrentCardChange}
          />
          
          {/* Gradient Overlay at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-[#390741] via-[#07094100] to-transparent rounded-b-2xl"></div>
        </div>

        {/* Controls */}
        <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 sm:gap-4 z-30">
          <div className="flex flex-row w-[550px] max-w-[650px] px-4 justify-between">
            <div className="flex flex-row gap-2 items-center">
              <h3 className="text-white font-bold text-2xl sm:text-3xl drop-shadow-2xl">{currentCard?.title || ''}</h3>
              <h3 className="text-white font-bold text-2xl sm:text-3xl drop-shadow-2xl">{currentCard?.age || ''}</h3>

              <button
                onClick={handleProfile}
                className="rounded-full w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] backdrop-blur-xl grid place-items-center shadow-xl bg-white/30"
                aria-label="Open profile"
              >
                <FaEye className="w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] text-white" />
              </button>
            </div>

            <div className="flex">
              <button
                onClick={handlePreviousImage}
                className="w-8 h-8 sm:w-10 sm:h-10 grid place-items-center"
              >
                <FaArrowLeft className="text-white drop-shadow-2xl text-sm sm:text-base" />
              </button>
              <button
                onClick={handleNextImage}
                className="w-8 h-8 sm:w-10 sm:h-10 grid place-items-center"
              >
                <FaArrowRight className="text-white drop-shadow-2xl text-sm sm:text-base" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-6">
            <button
              onClick={() => handlePass()}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl grid place-items-center shadow-xl hover:shadow-2xl transition hover:scale-105"
            >
              <IoClose className="text-gray-400 w-7 h-7 sm:w-9 sm:h-9" />
            </button>
            <button
              onClick={() => handleLike()}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl grid place-items-center shadow-xl hover:shadow-2xl transition hover:scale-105"
            >
              <FaHeart className="text-red-500 w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <p className="text-[#646D89] text-center text-sm">
          Merry limit Today
          <span className="text-[#FF1659] ml-2">20/20</span>
        </p>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
      isOpen={openProfile} 
      onClose={closeProfile} 
      currentCard={currentCard} 
      onLike={handleLike} 
      onPass={handlePass} 
      />
    </div>
  );
}

export default MatchingCenter;