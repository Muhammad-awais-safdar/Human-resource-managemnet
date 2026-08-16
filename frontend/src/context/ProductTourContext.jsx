'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TOUR_REGISTRY } from '../components/tour/TourRegistry';

const ProductTourContext = createContext({
  activeTour: null,
  currentStepIndex: 0,
  isTourOpen: false,
  completedTours: [],
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTour: () => {},
  restartTour: () => {},
});

export function ProductTourProvider({ children, userRole }) {
  const [activeTour, setActiveTour] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [completedTours, setCompletedTours] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('completed_tours');
      if (saved) {
        setCompletedTours(JSON.parse(saved));
      }
    } catch (ignored) {}
  }, []);

  const saveCompletedTour = (tourId) => {
    if (!completedTours.includes(tourId)) {
      const updated = [...completedTours, tourId];
      setCompletedTours(updated);
      try {
        localStorage.setItem('completed_tours', JSON.stringify(updated));
      } catch (ignored) {}
    }
  };

  const startTour = (tourId, force = false) => {
    const tour = TOUR_REGISTRY[tourId];
    if (!tour) return;
    if (!force && completedTours.includes(tourId)) return;

    // Filter steps based on role permissions if defined
    const filteredSteps = tour.steps.filter((step) => {
      if (!step.roleRequired) return true;
      return step.roleRequired === userRole;
    });

    if (filteredSteps.length === 0) return;

    setActiveTour({ ...tour, steps: filteredSteps });
    setCurrentStepIndex(0);
    setIsTourOpen(true);
  };

  const nextStep = () => {
    if (!activeTour) return;
    if (currentStepIndex < activeTour.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      finishTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const skipTour = () => {
    if (activeTour) {
      saveCompletedTour(activeTour.id);
    }
    setIsTourOpen(false);
    setActiveTour(null);
  };

  const finishTour = () => {
    if (activeTour) {
      saveCompletedTour(activeTour.id);
    }
    setIsTourOpen(false);
    setActiveTour(null);
  };

  const restartTour = (tourId) => {
    startTour(tourId, true);
  };

  return (
    <ProductTourContext.Provider
      value={{
        activeTour,
        currentStepIndex,
        isTourOpen,
        completedTours,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        restartTour,
      }}
    >
      {children}
    </ProductTourContext.Provider>
  );
}

export function useProductTour() {
  return useContext(ProductTourContext);
}
