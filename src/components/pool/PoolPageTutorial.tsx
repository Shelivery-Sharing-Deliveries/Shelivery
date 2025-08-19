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

interface PoolPageTutorialProps {
    onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
    {
        id: 'pool-header',
        title: 'Your Pool Overview',
        text: 'This is your current basket pool. Here you can see the shop name and the overall status of your group order.',
        position: 'bottom',
        borderRadius: '0.75rem',
    },
    {
        id: 'pool-status-card',
        title: 'Basket Status',
        text: 'This card shows if your basket is ready to be ordered or if it\'s still waiting for others to join the pool.',
        position: 'bottom',
        borderRadius: '1.5rem',
    },
    {
        id: 'pool-progress-bar',
        title: 'Pool Progress',
        text: 'Track how close your group is to reaching the minimum order amount for free shipping. The bar fills up as more baskets are added!',
        position: 'bottom',
        borderRadius: '0.75rem',
    },
    {
        id: 'user-basket-details',
        title: 'Your Basket Details',
        text: 'Here you can review the total amount of your basket, access the link to your items, and view any order notes.',
        position: 'top',
        borderRadius: '1.5rem',
    },
    {
        id: 'edit-basket-button',
        title: 'Edit Your Basket',
        text: 'If your basket is not yet ready, you can click here to modify your order link or amount.',
        position: 'top',
        borderRadius: '1rem',
    },
    {
        id: 'delete-basket-button',
        title: 'Delete Your Basket',
        text: 'If you change your mind and your basket is not yet ready, you can remove it from the pool here.',
        position: 'top',
        borderRadius: '1rem',
    },
    {
        id: 'main-action-button',
        title: 'Main Action Button',
        text: 'This button changes based on the pool status. It allows you to mark your basket as ready, cancel it, or enter the group chat once the pool is filled.',
        position: 'top',
        borderRadius: '1rem',
    },
];

export default function PoolPageTutorial({ onComplete }: PoolPageTutorialProps) {
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
            setTimeout(updateSpotlightAndTooltip, 100);
            return;
        }

        const rect = targetElement.getBoundingClientRect();

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

        // Position the spotlight hole and glow relative to the viewport
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

        // Position the tooltip relative to the viewport as well
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