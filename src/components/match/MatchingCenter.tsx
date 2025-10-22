import { useState, useEffect, useMemo } from "react";
import { FaHeart, FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import UserProfileView from "@/components/profile/UserProfileView";
import SwipeDeck, { Card } from "@/components/swipe/SwipeDeck";
import { useMatchingProfiles } from "@/hooks/useMatchingProfiles";
import { useMatchingContext } from "@/context/MatchingContext";
import { supabase } from "@/lib/supabase/supabaseClient";
import axios from "axios";
import MerryMatch from "./MerryMatch";
import { RiMapPin2Fill } from "react-icons/ri";
import { GiSettingsKnobs } from "react-icons/gi";
import MatchingRight from "./MatchingRight";
import Img from "next/image";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useRouter } from "next/router";

function MatchingCenter() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openProfile, setOpenProfile] = useState(false);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedCardId, setMatchedCardId] = useState<string | null>(null); 
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { subscription, refetch: refetchSubscription } = useUserSubscription(); 
  const router = useRouter();
  // ใช้ context เพื่อดึง filters และ searchTrigger
  const { filters, searchTrigger, refreshMatches } = useMatchingContext();
  
  // ใช้ custom hook
  const { cards, loading, error, removeCard, updateWithFilters } = useMatchingProfiles();

  // แปลง filters เป็น format ที่ service ต้องการ
  const profileFilters = useMemo(() => ({
    genders: filters.selectedGenders,
    minAge: filters.ageRange[0],
    maxAge: filters.ageRange[1]
  }), [filters.selectedGenders, filters.ageRange]);

  // อัพเดทข้อมูลเมื่อ searchTrigger เปลี่ยน (เมื่อกด Search)
  useEffect(() => {
    if (searchTrigger > 0) {
      updateWithFilters(profileFilters);
    }
  }, [searchTrigger, profileFilters, updateWithFilters]);

  // เพิ่ม useEffect สำหรับซ่อน showMatch อัตโนมัติหลังจาก 5 วินาที
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (showMatch) {
      timeoutId = setTimeout(() => {
        setShowMatch(false);
        setMatchedCardId(null);
        // ลบการ์ดที่ match แล้ว
        if (matchedCardId) {
          removeCard(matchedCardId);
          setCurrentImageIndex(0);
        }
      }, 5000); // 5 วินาที
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showMatch, matchedCardId, removeCard]);


  // ฟังก์ชันสำหรับรับ preview cards (การ์ดซ้ายและขวา)
  const getPreviewCards = () => {
    // เพิ่มเงื่อนไขตรวจสอบเมื่อไม่มีการ์ดเลย
    if (cards.length === 0) return { left: null, right: null };
    if (cards.length < 2) return { left: null, right: null };
    
    const leftCard = cards.length > 1 ? cards[1] : null;
    const rightCard = cards.length > 2 ? cards[2] : null;
    
    return { left: leftCard, right: rightCard };
  };

  const { left: leftCard, right: rightCard } = getPreviewCards();

  // เพิ่มฟังก์ชันสำหรับเรียก merry API
  const callMerryAPI = async (swiped_id: string, action: "like" | "pass") => {
    try {
      // 🆕 Check limit ก่อน swipe
      if (subscription && subscription.merry_limit <= 0) {
        setShowLimitModal(true);
        return { success: false, match: false, limitReached: true };
      }

      // ดึง token จาก Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        console.error('No valid session found');
        return { success: false, match: false };
      }

      const response = await axios.post('/api/merry', {
        swiped_id,
        action
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const result = response.data;

      // 🆕 Refresh subscription เพื่อ update merry_limit
      await refetchSubscription();
      
      // return ผลลัพธ์แทนการ set state
      return { success: true, match: result.match || false };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setShowLimitModal(true);
        await refetchSubscription();
        return { success: false, match: false, limitReached: true };
      }
      return { success: false, match: false };
    }
  };

  // ฟังก์ชันปิด match modal
  const handleCloseMatch = () => {
    setShowMatch(false);
    setMatchedCardId(null);
    // ไม่ต้องเรียก removeCard ที่นี่อีกแล้วเพราะลบไปแล้วตอน like
  };

  // ฟังก์ชันเปิด/ปิด filter modal
  const handleOpenFilter = () => setShowFilterModal(true);
  const handleCloseFilter = () => setShowFilterModal(false);

  const handleLike = async (card?: Card) => {
    const targetCard = card || currentCard;
    if (!targetCard) return;
  
    // เรียก API ก่อน โดยยังไม่ลบการ์ด
  const result = await callMerryAPI(targetCard.id, 'like');
  
  if (result.success) {
    if (result.match) {
      // ถ้า match ให้แสดง match modal ก่อน (ยังไม่ลบการ์ด)
      setShowMatch(true);
      setMatchedCardId(targetCard.id);
      refreshMatches();
    } else {
      // ถ้าไม่ match ให้ลบการ์ดทันที
      removeCard(targetCard.id);
      setCurrentImageIndex(0);
    }
  } else if (!result.limitReached){
    // ⚠️ ถ้า API error ให้ reload profiles เพื่อคืน state กลับมา
    console.error('Error occurred while liking');
    updateWithFilters(profileFilters);
  }
};

  const handlePass = async (card?: Card) => {
    const targetCard = card || currentCard;
    if (!targetCard) return;
  
    // เรียก API ก่อน - เปลี่ยนจาก 'dislike' เป็น 'pass'
    const result = await callMerryAPI(targetCard.id, 'pass');
    
    if (result.success) {
      // pass ไม่มี match เลยลบการ์ดเลย
      removeCard(targetCard.id);
      setCurrentImageIndex(0);
    } else if (!result.limitReached){
      console.error('Error occurred while passing');
    }
  };

  const handleProfile = () => setOpenProfile(true);
  const closeProfile = () => setOpenProfile(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setOpenProfile(false);
    };

    router.events?.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events?.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const handleCurrentCardChange = (card: Card | null) => {
    // เช็คว่าเป็นการ์ดใหม่หรือไม่ ถ้าใช่ค่อยรีเซ็ต
    if (card && currentCard && card.id !== currentCard.id) {
      setCurrentImageIndex(0);
    }
    setCurrentCard(card);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const maxIndex = (currentCard?.img?.length || 1) - 1;
      return prevIndex > 0 ? prevIndex - 1 : maxIndex;
    });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const maxIndex = (currentCard?.img?.length || 1) - 1;
      return prevIndex < maxIndex ? prevIndex + 1 : 0;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 h-full min-h-0 w-full bg-[#160404] rounded-lg flex items-center justify-center relative">
        {/* Heart animation */}
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="animate-pulse absolute">
              <svg className="w-24 h-24 text-[#FF6390]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div className="animate-ping absolute">
              <svg className="w-20 h-20 text-[#FF6390] opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
          
          {/* Text animation */}
          <div className="flex space-x-3">
            {["Merry", "Match!"].map((word, wIndex) => (
              <div key={wIndex} className="flex space-x-0.5">
                {word.split("").map((char, i) => (
                  <p
                    key={i}
                    className="text-pink-500 text-4xl font-extrabold animate-bounce"
                    style={{ animationDelay: `${(i + wIndex * 0.5) * 0.1}s` }}
                  >
                    {char}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 h-full min-h-0 w-full bg-[#160404] rounded-lg flex items-center justify-center">
        <div className="text-white text-xl">Error loading matching profiles: {error}</div>
      </div>
    )
  }

  // แสดงข้อความเมื่อไม่มีโปรไฟล์ที่ตรงกับ filter
  if (cards.length === 0) {
    return (
      <div className="flex-1 h-full min-h-0 w-full bg-[#160404] rounded-lg flex flex-col">
        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl text-center">
            <p>No profiles match your criteria</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        </div>
        
        {/* Filter section at bottom for mobile */}
        <div className="sm:hidden p-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button 
              className="text-[#C8CCDB] font-medium text-center text-sm flex flex-row gap-2 items-center"
              onClick={handleOpenFilter}
            >
              <GiSettingsKnobs className="text-white w-6 h-6" />
              Filter
            </button>
            <p className="text-[#646D89] text-center text-sm">
              Merry limit Today
              <span className={subscription?.merry_limit === 0 ? "text-red-500 ml-2" : "text-[#FF1659] ml-2"}>
                {subscription?.merry_limit ?? 0}/{subscription?.package?.daily_swipe_limit ?? 0}
              </span>
            </p>
          </div>
        </div>
        
        {/* Filter Modal - แสดงเฉพาะบน mobile */}
        {showFilterModal && (
          <MatchingRight 
            isModal={true}
            onClose={handleCloseFilter}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 sm:h-full h-[1000px] w-full bg-black rounded-none sm:rounded-lg flex items-center justify-center relative overflow-hidden">
      
      {/* Preview Cards Container */}
      <div className="absolute inset-0 hidden sm:flex items-center justify-center z-10">
        <div className="relative w-full flex items-center justify-center">
          
          {/* Left Preview Card */}
          {leftCard && (
            <div className="absolute left-0 -translate-y-1/2 w-32 h-44 sm:w-60 sm:h-56 ">
              <div className="w-full h-[450px] rounded-r-xl overflow-hidden shadow-2xl bg-gray-800 ">
                <Img 
                  src={leftCard.img[0]} 
                  alt={`${leftCard.title} ${leftCard.age}`}
                  className="w-full h-full object-cover blur-sm"
                  loading="eager"
                  width={600}
                  height={450}
                  quality={100}
                  priority
                />
                <div className="absolute -bottom-60 inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
            </div>
          )}
          
          {/* Right Preview Card */}
          {rightCard && (
            <div className="absolute right-0 -translate-y-1/2 w-32 h-44 sm:w-60 sm:h-56 ">
              <div className="w-full h-[450px] rounded-l-xl overflow-hidden shadow-2xl bg-gray-800">
                <Img 
                  src={rightCard.img[0]} 
                  alt={`${rightCard.title} ${rightCard.age}`}
                  className="w-full h-full object-cover blur-sm"
                  loading="eager"
                  width={600}
                  height={450}
                  quality={100}
                  priority
                />
                <div className="absolute -bottom-60 inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full h-full sm:w-auto sm:h-auto sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl px-0 sm:px-4 relative z-20">
        <div className="w-full sm:h-auto relative rounded-none sm:rounded-2xl overflow-hidden shadow-none sm:shadow-2xl">

          <SwipeDeck 
            items={cards} 
            onLike={handleLike}
            onPass={handlePass}
            currentImageIndex={currentImageIndex}
            onCurrentCardChange={handleCurrentCardChange}
            disabled={showMatch}
          />
          
          {/* Gradient Overlay at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 sm:h-52 h-80 bg-gradient-to-t from-[#390741] via-[#07094100] to-transparent rounded-none sm:rounded-b-2xl"></div>
        </div>

          {/* Name, Age และ Profile Button - Position คงที่ */}
          <div className={`absolute bottom-[600px] sm:bottom-16 left-6 sm:left-10 right-6 sm:right-10 flex items-center justify-between sm:justify-start sm:gap-3 z-30 ${showMatch ? 'sm:hidden' : ''}`}>
            <div className="flex flex-row gap-2">
              <h3 className="text-white font-bold text-2xl sm:text-3xl drop-shadow-2xl">{currentCard?.title || ''}</h3>
              <h3 className="text-white font-bold text-2xl sm:text-3xl drop-shadow-2xl">{currentCard?.age || ''}</h3>
            </div>
            
            <button
              onClick={handleProfile}
              className="rounded-full w-[40px] h-[40px] sm:w-[22px] sm:h-[22px] backdrop-blur-xl grid place-items-center shadow-xl bg-white/30"
              aria-label="Open profile"
            >
              <FaEye className="w-[20px] h-[20px] sm:w-[12px] sm:h-[12px] text-white" />
            </button>
          </div>
        

        {/* Desktop Arrow Buttons - แยกออกมา */}
          <div className={`hidden sm:flex absolute bottom-16 right-6 gap-2 z-30 ${showMatch ? 'sm:hidden' : ''}`}>
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

        {/* Location - Mobile only */}
          <div className={`sm:hidden absolute bottom-[570px] left-6 flex flex-row gap-2 items-center z-30 ${showMatch ? 'sm:hidden' : ''}`}>
            <RiMapPin2Fill className="text-[#BEBFF1] text-2xl" />
            <p className="text-[#D6D9E4] text-xl capitalize">
              {currentCard?.location?.city && currentCard?.location?.location 
              ? `${currentCard.location.city}, ${currentCard.location.location}`
              : currentCard?.location?.city || currentCard?.location?.location || 'Location not available'}
            </p>
          </div>
        

        {/* Action Buttons - Position คงที่ */}
          <div className={`absolute bottom-[475px] sm:bottom-[-25px] left-1/2 -translate-x-1/2 flex gap-6 z-30 ${showMatch ? 'hidden' : ''}`}>
            <button
              onClick={() => handlePass()}
              className="w-15 h-15 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl grid place-items-center shadow-xl hover:shadow-2xl transition hover:scale-105"
            >
              <IoClose className="text-gray-400 w-10 h-10 sm:w-9 sm:h-9" />
            </button>
            <button
              onClick={() => handleLike()}
              className="w-15 h-15 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl grid place-items-center shadow-xl hover:shadow-2xl transition hover:scale-105"
            >
              <FaHeart className="text-red-500 w-10 h-10 sm:w-7 sm:h-7" />
            </button>
          </div>
        
        

        {/* MerryMatch - แสดงเฉพาะเมื่อ match */}
        {showMatch && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-50 cursor-pointer"
            onClick={handleCloseMatch}
          >
            <div className="pointer-events-auto">
              <MerryMatch />
            </div>
          </div>
        )}

        <div className="flex flex-row justify-between">
          <div className="sm:hidden absolute mt-30 left-8 sm:left-0 sm:right-0 cursor-pointer">
            <button 
              className="text-[#C8CCDB] font-medium text-center text-sm flex flex-row gap-2 items-center"
              onClick={handleOpenFilter}
            >
              <GiSettingsKnobs className="text-white w-6 h-6" />
              Filter
            </button>
          </div>

          {/* Filter Modal - แสดงเฉพาะบน mobile */}
          {showFilterModal && (
            <MatchingRight 
              isModal={true}
              onClose={handleCloseFilter}
            />
          )}

          <div className={`absolute mt-30 sm:mt-12 right-8 sm:left-0 sm:right-0 `}>
            <p className="text-[#646D89] text-center text-sm">
              Merry limit Today
              <span className={subscription?.merry_limit === 0 ? "text-red-500 ml-2" : "text-[#FF1659] ml-2"}>
                {subscription?.merry_limit ?? 0}/{subscription?.package?.daily_swipe_limit ?? 0}
              </span>
            </p>
          </div>
        </div>
        
      </div>

      {/* User Profile View */}
      {openProfile && currentCard && (
        <UserProfileView 
          userId={currentCard.id}
          onClose={closeProfile}
          onLike={() => handleLike(currentCard)}
          onPass={() => handlePass(currentCard)}
        />
      )}

      {/* Limit Reached Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoClose className="w-6 h-6 text-gray-400" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#742138] to-[#A62D82] flex items-center justify-center">
                <FaHeart className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-center text-[#2A2E3F] mb-3">
              Out of Merry Limit!
            </h3>

            {/* Description */}
            <p className="text-center text-gray-600 mb-6">
              You&apos;ve reached your daily swipe limit. Upgrade to get more Merry and make more connections!
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  router.push('/package');
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#742138] to-[#A62D82] text-white rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                Upgrade Package
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full py-3 px-6 border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
            </div>

            {/* Footer Text */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Your limit will reset tomorrow
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchingCenter;