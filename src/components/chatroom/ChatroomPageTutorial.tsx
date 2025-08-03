// components/chatroom/ChatroomPageTutorial.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface TutorialStep {
  id: string; // ID of the element to highlight
  title: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right'; // Position of the tooltip relative to the element
  view: 'chat' | 'orderDetails'; // Which view this step belongs to
  action?: 'clickMenuButton'; // Optional action to perform
}

interface ChatroomPageTutorialProps {
  onComplete: () => void; // Callback when the tutorial is finished or skipped
  currentView: 'chat' | 'orderDetails'; // Current view of the ChatroomPage
  setCurrentView: (view: 'chat' | 'orderDetails') => void; // Function to change the view
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'chat-menu-button',
    title: 'Group Info & Actions',
    text: 'Click this button to view detailed information about your group, including members, orders, and group actions.',
    position: 'left',
    view: 'chat',
    action: 'clickMenuButton', // Custom action for this step
  },
  {
    id: 'order-details-admin-section',
    title: 'Group Admin',
    text: 'This section shows who the current group administrator is. The admin can manage group settings and actions.',
    position: 'bottom',
    view: 'orderDetails',
  },
  {
    id: 'change-admin-button',
    title: 'Change Admin',
    text: 'If you are the current admin, you can transfer admin rights to another member here.',
    position: 'top',
    view: 'orderDetails',
  },
  {
    id: 'order-details-members-list',
    title: 'Group Members & Orders',
    text: 'See all members in this chatroom and their individual basket details. You can also manage members here if you are the admin.',
    position: 'top',
    view: 'orderDetails',
  },
  {
    id: 'order-details-ready-status', // Assuming an ID for the "Ready to Order" status or similar text
    title: 'Ready to Order Status',
    text: 'Each member\'s "Ready to Order" status is shown here. Once everyone is ready and the minimum amount is met, the order can be placed.',
    position: 'bottom',
    view: 'orderDetails',
  },
  {
    id: 'mark-as-ordered-button',
    title: 'Order Placed',
    text: 'Once the group has decided, the admin can mark the order as placed. This will move the chatroom to the next stage.',
    position: 'top',
    view: 'orderDetails',
  },
  {
    id: 'mark-as-delivered-button',
    title: 'Order Delivered',
    text: 'After the order has been delivered, the admin can mark it as delivered here, resolving the chatroom.',
    position: 'top',
    view: 'orderDetails',
  },
  {
    id: 'leave-group-button',
    title: 'Leave Group',
    text: 'You can leave the group at any time, but be aware of the impact on the group\'s minimum order amount.',
    position: 'top',
    view: 'orderDetails',
  },
];

