import React, { createContext, useContext, useState } from 'react';

const ProductTourContext = createContext({
  isTourOpen: false,
  isHelpOpen: false,
  isWhatsNewOpen: false,
  openTour: () => {},
  closeTour: () => {},
  openHelp: () => {},
  closeHelp: () => {},
  openWhatsNew: () => {},
  closeWhatsNew: () => {},
});

export function ProductTourProvider({ children }) {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);

  return (
    <ProductTourContext.Provider
      value={{
        isTourOpen,
        isHelpOpen,
        isWhatsNewOpen,
        openTour: () => setIsTourOpen(true),
        closeTour: () => setIsTourOpen(false),
        openHelp: () => setIsHelpOpen(true),
        closeHelp: () => setIsHelpOpen(false),
        openWhatsNew: () => setIsWhatsNewOpen(true),
        closeWhatsNew: () => setIsWhatsNewOpen(false),
      }}
    >
      {children}
    </ProductTourContext.Provider>
  );
}

export function useProductTour() {
  return useContext(ProductTourContext);
}
