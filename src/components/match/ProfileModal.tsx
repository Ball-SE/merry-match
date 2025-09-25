import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Camera, Heart, X } from 'lucide-react';
import { Card } from '@/components/swipe/SwipeDeck';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCard: Card | null;
  onLike?: (card: Card) => void;
  onPass?: (card: Card) => void;
}

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  currentCard, 
  onLike, 
  onPass 
}: ProfileModalProps) {
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

  // รีเซ็ต image index เมื่อเปิด modal ใหม่
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setActionState({
        type: null,
        loading: false,
        success: false,
        error: null
      });
    }
  }, [isOpen, currentCard?.id]);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
              {currentCard.img && currentCard.img.length > 0 ? (
                <img 
                  src={currentCard.img[currentImageIndex]} 
                  alt={`${currentCard.title}'s profile`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* กล่องตัวนับรูป */}
            {currentCard.img && currentCard.img.length > 0 && (
              <div className="absolute bottom-20 left-[80px] text-gray-500 text-sm font-medium">
                {currentImageIndex + 1}/{currentCard.img.length}
              </div>
            )}
            
            {/* กล่องปุ่ม Like/Pass */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
              <button 
                onClick={handlePass}
                disabled={actionState.loading}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                  actionState.loading
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-white hover:shadow-xl hover:scale-105'
                }`}
              >
                {actionState.loading && actionState.type === 'pass' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <X className="w-5 h-5 text-[#9AA1B9]" />
                )}
              </button>
              
              <button 
                onClick={handleLike}
                disabled={actionState.loading}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                  actionState.loading
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-white hover:shadow-xl hover:scale-105'
                }`}
              >
                {actionState.loading && actionState.type === 'like' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <Heart className="w-5 h-5 text-[#C70039]" />
                )}
              </button>
            </div>
            
            {/* กล่องลูกศรซ้ายขวา */}
            {currentCard.img && currentCard.img.length > 1 && (
              <div className="absolute bottom-18 left-1/2 transform translate-x-28 flex items-center">
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : currentCard.img.length - 1)}
                  disabled={actionState.loading}
                  className={`w-8 h-8 flex items-center justify-center transition-all -mr-1 ${
                    actionState.loading ? 'text-gray-300 cursor-not-allowed' : 'text-[#9AA1B9] hover:text-[#C70039]'
                  }`}
                >
                  <span className="text-sm">←</span>
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev < currentCard.img.length - 1 ? prev + 1 : 0)}
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
                {currentCard.title} {currentCard.age}
              </h1>
              <div className="flex items-center text-gray-600">
                <span className="text-[#C70039] mr-2 text-base">📍</span>
                <span className="text-gray-700 text-base">Bangkok, Thailand</span>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-900 text-base w-32">Gender:</span>
                <span className="font-medium text-gray-700 text-base ml-8">Female</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-gray-900 text-base w-32">Sexual preferences:</span>
                <span className="font-medium text-gray-700 text-base ml-8">Male</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-gray-900 text-base w-32">Racial preferences:</span>
                <span className="font-medium text-gray-700 text-base ml-8">Any</span>
              </div>
              <div className="flex items-center whitespace-nowrap">
                <span className="text-gray-900 text-base w-32">Meeting interests:</span>
                <span className="font-medium text-gray-700 text-base ml-8">Long-term relationship</span>
              </div>
            </div>
            
            {/* About Me */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 text-base">About me</h3>
              <p className="text-gray-900 italic text-base leading-relaxed">
                "I love traveling, photography, and trying new cuisines. Looking for someone who shares similar interests and wants to explore the world together."
              </p>
            </div>
            
            {/* Hobbies and Interests */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 text-base">Hobbies and Interests</h3>
              <div className="flex flex-wrap gap-2">
                {['Photography', 'Travel', 'Cooking', 'Music', 'Art'].map((interest: string, index: number) => (
                  <span key={index} className="bg-white border border-[#DF89C6] text-[#7D2262] px-3 py-1 rounded-full text-sm font-medium hover:bg-pink-50 transition-colors">
                    {interest}
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