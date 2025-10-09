"use client";

import React, { useMemo } from 'react';
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
  // Filter complaints based on search term and status - optimized with useMemo
  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const matchesSearch = searchTerm === '' || 
        complaint.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All status' || complaint.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'cancel':
        return 'bg-gray-100 text-[#646D89] border border-[#F1F2F6]';
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
    <div className="min-h-screen">
      {/* Fixed Top Navigation Bar */}
      <div className="fixed top-0 left-0 md:left-64 right-0 bg-white border-b border-gray-200 z-40 md:border-l md:border-l-gray-100">
        <div className="px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Complaint List</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-auto">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 h-12"
              />
            </div>
            
            {/* Status Filter Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-gray-700 h-12"
              >
                <option value="All status">All status</option>
                <option value="New">New</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Cancel">Cancel</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-24 md:h-20"></div>

      {/* Complaints Table */}
      <div className="p-4 md:p-6">
        <div className="rounded-lg shadow overflow-hidden bg-white w-full">
          <div className="overflow-x-auto">
            <table className="w-full bg-transparent min-w-[800px]">
              <caption className="sr-only">List of user complaints</caption>
              <thead className="bg-[#D6D9E4]">
                <tr>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">User</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">Issue</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">Description</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">Date submitted</th>
                  <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-medium text-[#424C6B] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 md:px-6 py-4 text-center text-gray-500">
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
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {truncateText(complaint.user, 20)}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {truncateText(complaint.issue, 25)}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={complaint.description}>
                          {truncateText(complaint.description, 60)}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-[#424C6B]">
                          {formatDate(complaint.dateSubmitted)}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(complaint.status)}
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

export default ComplaintList;