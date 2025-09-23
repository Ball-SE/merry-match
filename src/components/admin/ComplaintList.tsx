"use client";

import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { ComplaintListProps } from '../../types/admin';

const ComplaintList: React.FC<ComplaintListProps> = ({
  complaints,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onComplaintClick
}) => {
  // Filter complaints based on search term and status
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = searchTerm === '' || 
      complaint.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All status' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'cancel':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  // Format date
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

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-[#F6F7FC]">
      {/* Top Navigation Bar - matches the style shown in PackageList */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Complaint List</h1>
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

      {/* Complaints Table - with proper spacing */}
      <div className="p-6">
        <div className="rounded-lg shadow overflow-hidden bg-white w-full">
          <table className="w-full bg-transparent">
            <thead className="bg-[#D6D9E4]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">Issue</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">Date submitted</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {complaints.length === 0 ? 'No complaints found.' : 'No complaints match your search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr 
                    key={complaint.id} 
                    onClick={() => onComplaintClick?.(complaint)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {truncateText(complaint.user, 20)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {truncateText(complaint.issue, 25)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={complaint.description}>
                        {truncateText(complaint.description, 60)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#424C6B]">
                        {formatDate(complaint.dateSubmitted)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(complaint.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Results Summary */}
          {filteredComplaints.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Showing {filteredComplaints.length} of {complaints.length} complaints
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintList;