// components/dashboard/DashboardTutorial.tsx
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
        borderRadius: '1.5rem', // For rounded cards
    },
    {
        id: 'add-basket-button',
        title: 'Create a New Basket',
        text: 'Click here to start a new group order and add what you want to order online!',
        position: 'right',
        borderRadius: '0.75rem', // For standard buttons
    },
    {
        id: 'active-baskets-list', // This ID will only exist if there are active baskets
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
        id: 'old-orders-section', // This ID will only exist if there are resolved baskets
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
        borderRadius: '9999px', // For pill-shaped or circular buttons
    },
];

export default function DashboardTutorial({ onComplete }: DashboardTutorialProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [highlightGlowStyle, setHighlightGlowStyle] = useState<React.CSSProperties>({});
    // This style will be applied to the div that creates the dark overlay with the transparent hole
    const [spotlightOverlayStyle, setSpotlightOverlayStyle] = useState<React.CSSProperties>({});
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updateSpotlightAndTooltip = useCallback(() => {
        const currentStep = tutorialSteps[currentStepIndex];
        if (!currentStep) {
            onComplete();
            return;
        }

        const targetElement = document.getElementById(currentStep.id);

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

        const rect = targetElement.getBoundingClientRect();

        // Reset z-index for all elements that were previously highlighted
        document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
            (el as HTMLElement).style.zIndex = ''; // Reset z-index
            el.removeAttribute('data-tutorial-highlighted'); // Remove marker
        });

        // Apply a high z-index to the target element itself so it appears above the dark overlay
        targetElement.style.zIndex = '1001';
        targetElement.setAttribute('data-tutorial-highlighted', 'true'); // Mark it for cleanup

        // Define the padding for both the spotlight hole and the glow
        const padding = 5;

        // Style for the transparent div that creates the "hole" with its box-shadow
        // Adjusted to include the same padding as the highlight glow
        setSpotlightOverlayStyle({
            position: 'absolute',
            top: rect.top + window.scrollY - padding, // Apply padding
            left: rect.left + window.scrollX - padding, // Apply padding
            width: rect.width + (padding * 2), // Adjust width for padding
            height: rect.height + (padding * 2), // Adjust height for padding
            borderRadius: currentStep.borderRadius || '1rem', // Apply rounded corners to the hole
            backgroundColor: 'transparent', // Crucial: makes the div itself transparent
            pointerEvents: 'none', // Allows clicks to pass through to the actual element underneath
            // zIndex for this div will come from the global CSS class .spotlight-overlay (should be 999)
            transition: 'all 0.3s ease-in-out',
        });

        // Calculate highlight glow style (a glow/border around the element)
        // This already had the padding, so it remains consistent
        setHighlightGlowStyle({
            position: 'absolute',
            top: rect.top + window.scrollY - padding, // Padding for the glow
            left: rect.left + window.scrollX - padding, // Padding for the glow
            width: rect.width + (padding * 2), // Adjust width for padding
            height: rect.height + (padding * 2), // Adjust height for padding
            borderRadius: currentStep.borderRadius || '1rem', // Use step's borderRadius
            boxShadow: '0 0 0 4px rgba(255, 219, 13, 0.7)', // Bright yellow glow
            zIndex: 1000, // This is above the spotlight-overlay (999) but below the targetElement (1001)
            transition: 'all 0.3s ease-in-out',
            pointerEvents: 'none', // Allow clicks to pass through to the actual element if needed
        });

        // Calculate tooltip position
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

        // Adjust for viewport boundaries
        top = Math.max(buffer, Math.min(top, window.innerHeight - tooltipHeight - buffer));
        left = Math.max(buffer, Math.min(left, window.innerWidth - tooltipWidth - buffer));

        setTooltipStyle({
            position: 'absolute',
            top: top + window.scrollY,
            left: left + window.scrollX,
            zIndex: 1002, // Always on top
        });

        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    }, [currentStepIndex, onComplete]);

    useEffect(() => {
        const timer = setTimeout(updateSpotlightAndTooltip, 50);
        window.addEventListener('resize', updateSpotlightAndTooltip);
        window.addEventListener('scroll', updateSpotlightAndTooltip);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateSpotlightAndTooltip);
            window.removeEventListener('scroll', updateSpotlightAndTooltip);
            // Clean up z-index and attribute on unmount
            document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
                (el as HTMLElement).style.zIndex = '';
                el.removeAttribute('data-tutorial-highlighted');
            });
        };
    }, [currentStepIndex, updateSpotlightAndTooltip]);

    const handleNext = () => {
        const nextStep = currentStepIndex + 1;
        if (nextStep < tutorialSteps.length) {
            setCurrentStepIndex(nextStep);
        } else {
            onComplete(); // End tutorial
        }
    };

    const handlePrevious = () => {
        let prevIndex = currentStepIndex - 1;
        while (prevIndex >= 0) {
            if (document.getElementById(tutorialSteps[prevIndex]!.id)) {
                setCurrentStepIndex(prevIndex);
                return;
            }
            prevIndex--;
        }
    };

    const handleSkip = () => onComplete();

    const currentStep = tutorialSteps[currentStepIndex];
    if (!currentStep) return null;

    return (
        <>
            {/* The div that creates the dark overlay with a transparent hole via box-shadow */}
            <div className="spotlight-overlay" style={spotlightOverlayStyle} />

            {/* Highlight Glow - This creates the border/glow effect around the bright area */}
            <div
                style={highlightGlowStyle}
                className="rounded-2xl border-4 border-[#FFDB0D] animate-pulse-once"
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
                            {currentStepIndex >= tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
