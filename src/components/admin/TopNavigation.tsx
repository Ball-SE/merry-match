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
    <div className="fixed top-0 left-0 md:left-64 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div className="px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-4">
          {(currentView === 'add' || currentView === 'edit') && (
            <button 
              onClick={() => setCurrentView('list')}
              className="flex items-center text-gray-600 hover:text-gray-800"
              aria-label="Back to list"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
            {currentView === 'add' ? 'Add Package' : 
             currentView === 'edit' ? `Edit '${editingPackage?.name}'` : 
             'Merry Package'}
          </h2>
        </div>
        {currentView === 'list' && (
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative hidden sm:block">
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
                fontSize: '14px',
                padding: '10px 20px',
                transition: 'background 0.2s',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              className="md:text-base md:px-6 md:py-3"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Package</span>
            </button>
          </div>
        )}
        {(currentView === 'add' || currentView === 'edit') && (
          <div className="flex items-center space-x-2 md:space-x-3">
            <button 
              type="button"
              onClick={() => setCurrentView('list')}
              style={{
                borderRadius: '99px',
                fontFamily: 'Nunito, sans-serif',
                color: '#C70039',
                backgroundColor: '#FFE1EA',
                fontWeight: 700,
                fontSize: '14px',
                padding: '10px 20px',
                transition: 'background 0.2s',
                border: 'none',
                cursor: 'pointer',
              }}
              className="md:text-base md:px-6 md:py-3"
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
                fontSize: '14px',
                padding: '10px 20px',
                transition: 'background 0.2s',
                border: 'none',
                cursor: 'pointer',
              }}
              className="md:text-base md:px-6 md:py-3"
            >
              {currentView === 'add' ? 'Create' : 'Save'}
            </button>
          </div>
        )}
      </div>
      {/* Mobile Search Bar */}
      {currentView === 'list' && (
        <div className="sm:hidden px-4 pb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavigation;