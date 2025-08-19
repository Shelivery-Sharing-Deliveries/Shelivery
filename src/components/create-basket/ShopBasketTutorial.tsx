"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface TutorialStep {
    id: string;
    title: string;
    text: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    borderRadius?: string;
}

interface ShopBasketTutorialProps {
    onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
    {
        id: 'basket-instructions-info',
        title: 'Order Details Guidance',
        text: 'Here you\'ll find important tips on how to provide your order details, whether you use a link, a note, or both.',
        position: 'bottom',
        borderRadius: '0.75rem',
    },
    {
        id: 'basket-link-input',
        title: 'Basket Link (URL)',
        text: 'Enter the direct link to your shopping basket or specific items from the shop here. This helps your group members see what you\'re ordering.',
        position: 'bottom',
        borderRadius: '0.75rem',
    },
    {
        id: 'basket-note-input',
        title: 'Order Note',
        text: 'If you don\'t have a direct link, or want to add more details, write your shopping list or any specific instructions here.',
        position: 'bottom',
        borderRadius: '0.75rem',
    },
    {
        id: 'basket-amount-input',
        title: 'Total Amount (CHF)',
        text: 'Input the total amount of your basket in CHF. This is your contribution to the group order.',
        position: 'bottom',
        borderRadius: '0.75rem',
    },
    {
        id: 'order-summary-section',
        title: 'Order Summary',
        text: 'This section provides a quick overview of your basket details, including the total amount you entered.',
        position: 'top',
        borderRadius: '1.5rem',
    },
    {
        id: 'submit-basket-button',
        title: 'Create/Update Basket',
        text: 'Once you\'ve entered all details, click this button to create your basket or save changes. You\'ll then be redirected to the pool!',
        position: 'top',
        borderRadius: '1rem',
    },
];

export default function ShopBasketTutorial({ onComplete }: ShopBasketTutorialProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [highlightGlowStyle, setHighlightGlowStyle] = useState<React.CSSProperties>({});
    const [spotlightHoleStyle, setSpotlightHoleStyle] = useState<React.CSSProperties>({});
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updateSpotlightAndTooltip = useCallback(() => {
        const currentStep = tutorialSteps[currentStepIndex];
        if (!currentStep) {
            onComplete();
            return;
        }

        const targetElement = document.getElementById(currentStep.id);

        if (!targetElement) {
            // If the element isn't found, try again after a short delay
            setTimeout(updateSpotlightAndTooltip, 100);
            return;
        }

        const rect = targetElement.getBoundingClientRect();

        // Check if the element has a valid position
        if (rect.width === 0 || rect.height === 0) {
             setTimeout(updateSpotlightAndTooltip, 100);
             return;
        }

        document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
            (el as HTMLElement).style.zIndex = '';
            el.removeAttribute('data-tutorial-highlighted');
        });

        targetElement.style.zIndex = '1001';
        targetElement.setAttribute('data-tutorial-highlighted', 'true');

        const padding = 2;

        setSpotlightHoleStyle({
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: currentStep.borderRadius || '1rem',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            zIndex: 999,
            transition: 'all 0.3s ease-in-out',
        });

        setHighlightGlowStyle({
            position: 'fixed',
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + (padding * 2),
            height: rect.height + (padding * 2),
            borderRadius: currentStep.borderRadius || '1rem',
            zIndex: 1000,
            pointerEvents: 'none',
        });

        let top = 0, left = 0;
        const tooltipWidth = tooltipRef.current?.offsetWidth || 280;
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

        top = Math.max(buffer, Math.min(top, window.innerHeight - tooltipHeight - buffer));
        left = Math.max(buffer, Math.min(left, window.innerWidth - tooltipWidth - buffer));

        setTooltipStyle({
            position: 'fixed',
            top: top,
            left: left,
            zIndex: 1002,
        });

        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    }, [currentStepIndex, onComplete]);

    useEffect(() => {
        const timer = setTimeout(updateSpotlightAndTooltip, 50);
        window.addEventListener('resize', updateSpotlightAndTooltip);
        window.addEventListener('scroll', updateSpotlightAndTooltip);
        // Added a click event listener to handle cases where an element's position might change after a user interaction.
        window.addEventListener('click', updateSpotlightAndTooltip);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateSpotlightAndTooltip);
            window.removeEventListener('scroll', updateSpotlightAndTooltip);
            window.removeEventListener('click', updateSpotlightAndTooltip);
            document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
                (el as HTMLElement).style.zIndex = '';
                el.removeAttribute('data-tutorial-highlighted');
            });
        };
    }, [currentStepIndex, updateSpotlightAndTooltip]);

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
            const step = tutorialSteps[prevIndex];
            if (step && document.getElementById(step.id)) {
                setCurrentStepIndex(prevIndex);
                return;
            }
            prevIndex--;
        }
    };

    const handleSkip = () => onComplete();

    const currentStep = tutorialSteps[currentStepIndex];
    if (!currentStep) return null;

    const targetElement = document.getElementById(currentStep.id);
    if (!targetElement) return null;

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
                    <Button onClick={handleSkip} variant="secondary" className="px-3 py-1 text-xs">
                        Skip
                    </Button>
                    <div className="flex gap-2">
                        {currentStepIndex > 0 && (
                            <Button onClick={handlePrevious} variant="secondary" className="px-3 py-1 text-xs">
                                Back
                            </Button>
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