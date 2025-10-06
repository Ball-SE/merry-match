import React, { useState } from 'react';
import { Heart, X } from 'lucide-react';

interface ProfileCardPopupProps {
  formData: {
    name: string;
    city: string;
    location: string;
    gender: string;
    sexual_preferences: string;
    racial_preferences: string;
    meeting_interests: string;
    bio: string;
    interests: string[];
    photos: string[];
  };
  profile: {
    age?: number;
  } | null;
  onClose: () => void;
}

export default function ProfileCardPopup({ formData, profile, onClose }: ProfileCardPopupProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    if (formData.photos && formData.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % formData.photos.length);
    }
  };

  const prevPhoto = () => {
    if (formData.photos && formData.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + formData.photos.length) % formData.photos.length);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="absolute top-6 right-6 z-50 flex gap-3">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-colors text-[#9AA1B9] hover:text-[#C70039] cursor-pointer"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row">
          <div className="w-full h-[500px] md:w-[50%] md:h-[450px] relative">
            <div className="h-full w-full relative rounded-3xl overflow-hidden m-8 transform -translate-y-20 -translate-x-6 scale-75">
              {formData.photos && formData.photos.length > 0 ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={formData.photos[currentPhotoIndex]} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            {formData.photos && formData.photos.length > 0 && (
              <div className="absolute bottom-20 left-[80px] text-gray-500 text-sm font-medium">
                {currentPhotoIndex + 1}/{formData.photos.length}
              </div>
            )}
            
            {/* กล่องปุ่ม Like/Pass - เหมือนหน้า preview */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-gray-200 bg-white hover:shadow-xl hover:scale-105 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border border-gray-200 bg-white hover:shadow-xl hover:scale-105 transition-all"
              >
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </button>
            </div>
            
            {/* ปุ่มลูกศรเลื่อนรูป */}
            {formData.photos && formData.photos.length > 1 && (
              <div className="absolute bottom-18 left-1/2 transform translate-x-28 flex items-center">
                <button 
                  onClick={prevPhoto}
                  className="w-8 h-8 flex items-center justify-center transition-all -mr-1 text-[#9AA1B9] hover:text-[#C70039]"
                >
                  <span className="text-sm">←</span>
                </button>
                <button 
                  onClick={nextPhoto}
                  className="w-8 h-8 flex items-center justify-center transition-all -ml-1 text-[#9AA1B9] hover:text-[#C70039]"
                >
                  <span className="text-sm">→</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="w-full p-6 md:w-[50%] md:pt-6 md:pl-[40px] md:pr-6 md:pb-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {formData.name || 'User'} {profile?.age || 27}
              </h1>
              <div className="flex items-center text-gray-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/map.png" alt="Location" className="w-4 h-4 mr-2" />
                <span className="text-gray-700 text-base">
                  {formData.city ? formData.city.charAt(0).toUpperCase() + formData.city.slice(1) : 'Bangkok'}, {formData.location ? formData.location.charAt(0).toUpperCase() + formData.location.slice(1) : 'Thailand'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-900 text-base w-32">Gender:</span>
                <span className="font-medium text-gray-700 text-base ml-8">{formData.gender || 'Not specified'}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-gray-900 text-base w-32">Sexual preferences:</span>
                <span className="font-medium text-gray-700 text-base ml-8">{formData.sexual_preferences || 'Not specified'}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-gray-900 text-base w-32">Racial preferences:</span>
                <span className="font-medium text-gray-700 text-base ml-8">{formData.racial_preferences || 'Not specified'}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-gray-900 text-base w-32">Meeting interests:</span>
                <span className="font-medium text-gray-700 text-base ml-8">{formData.meeting_interests || 'Not specified'}</span>
              </div>
            </div>
            
            {formData.bio && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 text-base">About me</h3>
                <p className="text-gray-900 italic text-base leading-relaxed">&quot;{formData.bio}&quot;</p>
              </div>
            )}
            
            {formData.interests && formData.interests.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 text-base">Hobbies and Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest: string, index: number) => (
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
