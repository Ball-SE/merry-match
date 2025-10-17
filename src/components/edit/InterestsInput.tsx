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
        Hobbies / Interests (Maximum 10)
      </label>

      <div className="flex flex-wrap gap-2 mb-3">
        {(interests || []).map((chip, i) => (
          <span
            key={`${chip}-${i}`}
            className="flex items-center gap-2 rounded-sm bg-[#F4EBF2] px-3 py-1 text-md font-bold text-[#7D2262]"
          >
            {chip}
            <button
              type="button"
              onClick={() => {
                const newInterests = interests.filter((_, idx) => idx !== i);
                handleInputChange('interests', newInterests);
              }}
              className="rounded-full bg-[#F4EBF2] px-0 text-[#7D2262] text-xl font-bold hover:bg-[#950028]"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
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
          placeholder="Type and press Enter to add"
          disabled={(interests || []).length >= 10}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#A62D82] disabled:bg-gray-100"
        />
        <button
          type="button"
          onClick={addChip}
          disabled={(interests || []).length >= 10 || !chipInput.trim()}
          className="button-primary bg-[#C70039] text-white disabled:opacity-50 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#950028] transition-colors"
        >
          Add
        </button>
      </div>

      {(interests || []).length >= 10 && (
        <p className="mt-1 text-sm text-yellow-600">
          Maximum 10 interests reached
        </p>
      )}

      {(validationErrors.interests || fieldErrors.interests) && (
        <p className="mt-1 text-sm text-[#C70039]">
          {validationErrors.interests || fieldErrors.interests}
        </p>
      )}
    </div>
  );
}
