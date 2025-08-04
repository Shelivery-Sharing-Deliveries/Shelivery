// components/shops/ShopBasketTutorial.tsx
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

interface ShopBasketTutorialProps {
    onComplete: () => void; // Callback when the tutorial is finished or skipped
}

const tutorialSteps: TutorialStep[] = [
    {
        id: 'basket-instructions-info', // NEW STEP ID
        title: 'Order Details Guidance',
        text: 'Here you\'ll find important tips on how to provide your order details, whether you use a link, a note, or both.',
        position: 'bottom', // Position the tooltip below the instructions box
        borderRadius: '0.75rem', // Assuming a common rounded-lg for info boxes
    },
    {
        id: 'basket-link-input',
        title: 'Basket Link (URL)',
        text: 'Enter the direct link to your shopping basket or specific items from the shop here. This helps your group members see what you\'re ordering.',
        position: 'bottom',
        borderRadius: '0.75rem', // Assuming rounded-lg for input fields
    },
    {
        id: 'basket-note-input', // NEW: Added ID for the note input
        title: 'Order Note',
        text: 'If you don\'t have a direct link, or want to add more details, write your shopping list or any specific instructions here.',
        position: 'bottom',
        borderRadius: '0.75rem', // Assuming rounded-lg for input fields
    },
    {
        id: 'basket-amount-input',
        title: 'Total Amount (CHF)',
        text: 'Input the total amount of your basket in CHF. This is your contribution to the group order.',
        position: 'bottom',
        borderRadius: '0.75rem', // Assuming rounded-lg for input fields
    },
    {
        id: 'order-summary-section',
        title: 'Order Summary',
        text: 'This section provides a quick overview of your basket details, including the total amount you entered.',
        position: 'top',
        borderRadius: '1.5rem', // Assuming a larger border-radius for summary cards/sections
    },
    {
        id: 'submit-basket-button',
        title: 'Create/Update Basket',
        text: 'Once you\'ve entered all details, click this button to create your basket or save changes. You\'ll then be redirected to the pool!',
        position: 'top',
        borderRadius: '1rem', // Assuming a common button border-radius
    },
];

export default function ShopBasketTutorial({ onComplete }: ShopBasketTutorialProps) {
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
            console.warn(`Tutorial: Element with ID "${currentStep.id}" not found. Skipping step.`);
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

        // FIX: Define rect here, after targetElement is confirmed to exist
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
            <div style={highlightGlowStyle} className="rounded-lg border-4 border-[#FFDB0D] animate-pulse-once" />

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
