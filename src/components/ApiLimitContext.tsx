import React, { createContext, ReactNode, useContext, useState } from 'react';
import ApiLimitDialog from './ApiLimitDialog';

interface ApiLimitContextType {
  showApiLimit: (message?: string) => void;
}

const ApiLimitContext = createContext<ApiLimitContextType | undefined>(undefined);

export const useApiLimit = (): ApiLimitContextType => {
  const context = useContext(ApiLimitContext);
  if (!context) {
    throw new Error('useApiLimit must be used within an ApiLimitProvider');
  }
  return context;
};

export const ApiLimitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showApiLimit = (msg = 'Too many requests to the stock API. Please try again later.') => {
    setMessage(msg);
    setOpen(true);
  };

  return (
    <ApiLimitContext.Provider value={{ showApiLimit }}>
      {children}
      <ApiLimitDialog open={open} onClose={() => setOpen(false)} message={message} />
    </ApiLimitContext.Provider>
  );
};
