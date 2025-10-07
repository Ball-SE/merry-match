import React, { useState } from "react";

const ComplaintForm: React.FC = () => {
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      issue,
      description,
    });
    alert("Complaint submitted (demo only)");
    setIssue("");
    setDescription("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 w-full max-w-md"
    >
      <div className="flex flex-col">
        <label className="font-medium text-sm text-gray-700 mb-1">Issue</label>
        <input
          type="text"
          placeholder="Place Holder"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          required
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A62D82]"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium text-sm text-gray-700 mb-1">
          Description
        </label>
        <textarea
          placeholder="Place Holder"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="border border-gray-300 rounded-md px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#A62D82]"
        />
      </div>

      <button
        type="submit"
        className="bg-[#C70039] hover:bg-[#950028] text-white rounded-full py-2 px-6 mt-2 transition-colors"
      >
        Submit
      </button>
    </form>
  );
};

export default ComplaintForm;
