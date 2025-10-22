"use client";

import React, { useState } from 'react';
import { Package, AlertTriangle, LogOut, Menu, X } from 'lucide-react';
import { SidebarProps } from '../../types/admin';
import { useAuth } from '@/hooks/useAuth';

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6">
        <h1 className="text-4xl font-bold text-center">
          Merry<span className="text-[#C70039]">Match</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1 text-center">Admin Panel Control</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <button
          onClick={() => {
            setActiveTab('merry-package');
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === 'merry-package'
              ? 'bg-pink-50 text-pink-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-pink-500" />
          </div>
          <span className="font-extrabold text-sm">Merry Package</span>
        </button>
        
        <button
          onClick={() => {
            setActiveTab('complaint');
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === 'complaint'
              ? 'bg-red-50 text-red-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <span className="font-extrabold text-sm">Complaint</span>
        </button>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={() => {
            logout('/');
            setIsMobileMenuOpen(false);
          }} 
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <LogOut className="w-4 h-4 text-gray-500" />
          </div>
          <span className="font-medium text-sm">Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar - Added border-r */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col min-h-screen">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col z-50">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;