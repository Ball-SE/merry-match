"use client";

import React from 'react';
import { Trash2, Edit, GripVertical } from 'lucide-react';
import { PackageListProps } from '../../types/admin';

const PackageList: React.FC<PackageListProps> = ({ 
  packages, 
  handleDeletePackage, 
  handleEditPackage, 
  moveRow,
  searchTerm
}) => {
  // Filter packages based on search term
  const filteredPackages = packages.filter(pkg => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      pkg.name.toLowerCase().includes(searchLower) ||
      pkg.merryLimit.toLowerCase().includes(searchLower) ||
      pkg.details.some(detail => detail.toLowerCase().includes(searchLower)) ||
      pkg.id.toString().includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#D6D9E4]">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider w-20">
              
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
              Icon
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
              Package name
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
              Merry limit
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
              Created date
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
              Updated date
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredPackages.map((pkg, index) => (
            <tr 
              key={pkg.id} 
              className="hover:bg-gray-50 cursor-move group"
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const hoverIndex = index;
                
                // Find the actual index in the original packages array
                const draggedPackage = filteredPackages[dragIndex];
                const hoveredPackage = filteredPackages[hoverIndex];
                const originalDragIndex = packages.findIndex(p => p.id === draggedPackage.id);
                const originalHoverIndex = packages.findIndex(p => p.id === hoveredPackage.id);
                
                if (originalDragIndex !== originalHoverIndex) {
                  moveRow(originalDragIndex, originalHoverIndex);
                }
              }}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                  <span className="text-sm font-medium text-gray-900">
                    {pkg.id}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-2xl">{pkg.icon}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{pkg.merryLimit}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[#424C6B]">{pkg.createdDate}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[#424C6B]">{pkg.updatedDate}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="text-pink-500 hover:text-pink-700 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEditPackage(pkg)}
                    className="text-pink-500 hover:text-pink-700 p-1" 
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#424C6B]">
            {searchTerm ? `No packages found matching "${searchTerm}"` : 'No packages available.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PackageList;