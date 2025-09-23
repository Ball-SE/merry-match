"use client";

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { ComplaintDetailProps } from '../../types/admin';

const ComplaintDetail: React.FC<ComplaintDetailProps> = ({
  complaint,
  onBack,
  onResolve,
  onCancel
}) => {
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'New': 'bg-blue-100 text-blue-700 border border-blue-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      'Resolved': 'bg-green-100 text-green-700 border border-green-200',
      'Cancel': 'bg-gray-100 text-[#646D89] border border-gray-200'
    };
    
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-[#646D89] border border-gray-200'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-[#F6F7FC]">
      {/* Header - matches ComplaintList top navigation style */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">{complaint.issue}</h2>
              {getStatusBadge(complaint.status)}
            </div>
          </div>
          
          {complaint.status === 'Pending' && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onCancel(complaint.id)}
                className="px-4 py-2 border border-gray-300 rounded-full text-[#646D89] hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel Complaint
              </button>
              <button
                onClick={() => onResolve(complaint.id)}
                className="px-4 py-2 bg-[#C70039] hover:bg-[#950028] text-white rounded-full font-medium transition-colors"
              >
                Resolve Complaint
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content - matches the dashboard layout with p-6 */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          <div>
            <h3 className="text-lg font-medium text-[#646D89] mb-2">
              Complaint by: {complaint.user}
            </h3>
          </div>
          
          <hr className="my-6 border-gray-200" />

          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-[#646D89] mb-3">Issue</h4>
              <p className="text-gray-900">{complaint.issue}</p>
            </div>

            <div>
              <h4 className="text-base font-medium text-[#646D89] mb-3">Description</h4>
              <p className="text-gray-900 leading-relaxed">{complaint.description}</p>
            </div>

            <div>
              <h4 className="text-base font-medium text-[#646D89] mb-3">Date Submitted</h4>
              <p className="text-gray-900">{complaint.dateSubmitted}</p>
            </div>

            {/* Divider between Date Submitted and Resolved/Canceled date */}
            {(complaint.status === 'Resolved' && complaint.resolvedDate) || (complaint.status === 'Cancel' && complaint.canceledDate) ? (
              <hr className="my-6 border-gray-200" />
            ) : null}

            {complaint.status === 'Resolved' && complaint.resolvedDate && (
              <div>
                <h4 className="text-base font-medium text-[#646D89] mb-3">Resolved date</h4>
                <p className="text-gray-900">{complaint.resolvedDate}</p>
              </div>
            )}

            {complaint.status === 'Cancel' && complaint.canceledDate && (
              <div>
                <h4 className="text-base font-medium text-[#646D89] mb-3">Canceled date</h4>
                <p className="text-gray-900">{complaint.canceledDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;