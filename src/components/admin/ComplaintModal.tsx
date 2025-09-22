"use client";

import React from 'react';
import { X } from 'lucide-react';
import { ComplaintModalProps } from '../../types/admin';

const ComplaintModal: React.FC<ComplaintModalProps> = ({
  showModal,
  setShowModal,
  onConfirm,
  type
}) => {
  if (!showModal) return null;

  const isResolve = type === 'resolve';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-xl w-full mx-4 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isResolve ? 'Resolve Complaint' : 'Cancel Complaint'}
          </h3>
          <button 
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <hr className="my-4 border-gray-200" />
        <p className="text-sm text-gray-600 mb-6">
          {isResolve 
            ? 'This complaint is resolved?' 
            : 'Do you sure to cancel this complaint?'
          }
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-full font-bold bg-[#C70039] text-white text-base hover:bg-[#950028] transition-colors"
          >
            {isResolve ? 'Yes, it has been resolved' : 'Yes, cancel this complaint'}
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-3 rounded-full font-bold bg-[#FFE1EA] text-[#C70039] text-base hover:bg-[#FFB1C8] transition-colors"
          >
            {isResolve ? "No, it's not" : "No, give me more time"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;