import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  sexualIdentities: string;
  sexualPreferences: string;
  racialPreferences: string;
  meetingInterests: string;
  aboutMe: string;
  hobbies: string[];
  photos: string[];
}

export default function UserProfileView() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock data for Jon Snow
  const profile: UserProfile = {
    id: '1',
    name: 'Jon Snow',
    age: 26,
    location: 'Bangkok, Thailand',
    sexualIdentities: 'Male',
    sexualPreferences: 'Female',
    racialPreferences: 'Asian',
    meetingInterests: 'Friends',
    aboutMe: 'I know nothing..but you',
    hobbies: ['e-sport', 'dragon', 'series'],
    photos: ['/assets/jon-snow-1.jpg', '/assets/jon-snow-2.jpg']
  };

  const handleLike = () => alert('You liked this profile! ❤️');
  const handlePass = () => alert('You passed this profile! ✕');
  const handleClose = () => {
    router.push('/');
  };

  const nextImage = () => setCurrentImageIndex(prev => 
    prev < profile.photos.length - 1 ? prev + 1 : 0
  );
  
  const prevImage = () => setCurrentImageIndex(prev => 
    prev > 0 ? prev - 1 : profile.photos.length - 1
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      ></div>
      
      {/* Profile Popup Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <div className="absolute top-6 right-6 z-50">
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-[#9AA1B9] hover:text-[#C70039] transition-colors cursor-pointer bg-white rounded-full shadow-lg"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Profile Image */}
          <div className="lg:w-[50%] w-full h-[400px] lg:h-[450px] relative">
            
            {/* กล่องรูป */}
            <div className="h-full w-full relative rounded-3xl overflow-hidden m-8 transform -translate-y-20 -translate-x-6 scale-75">
              <div className="h-full w-full relative rounded-3xl overflow-hidden bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-lg">Jon Snow profile</span>
              </div>
            </div>
            
            {/* กล่องตัวนับรูป */}
            <div className="absolute bottom-20 left-[80px] lg:left-[80px] text-gray-500 text-sm font-medium">
              {currentImageIndex + 1}/{profile.photos.length}
            </div>
            
            {/* กล่องปุ่ม Like/Pass */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
              <button 
                onClick={handlePass}
                className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <span className="text-[#9AA1B9] text-xl font-bold">✕</span>
              </button>
              <button 
                onClick={handleLike}
                className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <span className="text-[#C70039] text-xl">❤️</span>
              </button>
            </div>
            
            {/* กล่องลูกศรซ้ายขวา */}
            <div className="absolute bottom-18 left-1/2 transform translate-x-28 flex items-center">
              <button 
                onClick={prevImage}
                className="w-8 h-8 flex items-center justify-center transition-all -mr-1"
              >
                <span className="text-[#9AA1B9] text-sm">←</span>
              </button>
              <button 
                onClick={nextImage}
                className="w-8 h-8 flex items-center justify-center transition-all -ml-1"
              >
                <span className="text-[#9AA1B9] text-sm">→</span>
              </button>
            </div>
            
          </div>
          
          {/* Right Side - Profile Info */}
          <div className="lg:w-[50%] w-full pt-6 pl-0 lg:pl-[40px] pr-6 pb-6 flex flex-col gap-6">
            {/* Name and Location */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
                {profile.name} {profile.age}
              </h1>
              <div className="flex items-center text-gray-600">
                <span className="text-[#C70039] mr-2 text-base">📍</span>
                <span className="text-base">{profile.location}</span>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-[#9AA1B9] text-base w-32">Sexual identities:</span>
                <span className="font-medium text-gray-800 text-base ml-8">{profile.sexualIdentities}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-[#9AA1B9] text-base w-32">Sexual preferences:</span>
                <span className="font-medium text-gray-800 text-base ml-8">{profile.sexualPreferences}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-[#9AA1B9] text-base w-32">Racial preferences:</span>
                <span className="font-medium text-gray-800 text-base ml-8">{profile.racialPreferences}</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-[#9AA1B9] text-base w-32">Meeting interests:</span>
                <span className="font-medium text-gray-800 text-base ml-8">{profile.meetingInterests}</span>
              </div>
            </div>
            
            {/* About Me */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 text-base">About me</h3>
              <p className="text-[#9AA1B9] italic text-base leading-relaxed">"{profile.aboutMe}"</p>
            </div>
            
            {/* Hobbies */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 text-base">Hobbies and Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby, index) => (
                  <span key={index} className="bg-white border border-[#DF89C6] text-[#7D2262] px-3 py-1 rounded-full text-sm font-medium hover:bg-pink-50 transition-colors">
                    {hobby}
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