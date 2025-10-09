import React from 'react';

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ 
  isOpen, 
  onClose, 
  title = "แจ้งเตือน",
  message,
  buttonText = "ตกลง"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-11/12 sm:w-full shadow-xl animate-fadeIn">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-base text-gray-600 mb-6">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 rounded-full font-bold bg-[#C70039] text-white hover:bg-[#950028] transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup;