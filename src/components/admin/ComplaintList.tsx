"use client";

import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { ComplaintListProps } from '../../types/admin';

interface ComplaintListPropsWithClick extends ComplaintListProps {
  onComplaintClick: (complaint: any) => void;
}

const ComplaintList: React.FC<ComplaintListPropsWithClick> = ({
  complaints,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onComplaintClick
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
      'New': 'bg-blue-100 text-blue-700 border border-blue-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      'Resolved': 'bg-green-100 text-green-700 border border-green-200',
      'Cancel': 'bg-gray-100 text-gray-700 border border-gray-200'
    };
    
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-[#424C6B] border border-gray-200'}`}>
        {status}
      </span>
    );
  };

  return (
  <div className="space-y-0 bg-[#F6F7FC] min-h-screen">
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg "
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
              <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
                Issue
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
                Date Submitted
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#424C6B] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredComplaints.map((complaint) => (
              <tr 
                key={complaint.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onComplaintClick(complaint)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{complaint.user}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{complaint.issue}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={complaint.description}>
                    {complaint.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{complaint.dateSubmitted}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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