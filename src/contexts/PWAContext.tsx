"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PWAContextType {
  showPwaPopup: boolean;
  setShowPwaPopup: (show: boolean) => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: ReactNode }) {
  const [showPwaPopup, setShowPwaPopup] = useState(false);

  return (
    <PWAContext.Provider value={{ showPwaPopup, setShowPwaPopup }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWAPopup() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWAPopup must be used within a PWAProvider');
  }
  return context;
}
