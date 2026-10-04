'use client';

import React, { useEffect, useState } from 'react';
import { useProductTour } from '../../context/ProductTourContext';
import { Button } from '../primitives/Button';

export function ProductTourModal() {
  const { activeTour, currentStepIndex, isTourOpen, nextStep, prevStep, skipTour } = useProductTour();
  const [targetRect, setTargetRect] = useState(null);

  const currentStep = activeTour?.steps[currentStepIndex];

  useEffect(() => {
    if (!isTourOpen || !currentStep) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const el = document.querySelector(currentStep.target);
      if (el) {
        document.querySelectorAll('.tour-target-highlight').forEach((item) => {
          item.classList.remove('tour-target-highlight');
        });
        el.classList.add('tour-target-highlight');
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') skipTour();
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('keydown', handleKeyDown);
      document.querySelectorAll('.tour-target-highlight').forEach((item) => {
        item.classList.remove('tour-target-highlight');
      });
    };
  }, [isTourOpen, currentStepIndex, currentStep, skipTour, nextStep, prevStep]);

  if (!isTourOpen || !activeTour || !currentStep) return null;

  const totalSteps = activeTour.steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;

  let modalStyle = { position: 'fixed', zIndex: 10002 };
  if (targetRect) {
    if (currentStep.placement === 'bottom') {
      modalStyle.top = `${targetRect.bottom + 12}px`;
      modalStyle.left = `${Math.max(16, targetRect.left)}px`;
    } else if (currentStep.placement === 'top') {
      modalStyle.bottom = `${window.innerHeight - targetRect.top + 12}px`;
      modalStyle.left = `${Math.max(16, targetRect.left)}px`;
    } else if (currentStep.placement === 'right') {
      modalStyle.top = `${Math.max(16, targetRect.top)}px`;
      modalStyle.left = `${targetRect.right + 16}px`;
    } else {
      modalStyle.top = '50%';
      modalStyle.left = '50%';
      modalStyle.transform = 'translate(-50%, -50%)';
    }
  } else {
    modalStyle.top = '50%';
    modalStyle.left = '50%';
    modalStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/30 animate-fade-in">
      <div
        style={modalStyle}
        className="w-[360px] max-w-[90vw] bg-white border border-slate-200 rounded-xl p-5 shadow-xl animate-fade-in text-slate-900"
        role="dialog"
        aria-modal="true"
        data-tour="tour-modal"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={skipTour}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            Skip Tour
          </button>
        </div>

        <h4 className="text-base font-semibold text-slate-900 mb-1.5">{currentStep.title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed mb-5">{currentStep.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            isDisabled={currentStepIndex === 0}
          >
            Back
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentStepIndex ? 'w-4 bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <Button variant="primary" size="sm" onClick={nextStep}>
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
