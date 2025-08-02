// components/dashboard/DashboardTutorial.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui'; // Assuming you have a general Button component

interface TutorialStep {
  id: string; // ID of the element to highlight
  title: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right'; // Position of the tooltip relative to the element
}

interface DashboardTutorialProps {
  onComplete: () => void; // Callback when the tutorial is finished or skipped
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard-header',
    title: 'Welcome to Shelivery!',
    text: 'This is your dashboard, where you can manage all your group shopping activities.',
    position: 'bottom',
  },
  {
    id: 'profile-card',
    title: 'Your Profile',
    text: 'Here you can see your profile information. Click on it to edit your details. Also you can activate push notifications here. ',
    position: 'bottom',
  },
  {
    id: 'add-basket-button',
    title: 'Create a New Basket',
    text: 'Click here to start a new group order and add what you want to order online!',
    position: 'right',
  },
  {
    id: 'active-baskets-list', // This ID will only exist if there are active baskets
    title: 'Your Active Baskets',
    text: 'These are your ongoing group orders. Click on any basket to view its details or chat with your group.',
    position: 'top',
  },
  {
    id: 'dashboard-banner',
    title: 'Promotions & Updates',
    text: 'Keep an eye on this section for exciting promotions and important app updates.',
    position: 'top',
  },
  {
    id: 'old-orders-section', // This ID will only exist if there are resolved baskets
    title: 'Order Archive',
    text: 'Your completed orders are stored here. You can review past deliveries and chats.',
    position: 'top',
  },
  {
    id: 'invite-friends-button',
    title: 'Invite Friends',
    text: 'Shelivery is more fun with friends! Invite your dormmates to join your groups.',
    position: 'left',
  },
];

export default function DashboardTutorial({ onComplete }: DashboardTutorialProps) {
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

    // If the target element doesn't exist (e.g., no active baskets for 'active-baskets-list'),
    // skip this step and move to the next.
    if (!targetElement) {
      setCurrentStepIndex(prev => prev + 1);
      return;
    }

    const rect = targetElement.getBoundingClientRect();

    // Reset z-index for all elements that were previously highlighted
    // This is a simple approach; for more complex scenarios, you might track them
    document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
      (el as HTMLElement).style.zIndex = '';
      el.removeAttribute('data-tutorial-highlighted');
    });

    // Apply highlight to the current target element
    targetElement.style.zIndex = '1001'; // Make it appear above the overlay
    targetElement.setAttribute('data-tutorial-highlighted', 'true'); // Mark it

    // Calculate highlight style (a glow/border around the element)
    setHighlightStyle({
      position: 'absolute',
      top: rect.top + window.scrollY - 5, // Padding for the glow
      left: rect.left + window.scrollX - 5,
      width: rect.width + 10,
      height: rect.height + 10,
      borderRadius: '16px', // Match your card/button border-radius
      boxShadow: '0 0 0 4px rgba(255, 219, 13, 0.7)', // Bright yellow glow
      zIndex: 1000, // Below tooltip, above overlay
      transition: 'all 0.3s ease-in-out',
      pointerEvents: 'none', // Allow clicks to pass through to the actual element if needed
    });

    // Calculate tooltip position
    let top = 0;
    let left = 0;
    const tooltipWidth = tooltipRef.current?.offsetWidth || 250; // Estimate width
    const tooltipHeight = tooltipRef.current?.offsetHeight || 100; // Estimate height

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
