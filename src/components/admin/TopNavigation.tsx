"use client";

import React from 'react';
import { Search, Plus, ChevronLeft } from 'lucide-react';
import { TopNavigationProps } from '../../types/admin';

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  currentView, 
  setCurrentView, 
  editingPackage, 
  handleAddPackage,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {(currentView === 'add' || currentView === 'edit') && (
            <button 
              onClick={() => setCurrentView('list')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-900">
            {currentView === 'add' ? 'Add Package' : 
             currentView === 'edit' ? `Edit '${editingPackage?.name}'` : 
             'Merry Package'}
          </h2>
        </div>
        {currentView === 'list' && (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <button 
              onClick={handleAddPackage}
              style={{
                borderRadius: '99px',
                fontFamily: 'Nunito, sans-serif',
                color: '#E4E6ED',
                backgroundColor: '#C70039',
                fontWeight: 700,
                fontSize: '16px',
                padding: '12px 24px',
                transition: 'background 0.2s',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Package</span>
            </button>
          </div>
        )}
        {(currentView === 'add' || currentView === 'edit') && (
          <div className="flex items-center space-x-3">
            <button 
              type="button"
              onClick={() => setCurrentView('list')}
              style={{
                borderRadius: '99px',
                fontFamily: 'Nunito, sans-serif',
                color: '#C70039',
                backgroundColor: '#FFE1EA',
                fontWeight: 700,
                fontSize: '16px',
                padding: '12px 24px',
                transition: 'background 0.2s',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              form="package-form"
              style={{
                borderRadius: '99px',
                fontFamily: 'Nunito, sans-serif',
                color: '#E4E6ED',
                backgroundColor: '#C70039',
                fontWeight: 700,
                fontSize: '16px',
                padding: '12px 24px',
                transition: 'background 0.2s',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {currentView === 'add' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNavigation;