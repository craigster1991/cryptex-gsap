import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const LetterContext = createContext();

export const useLetters = () => {
  const context = useContext(LetterContext);
  if (!context) {
    throw new Error('useLetters must be used within a LetterProvider');
  }
  return context;
};

export const LetterProvider = ({ children }) => {
  const [selectedLetters, setSelectedLetters] = useState(['-', '-', '-']);

  const updateLetter = useCallback((index, letter) => {
    setSelectedLetters(prev => {
      const newLetters = [...prev];
      newLetters[index] = letter;
      return newLetters;
    });
  }, []);

  const value = useMemo(() => ({
    selectedLetters,
    updateLetter,
  }), [selectedLetters, updateLetter]);

  return (
    <LetterContext.Provider value={value}>
      {children}
    </LetterContext.Provider>
  );
};
