"use client";

import React, { useState } from "react";
import { DatabaseService } from "@/services/database";
import { useProfile } from "../../hooks/useProfile";
import { CheckCircle, X } from "lucide-react";

const ComplaintForm: React.FC = () => {
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { profile } = useProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!profile?.id) {
        alert("❌ You must be logged in to submit a complaint");
        setLoading(false);
        return;
      }

      // Get user name from profile (use full_name or email as fallback)
      const userName = profile?.full_name || profile?.name || profile?.email || "Unknown User";

      await DatabaseService.submitComplaint(profile.id, userName, issue, description);

      setShowSuccessModal(true);
      setIssue("");
      setDescription("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("❌ Error submitting complaint: " + error.message);
      } else {
        alert("❌ Unknown error submitting complaint");
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 w-full max-w-md"
      >
        <div className="flex flex-col">
          <label className="font-medium text-sm text-gray-700 mb-2">Issue</label>
          <input
            type="text"
            placeholder="Enter your issue"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            required
            className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A62D82]"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-sm text-gray-700 mb-2">
            Description
          </label>
          <textarea
            placeholder="Describe your issue in detail"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="border border-gray-300 rounded-md px-4 py-3 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-[#A62D82]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-[#C70039] hover:bg-[#950028] text-white rounded-full py-3 px-6 mt-4 transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 rounded-full p-3 mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Complaint Submitted Successfully!
              </h3>
              
              <p className="text-gray-600 mb-6">
                Your complaint has been received. Our team will review it and get back to you soon.
              </p>
              
              <button
                onClick={closeModal}
                className="bg-[#C70039] hover:bg-[#950028] text-white rounded-full py-2 px-8 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default ComplaintForm;