export default function ChatroomPageTutorial({ onComplete, currentView, setCurrentView }: ChatroomPageTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  // This useEffect handles the highlight and tooltip positioning
  const updateHighlightAndTooltip = useCallback(() => {
    if (typeof document === 'undefined' || !document.body) {
      console.log("Tutorial: Document or document.body not ready yet.");
      return;
    }

    const currentStep = tutorialSteps[currentStepIndex];
    if (!currentStep) {
      console.log("Tutorial: No more steps, calling onComplete.");
      onComplete();
      return;
    }

    // Crucial check: if the current step is not meant for the current view, don't try to highlight
    if (currentStep.view !== currentView) {
      console.log(`Tutorial: Current step (${currentStep.id}, view: ${currentStep.view}) does not match currentView (${currentView}). Not highlighting.`);
      // Do NOT increment step here. Wait for the view to change.
      return;
    }

    const targetElement = document.getElementById(currentStep.id);
    console.log(`Tutorial: Attempting to find element with ID: "${currentStep.id}" in view "${currentView}"`);

    if (!targetElement) {
      console.warn(`Tutorial: Element with ID "${currentStep.id}" NOT FOUND in view "${currentView}". Skipping step.`);
      // If the element is not found in the *correct* view, then skip it.
      setCurrentStepIndex(prev => prev + 1);
      return;
    } else {
      console.log(`Tutorial: Element with ID "${currentStep.id}" FOUND. Highlighting.`);
    }

    // Reset z-index for all elements that were previously highlighted
    document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
      (el as HTMLElement).style.zIndex = '';
      el.removeAttribute('data-tutorial-highlighted');
    });

    // Apply highlight to the current target element
    targetElement.style.zIndex = '1001'; // Make it appear above the overlay
    targetElement.setAttribute('data-tutorial-highlighted', 'true'); // Mark it

    const rect = targetElement.getBoundingClientRect();
    setHighlightStyle({
      position: 'absolute',
      top: rect.top + window.scrollY - 5,
      left: rect.left + window.scrollX - 5,
      width: rect.width + 10,
      height: rect.height + 10,
      borderRadius: '8px', // General rounded corners
      boxShadow: '0 0 0 4px rgba(255, 219, 13, 0.7)',
      zIndex: 1000,
      transition: 'all 0.3s ease-in-out',
      pointerEvents: 'none',
    });

    let top = 0;
    let left = 0;
    const tooltipWidth = tooltipRef.current?.offsetWidth || 280;
    const tooltipHeight = tooltipRef.current?.offsetHeight || 120;

    switch (currentStep.position) {
      case 'top':
        top = rect.top - tooltipHeight - 20;
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

    top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));

    setTooltipStyle({
      position: 'absolute',
      top: top + window.scrollY,
      left: left + window.scrollX,
      zIndex: 1002,
    });

    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

  }, [currentStepIndex, onComplete, currentView]);

  useEffect(() => {
    console.log("Tutorial: Main useEffect triggered. currentStepIndex:", currentStepIndex, "currentView:", currentView);
    updateHighlightAndTooltip();

    const handleResizeOrScroll = () => {
      updateHighlightAndTooltip();
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll);

    return () => {
      console.log("Tutorial: Cleaning up event listeners and z-index.");
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
      document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
        (el as HTMLElement).style.zIndex = '';
        el.removeAttribute('data-tutorial-highlighted');
      });
    };
  }, [currentStepIndex, updateHighlightAndTooltip, currentView]);

  // NEW useEffect: Handles step advancement after view changes for specific actions
  useEffect(() => {
    const currentStep = tutorialSteps[currentStepIndex];
    // This condition checks if we are on the 'chat-menu-button' step,
    // and the view has successfully transitioned to 'orderDetails'.
    if (currentStep?.action === 'clickMenuButton' && currentView === 'orderDetails') {
      console.log("Tutorial: View changed to orderDetails, advancing step for clickMenuButton action.");
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentView, currentStepIndex]); // Only re-run when view or step index changes

  const handleNext = () => {
    const currentStep = tutorialSteps[currentStepIndex];
    console.log("Tutorial: Next button clicked. Current step index:", currentStepIndex);

    if (currentStep?.action === 'clickMenuButton') {
      // Trigger the click on the menu button
      const menuButton = document.getElementById('chat-menu-button');
      if (menuButton) {
        menuButton.click(); // Simulate click to change view in parent
        console.log("Tutorial: Simulating click on chat menu button. Waiting for view change to advance step.");
      }
      // Do NOT increment step here. The new useEffect will handle it once view changes.
    } else if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete(); // End tutorial
    }
  };

  const handleSkip = () => {
    console.log("Tutorial: Skip button clicked.");
    onComplete(); // End tutorial
  };

  const currentStep = tutorialSteps[currentStepIndex];
  // Only render if there's a current step AND its view matches the current actual view
  if (!currentStep || currentStep.view !== currentView) {
    console.log(`Tutorial: Not rendering. currentStep: ${currentStep?.id || 'N/A'}, currentView: ${currentView}, expectedView: ${currentStep?.view || 'N/A'}`);
    return null;
  }

  console.log(`Tutorial: Rendering step ${currentStepIndex + 1}/${tutorialSteps.length} - ${currentStep.title}`);

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
