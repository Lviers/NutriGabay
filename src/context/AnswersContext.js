import React, { createContext, useState } from 'react';

export const AnswersContext = createContext();

export const AnswersProvider = ({ children }) => {
  const [answers, setAnswers] = useState({
    pork: false,
    allergic_to_milk: false,
    allergic_to_fish: false,
    allergic_to_soy: false,
    allergic_to_chicken: false,
    allergic_to_mussels: false, // New field for mussels
    allergic_to_beef: false, // New field for beef
  });

  return (
    <AnswersContext.Provider value={{ answers, setAnswers }}>
      {children}
    </AnswersContext.Provider>
  );
};
