import { useEffect } from 'react';
import Image from 'next/image';
import { LuX } from 'react-icons/lu';

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, isOpen, onClose }: ImageModalProps) {
  // ป้องกันการ scroll เมื่อเปิด modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Image container - คล้ายกับ preview */}
      <div className="relative inline-block">
        <div className="relative">
          <Image
            src={imageUrl}
            alt="Preview"
            width={500}
            height={500}
            className="rounded-xl max-h-60 md:max-h-[500px] w-auto object-cover shadow-2xl"
          />
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
          >
            <LuX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

