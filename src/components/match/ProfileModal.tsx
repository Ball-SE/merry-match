import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Camera, Heart, X, ArrowLeft } from 'lucide-react';
import { mapLocationToString } from '@/lib/locationUtils';
import { FaHeart } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { Card } from '@/components/swipe/SwipeDeck';
import Img from 'next/image';

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

interface Profile {
  id: string;
  name: string;
  email: string;
  photo_url: string | null;
  age: number | null;
  bio: string | null;
  location: string | null;
  photos: string[] | null;
  gender?: string | null;
  sexual_preferences?: string | null;
  racial_preferences?: string | null;
  meeting_interests?: string | null;
  interests?: string[] | null;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCard: Card | null;
  profiles: Profile[];
  onLike?: (card: Card) => void;
  onPass?: (card: Card) => void;
}

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  currentCard, 
  profiles,
  onLike, 
  onPass 
}: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
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

  // ดึงข้อมูล profile จาก profiles array เมื่อเปิด modal
  useEffect(() => {
    if (!isOpen || !currentCard?.id) return;
    
    try {
      setProfileLoading(true);
      setProfileError(null);
      setCurrentImageIndex(0);
      setActionState({
        type: null,
        loading: false,
        success: false,
        error: null
      });

      console.log('🔍 Finding profile for user ID:', currentCard.id);
      console.log('📋 Available profiles:', profiles.map(p => ({ id: p.id, name: p.name })));
      console.log('📊 Profiles data types:', profiles.map(p => ({ 
        id: typeof p.id, 
        interests: typeof p.interests, 
        photos: typeof p.photos,
        interestsValue: p.interests,
        photosValue: p.photos
      })));

      // หา profile ที่ตรงกับ currentCard.id
      const foundProfile = profiles.find(p => p.id === currentCard.id);
      
      if (foundProfile) {
        console.log('✅ Found profile data:', foundProfile);
        console.log('🔍 Location data:', foundProfile.location, typeof foundProfile.location);
        console.log('🔍 All profile fields:', Object.keys(foundProfile));
        console.log('🏠 Processing location:', foundProfile.location);
        
        // แปลงข้อมูลจาก Profile format เป็น UserProfile format
        const profileData: UserProfile = {
          id: String(foundProfile.id || ''),
          name: String(foundProfile.name || currentCard.title || 'Unknown'),
          age: Number(foundProfile.age) || parseInt(currentCard.age) || 0,
          email: String(foundProfile.email || `${currentCard.title.toLowerCase().replace(/\s+/g, '.')}@example.com`),
          username: String(foundProfile.email?.split('@')[0] || currentCard.title.toLowerCase().replace(/\s+/g, '') || 'user'),
city: (() => {
            // ข้อมูล location ในฐานข้อมูลเป็น object ที่มี city และ location
            let locationData = '';
            
            if (foundProfile.location && typeof foundProfile.location === 'object') {
              // ใช้ city จาก location object
              locationData = (foundProfile.location as unknown as { city: string }).city || '';
            } else if (typeof foundProfile.location === 'string') {
              // ถ้าเป็น string ให้ใช้เลย
              locationData = foundProfile.location;
            } else {
              locationData = 'bangkok'; // default
            }
            
            // ใช้ mapLocationToString จาก locationUtils
            const mappedLocation = mapLocationToString(locationData);
            
            console.log('🗺️ Location mapping:', {
              raw_location: foundProfile.location,
              extracted_city: locationData,
              mapped_result: mappedLocation
            });
            
            return mappedLocation;
          })(),
          gender: String(foundProfile.gender || "Not specified"),
          sexual_preferences: String(foundProfile.sexual_preferences || "Not specified"),
          racial_preferences: String(foundProfile.racial_preferences || "Not specified"), 
          meeting_interests: String(foundProfile.meeting_interests || "Not specified"),
          bio: String(foundProfile.bio || ""),
          interests: Array.isArray(foundProfile.interests) ? foundProfile.interests.filter(i => typeof i === 'string') : [],
          photos: Array.isArray(foundProfile.photos) ? foundProfile.photos.filter(p => typeof p === 'string') : (foundProfile.photo_url ? [foundProfile.photo_url] : currentCard.img || [])
        };
        
        setProfile(profileData);
      } else {
        console.log('❌ Profile not found in profiles array');
        throw new Error('Profile not found');
      }
    } catch (error: unknown) {
      setProfileError(error instanceof Error ? error.message : 'Failed to load profile');
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [isOpen, currentCard, profiles]);

  // Handle Like/Pass actions
  const handleAction = async (actionType: 'like' | 'pass') => {
    if (actionState.loading || !currentCard) return;
    
    setActionState({
      type: actionType,
      loading: true,
      success: false,
      error: null
    });
    
    try {
      // เรียก callback function ที่ส่งมาจาก parent
      if (actionType === 'like' && onLike) {
        await onLike(currentCard);
      } else if (actionType === 'pass' && onPass) {
        await onPass(currentCard);
      }
      
      setActionState({
        type: actionType,
        loading: false,
        success: true,
        error: null
      });
      
      // ปิด modal หลังจาก action สำเร็จ
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: unknown) {
      setActionState({
        type: actionType,
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : `Failed to ${actionType} profile. Please try again.`
      });
    }
  };

  const handleLike = () => handleAction('like');
  const handlePass = () => handleAction('pass');
  
  const handleClose = () => {
    if (!actionState.loading) {
      onClose();
    }
  };
  
  const clearError = () => {
    setActionState(prev => ({ ...prev, error: null }));
  };

  // ถ้า modal ไม่เปิดหรือไม่มี currentCard ให้ return null
  if (!isOpen || !currentCard) {
    return null;
  }

  // Loading state สำหรับดึงข้อมูล profile
  if (profileLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C70039] mx-auto mb-4" />
          <p className="text-gray-600">Loading profile details...</p>
        </div>
      </div>
    );
  }

  // Error state สำหรับดึงข้อมูล profile
  if (profileError || !profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{profileError || 'Profile not found'}</p>
          <button
            onClick={onClose}
            className="bg-[#C70039] text-white px-6 py-2 rounded-lg hover:bg-[#950028] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Layout - Full Screen */}
      <div className={`sm:hidden fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Success Message */}
        {actionState.success && (
          <div className="absolute top-4 left-4 right-4 z-10 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
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
          <div className="absolute top-4 left-4 right-4 z-10 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
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
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#C70039] mx-auto mb-2" />
              <p className="text-gray-600">
                {actionState.type === 'like' ? 'Liking profile...' : 'Passing profile...'}
              </p>
            </div>
          </div>
        )}
        
        {/* Mobile Header */}
        <div className="absolute z-50 flex items-center justify-between pt-18 pl-3">
          <button 
            onClick={handleClose}
            disabled={actionState.loading}
            className="flex items-center gap-2 text-white font-medium"
          >
            <ArrowLeft className="w-10 h-10" />
          </button>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Profile Image Section */}
          <div className="relative h-96 w-full">
            {profile.photos && profile.photos.length > 0 ? (
              <Img 
                src={profile.photos[currentImageIndex]} 
                alt={`${profile.name}'s profile`} 
                className="w-full h-full object-cover"
                width={600}
                height={450}
                quality={100}
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            {/* Image Counter */}
            {profile.photos && profile.photos.length > 1 && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                {currentImageIndex + 1}/{profile.photos.length}
              </div>
            )}
            
            {/* Navigation Arrows */}
            {profile.photos && profile.photos.length > 1 && (
              <div className="absolute inset-0 flex">
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : profile.photos.length - 1)}
                  disabled={actionState.loading}
                  className="flex-1 flex items-center justify-start pl-4 text-white text-2xl font-bold opacity-0 hover:opacity-100 transition-opacity"
                >
                  ←
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev < profile.photos.length - 1 ? prev + 1 : 0)}
                  disabled={actionState.loading}
                  className="flex-1 flex items-center justify-end pr-4 text-white text-2xl font-bold opacity-0 hover:opacity-100 transition-opacity"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="p-6 space-y-6">
            {/* Name and Location */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {profile.name}, {profile.age}
              </h1>
              <div className="flex items-center text-gray-600">
                <Img src="/assets/map.png" alt="Location" className="w-4 h-4 mr-2" width={16} height={16} />
                <span className="text-gray-700">{profile.city}</span>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="space-y-3">
              <div className="flex">
                <span className="text-gray-600 w-32 text-sm">Sexual identities</span>
                <span className="font-medium text-gray-800 flex-1">{profile.gender}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32 text-sm">Sexual preferences</span>
                <span className="font-medium text-gray-800 flex-1">{profile.sexual_preferences}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32 text-sm">Racial preferences</span>
                <span className="font-medium text-gray-800 flex-1">{profile.racial_preferences}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32 text-sm">Meeting interests</span>
                <span className="font-medium text-gray-800 flex-1">{profile.meeting_interests}</span>
              </div>
            </div>
            
            {/* About Me */}
            {profile.bio && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">About me</h3>
                <p className="text-gray-700 italic leading-relaxed">&quot;{profile.bio}&quot;</p>
              </div>
            )}
            
            {/* Hobbies and Interests */}
            {profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Hobbies and Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.filter(interest => typeof interest === 'string').map((interest: string, index: number) => (
                    <span key={index} className="bg-white border border-[#DF89C6] text-[#7D2262] px-3 py-1 rounded-full text-sm font-medium">
                      {String(interest)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Action Buttons - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-center gap-6">
            <button 
              onClick={handlePass}
              disabled={actionState.loading}
              className={`w-16 h-16 bg-white border-2 border-gray-300 rounded-full grid place-items-center shadow-lg hover:shadow-xl transition-all ${
                actionState.loading ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'
              }`}
            >
              {actionState.loading && actionState.type === 'pass' ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              ) : (
                <IoClose className="text-gray-500 w-8 h-8" />
              )}
            </button>
            
            <button 
              onClick={handleLike}
              disabled={actionState.loading}
              className={`w-16 h-16 bg-[#C70039] rounded-full grid place-items-center shadow-lg hover:shadow-xl transition-all ${
                actionState.loading ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'
              }`}
            >
              {actionState.loading && actionState.type === 'like' ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <FaHeart className="text-white w-8 h-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Modal */}
      <div className="hidden sm:flex fixed inset-0 bg-black bg-opacity-50 items-center justify-center p-4 z-50">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
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
              onClick={handleClose}
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
          
          <div className="flex flex-col md:flex-row">
            
            {/* Profile Image */}
            <div className="w-full h-[500px] md:w-[50%] md:h-[450px] relative">
              
              {/* กล่องรูป */}
              <div className="h-full w-full relative rounded-3xl overflow-hidden m-8 transform -translate-y-20 -translate-x-6 scale-75">
                {profile.photos && profile.photos.length > 0 ? (
                  <Img 
                    src={profile.photos[currentImageIndex]} 
                    alt={`${profile.name}'s profile`} 
                    className="w-full h-full object-cover"
                    width={600}
                    height={450}
                    quality={100}
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* กล่องตัวนับรูป */}
              {profile.photos && profile.photos.length > 0 && (
                <div className="absolute bottom-20 left-[80px] text-gray-500 text-sm font-medium">
                  {currentImageIndex + 1}/{profile.photos.length}
                </div>
              )}
              
              {/* กล่องปุ่ม Like/Pass */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                <button 
                  onClick={handlePass}
                  disabled={actionState.loading}
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl grid place-items-center shadow-xl hover:shadow-2xl transition hover:scale-105 ${
                    actionState.loading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  {actionState.loading && actionState.type === 'pass' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <IoClose className="text-gray-500 w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                </button>
                
                <button 
                  onClick={handleLike}
                  disabled={actionState.loading}
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl grid place-items-center shadow-xl hover:shadow-2xl transition hover:scale-105 ${
                    actionState.loading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  {actionState.loading && actionState.type === 'like' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <FaHeart className="text-red-500 w-6 h-6 sm:w-7 sm:h-7" />
                  )}
                </button>
              </div>
              
              {/* กล่องลูกศรซ้ายขวา */}
              {profile.photos && profile.photos.length > 1 && (
                <div className="absolute bottom-18 left-1/2 transform translate-x-28 flex items-center">
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : profile.photos.length - 1)}
                    disabled={actionState.loading}
                    className={`w-8 h-8 flex items-center justify-center transition-all -mr-1 ${
                      actionState.loading ? 'text-gray-300 cursor-not-allowed' : 'text-[#9AA1B9] hover:text-[#C70039]'
                    }`}
                  >
                    <span className="text-sm">←</span>
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev < profile.photos.length - 1 ? prev + 1 : 0)}
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
            
            {/* Profile Info */}
            <div className="w-full p-6 md:w-[50%] md:pt-6 md:pl-[40px] md:pr-6 md:pb-6 flex flex-col gap-6">
              {/* Name and Location Container */}
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                  {profile.name} {profile.age}
                </h1>
                <div className="flex items-center text-gray-600">
                  <Img src="/assets/map.png" alt="Location" className="w-4 h-4 mr-2" width={16} height={16} />
                  <span className="text-gray-700 text-base">{profile.city}</span>
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
                  <p className="text-gray-900 italic text-base leading-relaxed">&quot;{profile.bio}&quot;</p>
                </div>
              )}
              
              {/* Hobbies and Interests */}
              {profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-base">Hobbies and Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.filter(interest => typeof interest === 'string').map((interest: string, index: number) => (
                      <span key={index} className="bg-white border border-[#DF89C6] text-[#7D2262] px-3 py-1 rounded-full text-sm font-medium hover:bg-pink-50 transition-colors">
                        {String(interest)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}