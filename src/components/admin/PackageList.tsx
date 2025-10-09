"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Trash2, Edit, GripVertical } from 'lucide-react';
import { PackageListProps } from '../../types/admin';

const PackageList: React.FC<PackageListProps> = ({ 
  packages, 
  handleDeletePackage, 
  handleEditPackage, 
  moveRow,
  searchTerm
}) => {
  // Format date to match complaint list format
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  // Format price in baht (no conversion needed)
  const formatPrice = (price: number) => {
    return `฿${price.toFixed(2)}`;
  };

  // Filter packages based on search term - optimized with useMemo
  const filteredPackages = useMemo(() => {
    if (!searchTerm) return packages;
    
    const searchLower = searchTerm.toLowerCase();
    return packages.filter(pkg => 
      pkg.name.toLowerCase().includes(searchLower) ||
      pkg.dailySwipeLimit.toString().includes(searchLower) ||
      pkg.details.some(detail => detail.toLowerCase().includes(searchLower)) ||
      pkg.id.toString().includes(searchLower)
    );
  }, [packages, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F6F7FC]">
      {/* Spacer for fixed TopNavigation navbar */}
      <div className="h-20 md:h-20"></div>

      {/* Table Content */}
      <div className="p-4 md:p-6 pb-6">
        <div className="rounded-lg shadow overflow-hidden bg-white w-full">
          {/* Responsive table wrapper */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white min-w-[1000px]">
              <caption className="sr-only">List of Merry Packages</caption>
              <thead className="bg-[#D6D9E4]">
                <tr>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider w-20">ID</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider w-24">Icon</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">Package name</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">Merry Limit</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">Price</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">Created date</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">Updated date</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 md:px-6 py-8 text-center text-gray-500">
                      {searchTerm ? `No packages found matching "${searchTerm}"` : 'No packages available.'}
                    </td>
                  </tr>
                ) : (
                  filteredPackages.map((pkg, index) => (
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
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                          <span className="text-sm font-medium text-gray-900">
                            {pkg.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <div className="w-12 h-12 relative rounded-lg bg-pink-50 p-1 overflow-hidden">
                            <Image 
                              src={pkg.icon} 
                              alt={pkg.name}
                              width={48}
                              height={48}
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pkg.dailySwipeLimit}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{formatPrice(pkg.price)}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-[#424C6B]">{formatDate(pkg.createdDate)}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-[#424C6B]">{formatDate(pkg.updatedDate)}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="text-pink-500 hover:text-pink-700 p-1"
                            title="Delete"
                            aria-label={`Delete ${pkg.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditPackage(pkg)}
                            className="text-pink-500 hover:text-pink-700 p-1" 
                            title="Edit"
                            aria-label={`Edit ${pkg.name}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageList;