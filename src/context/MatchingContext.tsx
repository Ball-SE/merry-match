import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MatchingFilters {
  selectedGenders: string[];
  ageRange: number[];
}

interface MatchingContextType {
  filters: MatchingFilters;
  searchTrigger: number; // เพิ่ม trigger สำหรับการค้นหา
  matchRefreshTrigger: number;
  updateFilters: (newFilters: Partial<MatchingFilters>) => void;
  applyFilters: () => void;
  refreshMatches: () => void;
}

const MatchingContext = createContext<MatchingContextType | undefined>(undefined);

export const useMatchingContext = () => {
  const context = useContext(MatchingContext);
  if (!context) {
    throw new Error('useMatchingContext must be used within a MatchingProvider');
  }
  return context;
};

interface MatchingProviderProps {
  children: ReactNode;
}

export const MatchingProvider: React.FC<MatchingProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<MatchingFilters>({
    selectedGenders: ['default'], // เพิ่ม default เป็นค่าเริ่มต้น
    ageRange: [18, 50]
  });
  
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [matchRefreshTrigger, setMatchRefreshTrigger] = useState(0);

  const updateFilters = (newFilters: Partial<MatchingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const applyFilters = () => {
    // เพิ่ม trigger เพื่อบังคับให้ fetch ใหม่
    setSearchTrigger(prev => prev + 1);
    console.log('Applying filters:', filters);
  };

  const refreshMatches = () => {
    setMatchRefreshTrigger(prev => prev + 1);
  };

  return (
    <MatchingContext.Provider value={{ 
      filters, 
      searchTrigger,
      matchRefreshTrigger, 
      updateFilters, 
      applyFilters,
      refreshMatches
      }}>
      {children}
    </MatchingContext.Provider>
  );
};