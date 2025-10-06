import React from 'react';

interface InterestsInputProps {
  interests: string[];
  chipInput: string;
  setChipInput: (value: string) => void;
  addChip: () => void;
  handleInputChange: (field: string, value: string | string[]) => void;
  validationErrors: Record<string, string>;
  fieldErrors: Record<string, string>;
}

export default function InterestsInput({
  interests,
  chipInput,
  setChipInput,
  addChip,
  handleInputChange,
  validationErrors,
  fieldErrors
}: InterestsInputProps) {
  return (
    <div className="mt-6 md:mt-8">
      <label className="block text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">
        Hobbies and Interests (Choose up to 10)
      </label>
      
      <div className="flex gap-2 items-center">
        <div className="flex-1 min-h-[48px] border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-[#A62D82] focus-within:border-transparent">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto" style={{ gap: '8px' }}>
            {interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-[#7D2262] whitespace-nowrap flex-shrink-0"
                style={{ backgroundColor: '#F4EBF2' }}
              >
                {interest}
                <button
                  type="button"
                  onClick={() => {
                    const newInterests = interests.filter((_, i) => i !== index);
                    handleInputChange('interests', newInterests);
                  }}
                  className="text-[#7D2262] hover:text-red-500 text-lg font-bold leading-none"
                >
                  ×
                </button>
              </span>
            ))}
            
            <input
              type="text"
              value={chipInput}
              onChange={(e) => setChipInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChip();
                }
              }}
              placeholder={interests.length === 0 ? "Type and press Enter to add" : ""}
              disabled={interests.length >= 10}
              className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm md:text-base disabled:bg-transparent"
            />
          </div>
        </div>
        
        <button
          type="button"
          onClick={addChip}
          disabled={interests.length >= 10 || !chipInput.trim()}
          className="bg-[#C70039] text-white disabled:opacity-50 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#950028] transition-colors flex-shrink-0"
        >
          Add
        </button>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs md:text-sm text-gray-500">
          {interests.length}/10 interests
        </p>
        {interests.length >= 10 && (
          <p className="text-sm text-yellow-600">
            Maximum 10 interests reached
          </p>
        )}
        {(validationErrors.interests || fieldErrors.interests) && (
          <p className="text-xs md:text-sm text-red-600">
            {validationErrors.interests || fieldErrors.interests}
          </p>
        )}
      </div>
    </div>
  );
}
