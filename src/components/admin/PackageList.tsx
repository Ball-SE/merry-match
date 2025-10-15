"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Trash2, Edit, GripVertical, ChevronLeft, ChevronRight, ChevronDown} from 'lucide-react';
import { PackageListProps } from '../../types/admin';



const PackageList: React.FC<PackageListProps> = ({ 
  packages, 
  handleDeletePackage, 
  handleEditPackage, 
  moveRow,
  searchTerm
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Calculate pagination values
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPackages = filteredPackages.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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
                {paginatedPackages.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 md:px-6 py-8 text-center text-gray-500">
                      {searchTerm ? `No packages found matching "${searchTerm}"` : 'No packages available.'}
                    </td>
                  </tr>
                ) : (
                  paginatedPackages.map((pkg, index) => {
                    const actualIndex = startIndex + index;
                    return (
                      <tr 
                        key={pkg.id} 
                        className="hover:bg-gray-50 cursor-move group"
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', actualIndex.toString());
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                          const hoverIndex = actualIndex;
                          
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredPackages.length > 0 && (
            <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                 <span className="text-sm text-gray-700">Show</span>

                  {/* Dropdown with repositioned arrow */}
                  <div className="relative inline-block">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="appearance-none border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white pr-8"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>

                    {/* Custom arrow overlay */}
                    <ChevronDown
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={16}
                    />
                  </div>

                <span className="text-sm text-gray-700">
                  entries (Showing {startIndex + 1}-{Math.min(endIndex, filteredPackages.length)} of {filteredPackages.length})
                </span>
              </div>

              {/* Page navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    page === 'ellipsis' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-gray-300 text-black'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageList;