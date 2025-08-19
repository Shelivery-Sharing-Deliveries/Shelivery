"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui'; // Assuming you have a general Button component

interface TutorialStep {
    id: string; // ID of the element to highlight
    title: string;
    text: string;
    position: 'top' | 'bottom' | 'left' | 'right'; // Position of the tooltip relative to the element
    borderRadius?: string; // This allows each step to have a custom shape
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
        borderRadius: '1rem',
    },
    {
        id: 'profile-card',
        title: 'Your Profile',
        text: 'Here you can see your profile information and manage push notifications.',
        position: 'bottom',
        borderRadius: '1.5rem',
    },
    {
        id: 'add-basket-button',
        title: 'Create a New Basket',
        text: 'Click here to start a new group order and add what you want to order online!',
        position: 'right',
        borderRadius: '0.75rem',
    },
    {
        id: 'active-baskets-list',
        title: 'Your Active Baskets',
        text: 'These are your ongoing group orders. Click any basket to view its details or chat with your group.',
        position: 'top',
        borderRadius: '1.5rem',
    },
    {
        id: 'dashboard-banner',
        title: 'Promotions & Updates',
        text: 'Keep an eye on this section for exciting promotions and important app updates.',
        position: 'top',
        borderRadius: '1.5rem',
    },
    {
        id: 'old-orders-section',
        title: 'Order Archive',
        text: 'Your completed orders are stored here. You can review past deliveries and chats.',
        position: 'top',
        borderRadius: '1.5rem',
    },
    {
        id: 'invite-friends-button',
        title: 'Invite Friends',
        text: 'Shelivery is more fun with friends! Invite your dormmates to join your groups.',
        position: 'left',
        borderRadius: '9999px',
    },
    {
        id: 'no-active-baskets-message',
        title: 'No Active Baskets Yet!',
        text: 'This is where your active baskets will appear. Click "Add Basket" to create your first one!',
        position: 'bottom',
        borderRadius: '1rem',
    },
];

export default function DashboardTutorial({ onComplete }: DashboardTutorialProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [highlightGlowStyle, setHighlightGlowStyle] = useState<React.CSSProperties>({});
    const [spotlightHoleStyle, setSpotlightHoleStyle] = useState<React.CSSProperties>({}); // Changed from spotlightOverlayStyle for clarity
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updateSpotlightAndTooltip = useCallback(() => {
        const currentStep = tutorialSteps[currentStepIndex];
        if (!currentStep) {
            onComplete();
            return;
        }

        const targetElement = document.getElementById(currentStep.id);

        // If element not found, automatically skip to the next available one
        if (!targetElement) {
            const nextAvailableIndex = tutorialSteps.findIndex((step, index) =>
                index > currentStepIndex && document.getElementById(step.id)
            );
            if (nextAvailableIndex !== -1) {
                setCurrentStepIndex(nextAvailableIndex);
            } else {
                onComplete();
            }
            return;
        }

        // Find the scrollable container (PageLayout's content area)
        const scrollableContainer = targetElement.closest('.overflow-y-auto') as HTMLElement;
        
        const rect = targetElement.getBoundingClientRect(); // Position relative to viewport

        // Check if the element has a valid position
        if (rect.width === 0 || rect.height === 0) {
             setTimeout(updateSpotlightAndTooltip, 100);
             return;
        }

        // Cleanup z-index from previously highlighted elements
        document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
            (el as HTMLElement).style.zIndex = '';
            el.removeAttribute('data-tutorial-highlighted');
        });

        // Elevate the target element above the overlay
        targetElement.style.zIndex = '1001';
        targetElement.setAttribute('data-tutorial-highlighted', 'true');

        const padding = 2; // Padding for the glow effect

        // ✨ KEY CHANGE: Create the overlay using a "hole" div with a massive box-shadow
        // This allows for rounded corners while using robust fixed positioning.
        setSpotlightHoleStyle({
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: currentStep.borderRadius || '1rem',
            // This shadow creates the dark overlay around the transparent hole
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            zIndex: 999,
            transition: 'all 0.3s ease-in-out',
        });

        // Glow effect style (positioned relative to the viewport)
        setHighlightGlowStyle({
            position: 'fixed',
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + (padding * 2),
            height: rect.height + (padding * 2),
            borderRadius: currentStep.borderRadius || '1rem',
            zIndex: 1000,
            pointerEvents: 'none', // Allows clicks to pass through to the element underneath
        });

        // Calculate tooltip position (remains fixed relative to the viewport)
        let top = 0, left = 0;
        const tooltipWidth = tooltipRef.current?.offsetWidth || 250;
        const tooltipHeight = tooltipRef.current?.offsetHeight || 150;
        const buffer = 15;

        switch (currentStep.position) {
            case 'top':
                top = rect.top - tooltipHeight - buffer;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'bottom':
                top = rect.bottom + buffer;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.left - tooltipWidth - buffer;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.right + buffer;
                break;
        }

        // Keep tooltip within viewport boundaries
        top = Math.max(buffer, Math.min(top, window.innerHeight - tooltipHeight - buffer));
        left = Math.max(buffer, Math.min(left, window.innerWidth - tooltipWidth - buffer));

        setTooltipStyle({
            position: 'fixed',
            top: top,
            left: left,
            zIndex: 1002,
        });

        // Scroll the element into view within its container
        if (scrollableContainer) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } else {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

    }, [currentStepIndex, onComplete]);

    useEffect(() => {
        const timer = setTimeout(updateSpotlightAndTooltip, 50);
        
        // Find the scrollable container to listen for its scroll events
        const currentStepId = tutorialSteps[currentStepIndex]?.id;
        const targetElement = currentStepId ? document.getElementById(currentStepId) : null;
        const scrollableContainer = targetElement?.closest('.overflow-y-auto') as HTMLElement;
        
        // Event handlers
        const handleUpdate = () => {
            // Small delay to ensure DOM has updated
            setTimeout(updateSpotlightAndTooltip, 10);
        };

        // Add event listeners
        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, true); // Use capture to catch all scroll events
        
        // Listen specifically to the scrollable container if found
        if (scrollableContainer) {
            scrollableContainer.addEventListener('scroll', handleUpdate);
        }
        
        // Added a click event listener to handle cases where an element's position might change after a user interaction.
        window.addEventListener('click', handleUpdate);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate, true);
            window.removeEventListener('click', handleUpdate);
            
            if (scrollableContainer) {
                scrollableContainer.removeEventListener('scroll', handleUpdate);
            }
            
            document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
                (el as HTMLElement).style.zIndex = '';
                el.removeAttribute('data-tutorial-highlighted');
            });
        };
    }, [currentStepIndex, updateSpotlightAndTooltip]);
    
    // More robust navigation that skips over elements that aren't rendered
    const handleNext = () => {
        const nextAvailableIndex = tutorialSteps.findIndex((step, index) =>
            index > currentStepIndex && document.getElementById(step.id)
        );

        if (nextAvailableIndex !== -1) {
            setCurrentStepIndex(nextAvailableIndex);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        let prevIndex = currentStepIndex - 1;
        while (prevIndex >= 0) {
            // Safely get the step to prevent "undefined" errors
            const step = tutorialSteps[prevIndex];
            // Check if the step and its corresponding DOM element exist
            if (step && document.getElementById(step.id)) {
                setCurrentStepIndex(prevIndex);
                return; // Exit after finding the valid previous step
            }
            prevIndex--;
        }
    };

    const handleSkip = () => onComplete();

    const currentStep = tutorialSteps[currentStepIndex];
    if (!currentStep || !document.getElementById(currentStep.id)) return null;

    const isLastStep = !tutorialSteps.some((step, index) => index > currentStepIndex && document.getElementById(step.id));

    return (
        <>
            {/* The element that creates the dark overlay and the rounded hole */}
            <div style={spotlightHoleStyle} />

            {/* The separate glow effect element */}
            <div
                style={highlightGlowStyle}
                className="border-2 border-[#FFDB0D] animate-pulse-once"
            />

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                style={tooltipStyle}
                className="bg-white rounded-lg shadow-2xl p-4 max-w-xs text-sm text-gray-800"
            >
                <h3 className="font-bold text-lg mb-2 text-shelivery-primary-blue">{currentStep.title}</h3>
                <p className="mb-4">{currentStep.text}</p>
                <div className="flex justify-between items-center">
                    <Button onClick={handleSkip} variant="secondary" className="px-3 py-1 text-xs">Skip</Button>
                    <div className="flex gap-2">
                        {currentStepIndex > 0 && (
                            <Button onClick={handlePrevious} variant="secondary" className="px-3 py-1 text-xs">Back</Button>
                        )}
                        <Button onClick={handleNext} className="px-3 py-1 text-xs">
                            {isLastStep ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
