"use client";

import React from 'react';
import { Package, AlertTriangle, LogOut } from 'lucide-react';
import { SidebarProps, SidebarItem } from '../../types/admin';
import { useAuth } from '@/hooks/useAuth';

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const sidebarItems: SidebarItem[] = [
    {
      id: 'merry-package',
      icon: <Package className="w-4 h-4 text-pink-500" />,
      label: 'Merry Package',
      color: 'text-pink-500'
    },
    {
      id: 'complaint',
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      label: 'Complaint',
      color: 'text-red-500'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col min-h-screen">
      {/* Header */}
  <div className="p-6">
        <div>
          <h1 className="text-4xl font-bold">
            Merry<span className=" text-[#C70039]">Match</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center">Admin Panel Control</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <button
          onClick={() => setActiveTab('merry-package')}
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
          onClick={() => setActiveTab('complaint')}
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
        <button onClick={() => logout('/')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <LogOut className="w-4 h-4 text-gray-500" />
          </div>
          <span className="font-medium text-sm">Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;