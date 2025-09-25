import Image from "next/image";
import { useState, useRef } from "react";
import { FaHeart, FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import UserProfilePopup from "./UserProfilePopup";
import SwipeDeck, { Card } from "@/components/swipe/SwipeDeck";

const demoItems: Card[] = [
  { id: "1", title: "Daeny", age: "24", img: ["/assets/daeny.png", "/assets/daeny2.png", "/assets/daeny3.png"] },
  { id: "2", title: "Knal", age: "25", img: ["/assets/knal.png", "/assets/knal2.png"]},
  { id: "3", title: "Ygritte", age: "23", img: ["/assets/ygritte.png", "/assets/ygritte2.png"] },
];

function MatchingCenter() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(false);
  const [currentCard, setCurrentCard] = useState<Card | null>(demoItems[0] || null);
  const swipeDeckRef = useRef<any>(null);

  const handleLike = (card?: Card) => {
    if (card) {
      alert(`You liked ${card.title} ${card.age}! ❤️`);
    } else {
      alert("You liked this profile! ❤️");
    }
  };

  const handlePass = (card?: Card) => {
    if (card) {
      alert(`You passed ${card.title} ${card.age}! ✕`);
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

  return (
    <div className="flex-1 h-full min-h-0 w-full bg-[#160404] rounded-lg flex items-center justify-center relative overflow-hidden">

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      {/* Main Content */}
      <div className="lg:w-[50%] w-full relative z-20">
        <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl">

          <SwipeDeck 
            items={demoItems} 
            onLike={handleLike}
            onPass={handlePass}
            currentImageIndex={currentImageIndex}
            onCurrentCardChange={handleCurrentCardChange}
          />
          
          {/* Gradient Overlay at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#390741] via-[#07094100] to-transparent rounded-b-2xl"></div>
        </div>

        {/* Controls */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-30">
          <div className="flex flex-row w-[350px] justify-between">
            <div className="flex flex-row gap-2 items-center">
              <h3 className="text-white font-bold text-3xl drop-shadow-2xl">{currentCard?.title || ''}</h3>
              <h3 className="text-white font-bold text-3xl drop-shadow-2xl">{currentCard?.age || ''}</h3>

              <button
                onClick={handleProfile}
                className=" rounded-full w-[22px] h-[22px]  backdrop-blur-xl grid place-items-center shadow-xl bg-white/30"
                aria-label="Open profile"
              >
                <FaEye className="w-[12px] h-[12px] text-white" />
              </button>
            </div>

            <div className="flex">
              <button
                onClick={handlePreviousImage}
                className="w-10 h-10 grid place-items-center"
              >
                <FaArrowLeft className="text-white drop-shadow-2xl" />
              </button>
              <button
                onClick={handleNextImage}
                className="w-10 h-10 grid place-items-center"
              >
                <FaArrowRight className="text-white drop-shadow-2xl" />
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <button
              onClick={() => handlePass()}
              className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl grid place-items-center shadow-xl hover:shadow-2xl transition hover:scale-105"
            >
              <IoClose className="text-gray-400 w-9 h-9" />
            </button>
            <button
              onClick={() => handleLike()}
              className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl grid place-items-center shadow-xl hover:shadow-2xl transition hover:scale-105"
            >
              <FaHeart className="text-red-500 w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Popup */}
      <UserProfilePopup 
        isOpen={openProfile} 
        onClose={closeProfile}
        userId="8943808f-9f64-4fda-b659-d22b4649088e"
        cardData={currentCard || undefined}
      />
    </div>
  );
}

export default MatchingCenter;