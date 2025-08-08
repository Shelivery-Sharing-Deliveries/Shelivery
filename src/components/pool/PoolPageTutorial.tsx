// components/pool/PoolPageTutorial.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button'; // Assuming you have a general Button component

interface TutorialStep {
    id: string; // ID of the element to highlight
    title: string;
    text: string;
    position: 'top' | 'bottom' | 'left' | 'right'; // Position of the tooltip relative to the element
    borderRadius?: string; // This allows each step to have a custom shape
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
        borderRadius: '0.75rem', // Assuming rounded-lg for headers/sections
    },
    {
        id: 'pool-status-card',
        title: 'Basket Status',
        text: 'This card shows if your basket is ready to be ordered or if it\'s still waiting for others to join the pool.',
        position: 'bottom',
        borderRadius: '1.5rem', // Assuming a larger border-radius for cards
    },
    {
        id: 'pool-progress-bar',
        title: 'Pool Progress',
        text: 'Track how close your group is to reaching the minimum order amount for free shipping. The bar fills up as more baskets are added!',
        position: 'bottom',
        borderRadius: '0.75rem', // Assuming rounded-lg for progress bars
    },
    {
        id: 'user-basket-details',
        title: 'Your Basket Details',
        text: 'Here you can review the total amount of your basket, access the link to your items, and view any order notes.',
        position: 'top',
        borderRadius: '1.5rem', // Assuming a larger border-radius for cards
    },
    {
        id: 'edit-basket-button',
        title: 'Edit Your Basket',
        text: 'If your basket is not yet ready, you can click here to modify your order link or amount.',
        position: 'top',
        borderRadius: '1rem', // Assuming a common button border-radius
    },
    {
        id: 'delete-basket-button',
        title: 'Delete Your Basket',
        text: 'If you change your mind and your basket is not yet ready, you can remove it from the pool here.',
        position: 'top',
        borderRadius: '1rem', // Assuming a common button border-radius
    },
    {
        id: 'main-action-button',
        title: 'Main Action Button',
        text: 'This button changes based on the pool status. It allows you to mark your basket as ready, cancel it, or enter the group chat once the pool is filled.',
        position: 'top',
        borderRadius: '1rem', // Assuming a common button border-radius
    },
];

export default function PoolPageTutorial({ onComplete }: PoolPageTutorialProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [highlightGlowStyle, setHighlightGlowStyle] = useState<React.CSSProperties>({});
    // This style will be applied to the div that creates the dark overlay with the transparent hole
    const [spotlightOverlayStyle, setSpotlightOverlayStyle] = useState<React.CSSProperties>({});
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updateHighlightAndTooltip = useCallback(() => {
        const currentStep = tutorialSteps[currentStepIndex];
        if (!currentStep) {
            onComplete();
            return;
        }

        const targetElement = document.getElementById(currentStep.id);

        if (!targetElement) {
            console.warn(`Tutorial: Element with ID "${currentStep.id}" NOT FOUND. Skipping step.`);
            const nextAvailableIndex = tutorialSteps.findIndex((step, index) =>
                index > currentStepIndex && document.getElementById(step.id)
            );
            if (nextAvailableIndex !== -1) {
                setCurrentStepIndex(nextAvailableIndex);
            } else {
                onComplete(); // No more available steps, end tutorial
            }
            return;
        } else {
            console.log(`Tutorial: Found element with ID "${currentStep.id}". Highlighting.`);
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

        // Define the padding for both the spotlight hole and the glow.
        // This padding now matches the border thickness (2px) on each side.
        const padding = 2;

        // Style for the transparent div that creates the "hole" with its box-shadow
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
        setHighlightGlowStyle({
            position: 'absolute',
            top: rect.top + window.scrollY - padding, // Padding for the glow
            left: rect.left + window.scrollX - padding, // Padding for the glow
            width: rect.width + (padding * 2), // Adjust width for padding
            height: rect.height + (padding * 2), // Adjust height for padding
            borderRadius: currentStep.borderRadius || '1rem', // Use step's borderRadius
            boxShadow: '0 0 0 rgba(255, 219, 13, 0.7)', // Removed spread radius; border class handles thickness
            zIndex: 1000, // This is above the spotlight-overlay (999) but below the targetElement (1001)
            transition: 'all 0.3s ease-in-out',
            pointerEvents: 'none', // Allow clicks to pass through to the actual element if needed
        });

        // Calculate tooltip position
        let top = 0;
        let left = 0;
        const tooltipWidth = tooltipRef.current?.offsetWidth || 280; // Estimate width
        const tooltipHeight = tooltipRef.current?.offsetHeight || 120; // Estimate height
        const buffer = 15; // Consistent buffer for tooltip positioning

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
            zIndex: 1002, // Above highlight and overlay
        });

        // Scroll to the element if it's not fully in view
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    }, [currentStepIndex, onComplete]);

    useEffect(() => {
        // A small timeout ensures the DOM has rendered the target element before we try to measure it
        const timer = setTimeout(updateHighlightAndTooltip, 50);
        window.addEventListener('resize', updateHighlightAndTooltip);
        window.addEventListener('scroll', updateHighlightAndTooltip);

        return () => {
            clearTimeout(timer);
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
        const nextStep = currentStepIndex + 1;
        if (nextStep < tutorialSteps!.length) { // Non-null assertion for tutorialSteps.length
            setCurrentStepIndex(nextStep);
        } else {
            onComplete(); // End tutorial
        }
    };

    const handlePrevious = () => {
        let prevIndex = currentStepIndex - 1;
        while (prevIndex >= 0) {
            // Non-null assertion for tutorialSteps[prevIndex]
            if (document.getElementById(tutorialSteps[prevIndex]!.id)) {
                setCurrentStepIndex(prevIndex);
                return;
            }
            prevIndex--;
        }
    };

    const handleSkip = () => {
        onComplete(); // End tutorial
    };

    const currentStep = tutorialSteps[currentStepIndex];
    if (!currentStep) return null; // Should not happen if onComplete is called correctly

    return (
        <>
            {/* The div that creates the dark overlay with a transparent hole via box-shadow */}
            <div className="spotlight-overlay" style={spotlightOverlayStyle} />

            {/* Highlight Glow - This creates the border/glow effect around the bright area */}
            <div style={highlightGlowStyle} className="rounded-2xl border-2 border-[#FFDB0D] animate-pulse-once" />

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
                    <div className="flex gap-2"> {/* Added flex container for buttons */}
                        {currentStepIndex > 0 && (
                            <Button onClick={handlePrevious} variant="secondary" className="px-3 py-1 text-xs">
                                Back
                            </Button>
                        )}
                        <Button onClick={handleNext} className="px-3 py-1 text-xs">
                            {currentStepIndex === tutorialSteps!.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
