// components/shops/ShopBasketTutorial.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button'; // Assuming you have a general Button component

interface TutorialStep {
  id: string; // ID of the element to highlight
  title: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right'; // Position of the tooltip relative to the element
}

interface ShopBasketTutorialProps {
  onComplete: () => void; // Callback when the tutorial is finished or skipped
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'basket-instructions-info', // NEW STEP ID
    title: 'Order Details Guidance',
    text: 'Here you\'ll find important tips on how to provide your order details, whether you use a link, a note, or both.',
    position: 'bottom', // Position the tooltip below the instructions box
  },
  {
    id: 'basket-link-input',
    title: 'Basket Link (URL)',
    text: 'Enter the direct link to your shopping basket or specific items from the shop here. This helps your group members see what you\'re ordering.',
    position: 'bottom',
  },
  {
    id: 'basket-note-input', // NEW: Added ID for the note input
    title: 'Order Note',
    text: 'If you don\'t have a direct link, or want to add more details, write your shopping list or any specific instructions here.',
    position: 'bottom',
  },
  {
    id: 'basket-amount-input',
    title: 'Total Amount (CHF)',
    text: 'Input the total amount of your basket in CHF. This is your contribution to the group order.',
    position: 'bottom',
  },
  {
    id: 'order-summary-section',
    title: 'Order Summary',
    text: 'This section provides a quick overview of your basket details, including the total amount you entered.',
    position: 'top',
  },
  {
    id: 'submit-basket-button',
    title: 'Create/Update Basket',
    text: 'Once you\'ve entered all details, click this button to create your basket or save changes. You\'ll then be redirected to the pool!',
    position: 'top',
  },
];

export default function ShopBasketTutorial({ onComplete }: ShopBasketTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updateHighlightAndTooltip = useCallback(() => {
    const currentStep = tutorialSteps[currentStepIndex];
    if (!currentStep) {
      onComplete();
      return;
    }

    const targetElement = document.getElementById(currentStep.id);

    // If the target element doesn't exist, skip this step and move to the next.
    if (!targetElement) {
      console.warn(`Tutorial: Element with ID "${currentStep.id}" not found. Skipping step.`);
      setCurrentStepIndex(prev => prev + 1);
      return;
    } else {
      console.log(`Tutorial: Found element with ID "${currentStep.id}". Highlighting.`);
    }

    // Reset z-index for all elements that were previously highlighted
    document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
      (el as HTMLElement).style.zIndex = '';
      el.removeAttribute('data-tutorial-highlighted');
    });

    // Apply highlight to the current target element
    targetElement.style.zIndex = '1001'; // Make it appear above the overlay
    targetElement.setAttribute('data-tutorial-highlighted', 'true'); // Mark it

    // Calculate highlight style (a glow/border around the element)
    const rect = targetElement.getBoundingClientRect();
    setHighlightStyle({
      position: 'absolute',
      top: rect.top + window.scrollY - 5, // Padding for the glow
      left: rect.left + window.scrollX - 5,
      width: rect.width + 10,
      height: rect.height + 10,
      borderRadius: '8px', // Adjust to match your input/div border-radius
      boxShadow: '0 0 0 4px rgba(255, 219, 13, 0.7)', // Bright yellow glow
      zIndex: 1000, // Below tooltip, above overlay
      transition: 'all 0.3s ease-in-out',
      pointerEvents: 'none', // Allow clicks to pass through to the actual element if needed
    });

    // Calculate tooltip position
    let top = 0;
    let left = 0;
    const tooltipWidth = tooltipRef.current?.offsetWidth || 280; // Estimate width
    const tooltipHeight = tooltipRef.current?.offsetHeight || 120; // Estimate height

    switch (currentStep.position) {
      case 'top':
        top = rect.top - tooltipHeight - 20; // 20px buffer
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - 20;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + 20;
        break;
    }

    // Adjust for viewport boundaries
    top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));

    setTooltipStyle({
      position: 'absolute',
      top: top + window.scrollY,
      left: left + window.scrollX,
      zIndex: 1002, // Above highlight and overlay
    });

    // Scroll to the element if it's not fully in view
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

  }, [currentStepIndex, onComplete]);

  useEffect(() => {
    updateHighlightAndTooltip();

    // Recalculate on window resize or scroll
    window.addEventListener('resize', updateHighlightAndTooltip);
    window.addEventListener('scroll', updateHighlightAndTooltip);

    return () => {
      window.removeEventListener('resize', updateHighlightAndTooltip);
      window.removeEventListener('scroll', updateHighlightAndTooltip);
      // Clean up z-index on unmount
      document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
        (el as HTMLElement).style.zIndex = '';
        el.removeAttribute('data-tutorial-highlighted');
      });
    };
  }, [currentStepIndex, updateHighlightAndTooltip]);

  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete(); // End tutorial
    }
  };

  const handleSkip = () => {
    onComplete(); // End tutorial
  };

  const currentStep = tutorialSteps[currentStepIndex];
  if (!currentStep) return null; // Should not happen if onComplete is called correctly

  return (
    <>
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-70 z-[999]" />

      {/* Highlight Circle/Glow */}
      <div style={highlightStyle} className="rounded-lg border-4 border-[#FFDB0D] animate-pulse-once" />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="bg-white rounded-lg shadow-lg p-4 max-w-xs text-sm text-gray-800"
      >
        <h3 className="font-bold text-lg mb-2 text-shelivery-primary-blue">{currentStep.title}</h3>
        <p className="mb-4">{currentStep.text}</p>
        <div className="flex justify-between items-center">
          <Button onClick={handleSkip} variant="secondary" className="px-3 py-1 text-xs">
            Skip
          </Button>
          <Button onClick={handleNext} className="px-3 py-1 text-xs">
            {currentStepIndex === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </>
  );
}
