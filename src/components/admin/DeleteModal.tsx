"use client";

import React from 'react';
import { X } from 'lucide-react';
import { DeleteModalProps } from '../../types/admin';

const DeleteModal: React.FC<DeleteModalProps> = ({ 
  showDeleteModal, 
  setShowDeleteModal, 
  confirmDelete 
}) => {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900">Delete Confirmation</h3>
          <button 
            onClick={() => setShowDeleteModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
  <hr className="my-4 border-gray-200 w-[calc(100%+4rem)] -ml-8 -mr-8" />
  <p className="text-base text-[#7B7B7B] mb-8 mt-2">Do you sure to delete this Package?</p>
        <div className="flex gap-4">
          <button
            onClick={confirmDelete}
            className="px-6 py-3 rounded-full font-bold bg-[#FFE1EA] text-[#C70039] text-base hover:bg-[#FFB1C8] transition-colors"
          >
            Yes, I want to delete
          </button>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-6 py-3 rounded-full font-bold bg-[#C70039] text-white text-base hover:bg-[#950028] transition-colors"
          >
            No, I don't want
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;