// components/pool/PoolPageTutorial.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button'; // Assuming you have a general Button component

interface TutorialStep {
  id: string; // ID of the element to highlight
  title: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right'; // Position of the tooltip relative to the element
}

interface PoolPageTutorialProps {
  onComplete: () => void; // Callback when the tutorial is finished or skipped
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'pool-header',
    title: 'Your Pool Overview',
    text: 'This is your current basket pool. Here you can see the shop name and the overall status of your group order.',
    position: 'bottom',
  },
  {
    id: 'pool-status-card',
    title: 'Basket Status',
    text: 'This card shows if your basket is ready to be ordered or if it\'s still waiting for others to join the pool.',
    position: 'bottom',
  },
  {
    id: 'pool-progress-bar',
    title: 'Pool Progress',
    text: 'Track how close your group is to reaching the minimum order amount for free shipping. The bar fills up as more baskets are added!',
    position: 'bottom',
  },
  {
    id: 'user-basket-details',
    title: 'Your Basket Details',
    text: 'Here you can review the total amount of your basket and access the link to your items.',
    position: 'top',
  },
  {
    id: 'edit-basket-button',
    title: 'Edit Your Basket',
    text: 'If your basket is not yet ready, you can click here to modify your order link or amount.',
    position: 'top',
  },
  {
    id: 'delete-basket-button',
    title: 'Delete Your Basket',
    text: 'If you change your mind and your basket is not yet ready, you can remove it from the pool here.',
    position: 'top',
  },
  {
    id: 'main-action-button',
    title: 'Main Action Button',
    text: 'This button changes based on the pool status. It allows you to mark your basket as ready, cancel it, or enter the group chat once the pool is filled.',
    position: 'top',
  },
];

export default function PoolPageTutorial({ onComplete }: PoolPageTutorialProps) {
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
      borderRadius: '16px', // Adjust to match your card/button border-radius
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
      <div style={highlightStyle} className="rounded-2xl border-4 border-[#FFDB0D] animate-pulse-once" />

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
