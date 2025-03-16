import React, { createContext, useState, useContext } from 'react';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Global refresh counter

  const triggerBalanceRefresh = () => {
    setRefreshTrigger(prev => prev + 1); // Increment to force refresh
  };

  return (
    <BalanceContext.Provider value={{ refreshTrigger, triggerBalanceRefresh }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);
