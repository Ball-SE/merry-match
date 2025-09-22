"use client";

import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { ComplaintListProps } from '../../types/admin';

const ComplaintList: React.FC<ComplaintListProps> = ({
  complaints,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange
}) => {
  // Filter complaints based on search term and status
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All status' || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'New': 'bg-blue-100 text-blue-700',
      'Pending': 'bg-yellow-100 text-ye[#424C6B]',
      'Resolved': 'bg-green-100 text-g[#424C6B]',
      'Cancel': 'bg-gray-100 text-[#424C6B]'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-[#424C6B]'}`}>
        {status}
      </span>
    );
  };

  return (
 <div className="space-y-0">
      {/* Header with Search and Filter */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Complaint List</h2>
          <div className="flex items-center space-x-4">
            {/* Search Input */}
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
            
            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700"
              >
                <option value="All status">All status</option>
                <option value="New">New</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Cancel">Cancel</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden max-w-5xl mx-auto mt-8">
        <table className="w-full">
          <thead className="bg-[#D6D9E4]">
            <tr>
              <th className="px-4 py-3 text-left text-[15px] font-semibold text-[#424C6B]">User</th>
              <th className="px-4 py-3 text-left text-[15px] font-semibold text-[#424C6B]">Issue</th>
              <th className="px-4 py-3 text-left text-[15px] font-semibold text-[#424C6B]">Description</th>
              <th className="px-4 py-3 text-left text-[15px] font-semibold text-[#424C6B]">Date Submitted</th>
              <th className="px-4 py-3 text-left text-[15px] font-semibold text-[#424C6B]">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredComplaints.map((complaint) => (
              <tr key={complaint.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-[15px] font-normal text-gray-900">{complaint.user}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-[15px] text-gray-900">{complaint.issue}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[15px] text-gray-900 max-w-xs truncate" title={complaint.description}>
                    {complaint.description}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-[15px] text-gray-500">{complaint.dateSubmitted}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(complaint.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No complaints found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintList;