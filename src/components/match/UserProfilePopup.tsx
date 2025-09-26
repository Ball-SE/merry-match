import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Camera, Heart, X } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  email: string;
  username: string;
  city: string;
  gender: string;
  sexual_preferences: string;
  racial_preferences: string;
  meeting_interests: string;
  bio: string;
  interests: string[];
  photos: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  cardData?: {
    id: string;
    title: string;
    age: string;
    img: string[];
  };
}

export default function UserProfilePopup({ isOpen, onClose, userId, cardData }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [actionState, setActionState] = useState<{
    type: 'like' | 'pass' | null;
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    type: null,
    loading: false,
    success: false,
    error: null
  });

  // ดึงข้อมูล profile
  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // สร้าง mock data ตามข้อมูลการ์ดที่ส่งมา
        const mockProfile: UserProfile = {
          id: userId,
          name: cardData?.title || "Unknown User",
          age: parseInt(cardData?.age || "25"),
          email: `${cardData?.title?.toLowerCase() || "user"}@example.com`,
          username: cardData?.title?.toLowerCase() || "user",
          city: cardData?.title === "Daeny" ? "Bangkok, Thailand" : 
                cardData?.title === "Knal" ? "Chiang Mai, Thailand" : 
                cardData?.title === "Ygritte" ? "Phuket, Thailand" : "Bangkok, Thailand",
          gender: "female",
          sexual_preferences: "male",
          racial_preferences: cardData?.title === "Daeny" ? "indefinite" : "asian",
          meeting_interests: cardData?.title === "Daeny" ? "long-term commitment" : "friends",
          bio: cardData?.title === "Daeny" ? "I know nothing...but you" : 
               cardData?.title === "Knal" ? "Adventure seeker and nature lover" :
               cardData?.title === "Ygritte" ? "Free spirit who loves the wild" : "Hello there!",
          interests: cardData?.title === "Daeny" ? ["dragon", "romantic relationship", "political", "black hair", "friendly", "fire"] :
                    cardData?.title === "Knal" ? ["hiking", "photography", "traveling", "cooking"] :
                    cardData?.title === "Ygritte" ? ["archery", "nature", "adventure", "freedom"] :
                    ["reading", "music", "movies", "coffee"],
          photos: cardData?.img || ["/assets/daeny.png", "/assets/ygritte.png", "/assets/knal.png"]
        };
        
        // จำลองการโหลด
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProfile(mockProfile);

        // TODO: เมื่อต้องการใช้ API จริง ให้ uncomment โค้ดด้านล่าง
        /*
        const response = await fetch(`/api/profile/${userId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch profile');
        }

        setProfile(result.data);
        */
      } catch (error: any) {
        setError(error.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, userId]);

  // Handle Like/Pass actions
  const handleAction = async (actionType: 'like' | 'pass') => {
    if (actionState.loading || !profile) return;
    
    setActionState({
      type: actionType,
      loading: true,
      success: false,
      error: null
    });
    
    try {
      // TODO: Implement actual like/pass logic
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.1) {
            reject(new Error('Network error occurred'));
          } else {
            resolve(true);
          }
        }, 1500);
      });
      
      setActionState({
        type: actionType,
        loading: false,
        success: true,
        error: null
      });
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error: any) {
      setActionState({
        type: actionType,
        loading: false,
        success: false,
        error: error.message || `Failed to ${actionType} profile. Please try again.`
      });
    }
  };

  const handleLike = () => handleAction('like');
  const handlePass = () => handleAction('pass');
  
  const clearError = () => {
    setActionState(prev => ({ ...prev, error: null }));
  };

  const nextImage = () => {
    if (profile?.photos) {
      setCurrentImageIndex(prev => 
        prev < profile.photos.length - 1 ? prev + 1 : 0
      );
    }
  };
  
  const prevImage = () => {
    if (profile?.photos) {
      setCurrentImageIndex(prev => 
        prev > 0 ? prev - 1 : profile.photos.length - 1
      );
    }
  };

  if (!isOpen) return null;

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C70039] mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={onClose}
            className="bg-[#C70039] text-white px-6 py-2 rounded-lg hover:bg-[#950028] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      {/* Profile Popup Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Success Message */}
        {actionState.success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5" />
              <span>
                {actionState.type === 'like' 
                  ? 'You liked this profile! ❤️' 
                  : 'You passed this profile! ✕'
                }
              </span>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {actionState.error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span>{actionState.error}</span>
              </div>
              <button 
                onClick={clearError}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Loading Overlay */}
        {actionState.loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#C70039] mx-auto mb-2" />
              <p className="text-gray-600">
                {actionState.type === 'like' ? 'Liking profile...' : 'Passing profile...'}
              </p>
            </div>
          </div>
        )}
        
        {/* Close Button */}
        <div className="absolute top-6 right-6 z-50">
          <button 
            onClick={onClose}
            disabled={actionState.loading}
            className={`w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-colors ${
              actionState.loading 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-[#9AA1B9] hover:text-[#C70039] cursor-pointer'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Profile Image */}
          <div className="lg:w-[50%] w-full h-[400px] lg:h-[450px] relative">
            
            {/* กล่องรูป */}
            <div className="h-full w-full relative rounded-3xl overflow-hidden m-8 transform -translate-y-20 -translate-x-6 scale-75">
              {profile.photos && profile.photos.length > 0 ? (
                <img 
                  src={profile.photos[currentImageIndex]} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* กล่องตัวนับรูป */}
            {profile.photos && profile.photos.length > 0 && (
              <div className="absolute bottom-20 left-[80px] lg:left-[80px] text-gray-500 text-sm font-medium">
                {currentImageIndex + 1}/{profile.photos.length}
              </div>
            )}
            
            {/* กล่องปุ่ม Like/Pass */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
              <button 
                onClick={handlePass}
                disabled={actionState.loading}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-gray-200 transition-all ${
                  actionState.loading
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-white hover:shadow-xl hover:scale-105'
                }`}
              >
                {actionState.loading && actionState.type === 'pass' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <X className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              <button 
                onClick={handleLike}
                disabled={actionState.loading}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-gray-200 transition-all ${
                  actionState.loading
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-white hover:shadow-xl hover:scale-105'
                }`}
              >
                {actionState.loading && actionState.type === 'like' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                )}
              </button>
            </div>
            
            {/* กล่องลูกศรซ้ายขวา */}
            {profile.photos && profile.photos.length > 1 && (
              <div className="absolute bottom-18 left-1/2 transform translate-x-28 flex items-center">
                <button 
                  onClick={prevImage}
                  disabled={actionState.loading}
                  className={`w-8 h-8 flex items-center justify-center transition-all -mr-1 ${
                    actionState.loading ? 'text-gray-300 cursor-not-allowed' : 'text-[#9AA1B9] hover:text-[#C70039]'
                  }`}
                >
                  <span className="text-sm">←</span>
                </button>
                <button 
                  onClick={nextImage}
                  disabled={actionState.loading}
                  className={`w-8 h-8 flex items-center justify-center transition-all -ml-1 ${
                    actionState.loading ? 'text-gray-300 cursor-not-allowed' : 'text-[#9AA1B9] hover:text-[#C70039]'
                  }`}
                >
                  <span className="text-sm">→</span>
                </button>
              </div>
            )}
            
          </div>
          
          {/* Right Side - Profile Info */}
          <div className="lg:w-[50%] w-full pt-6 pl-0 lg:pl-[40px] pr-6 pb-6 flex flex-col gap-6">
            {/* Name and Location */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
                {profile.name} {profile.age}
              </h1>
              <div className="flex items-center text-gray-600">
                <img src="/assets/map.png" alt="Location" className="w-4 h-4 mr-2" />
                <span className="text-base">{profile.city}</span>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-900 text-base w-32">Gender:</span>
                <span className="font-medium text-gray-700 text-base ml-8">{profile.gender}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-gray-900 text-base w-32">Sexual preferences:</span>
                <span className="font-medium text-gray-700 text-base ml-8">{profile.sexual_preferences}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-gray-900 text-base w-32">Racial preferences:</span>
                <span className="font-medium text-gray-700 text-base ml-8">{profile.racial_preferences}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-gray-900 text-base w-32">Meeting interests:</span>
                <span className="font-medium text-gray-700 text-base ml-8">{profile.meeting_interests}</span>
              </div>
            </div>
            
            {/* About Me */}
            {profile.bio && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 text-base">About me</h3>
                <p className="text-gray-900 italic text-base leading-relaxed">"{profile.bio}"</p>
              </div>
            )}
            
            {/* Hobbies */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 text-base">Hobbies and Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span key={index} className="bg-white border border-[#DF89C6] text-[#7D2262] px-3 py-1 rounded-full text-sm font-medium hover:bg-pink-50 transition-colors">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
