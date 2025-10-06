import { useState } from 'react';

export function useInterestsManagement(initialInterests: string[] = []) {
  const [chipInput, setChipInput] = useState<string>("");

  const addChip = (interests: string[], handleInputChange: (field: string, value: string | string[]) => void) => {
    const trimmed = chipInput.trim();
    if (!trimmed) return;
    if (interests.length >= 10) return;
    if (interests.includes(trimmed)) return;
    
    const newInterests = [...interests, trimmed];
    handleInputChange('interests', newInterests);
    setChipInput("");
  };

  return {
    chipInput,
    setChipInput,
    addChip
  };
}
