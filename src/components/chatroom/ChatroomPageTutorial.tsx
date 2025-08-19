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
    borderRadius?: string; // This allows each step to have a custom shape
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
        borderRadius: '9999px', // Assuming a circular button
    },
    {
        id: 'order-details-admin-section',
        title: 'Group Admin',
        text: 'This section shows who the current group administrator is. The admin can manage group settings and actions.',
        position: 'bottom',
        view: 'orderDetails',
        borderRadius: '1.5rem', // Assuming a card-like section
    },
    {
        id: 'change-admin-button',
        title: 'Change Admin',
        text: 'If you are the current admin, you can transfer admin rights to another member here.',
        position: 'top',
        view: 'orderDetails',
        borderRadius: '1rem', // Assuming a common button border-radius
    },
    {
        id: 'order-details-members-list',
        title: 'Group Members & Orders',
        text: 'See all members in this chatroom and their individual basket details. You can also manage members here if you are the admin.',
        position: 'top',
        view: 'orderDetails',
        borderRadius: '1.5rem', // Assuming a list/card-like section
    },
    {
        id: 'order-details-ready-status', // Assuming an ID for the "Ready to Order" status or similar text
        title: 'Ready to Order Status',
        text: 'Each member\'s "Ready to Order" status is shown here. Once everyone is ready and the minimum amount is met, the order can be placed.',
        position: 'bottom',
        view: 'orderDetails',
        borderRadius: '0.75rem', // Assuming a badge or small card
    },
    {
        id: 'mark-as-ordered-button',
        title: 'Order Placed',
        text: 'Once the group has decided, the admin can mark the order as placed. This will move the chatroom to the next stage.',
        position: 'top',
        view: 'orderDetails',
        borderRadius: '1rem', // Assuming a common button border-radius
    },
    {
        id: 'mark-as-delivered-button',
        title: 'Order Delivered',
        text: 'After the order has been delivered, the admin can mark it as delivered here, resolving the chatroom.',
        position: 'top',
        view: 'orderDetails',
        borderRadius: '1rem', // Assuming a common button border-radius
    },
    {
        id: 'extend-time-button', // Added new tutorial step for Extend Time button
        title: 'Extend Order Time',
        text: 'As the administrator, you can extend the deadline for this order, giving members more time to join or finalize their baskets.',
        position: 'top',
        view: 'orderDetails',
        borderRadius: '1rem',
    },
    {
        id: 'leave-group-button',
        title: 'Leave Group',
        text: 'You can leave the group at any time, but be aware of the impact on the group\'s minimum order amount.',
        position: 'top',
        view: 'orderDetails',
        borderRadius: '1rem', // Assuming a common button border-radius
    },
];

export default function ChatroomPageTutorial({ onComplete, currentView, setCurrentView }: ChatroomPageTutorialProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [highlightGlowStyle, setHighlightGlowStyle] = useState<React.CSSProperties>({});
    // This style will be applied to the div that creates the dark overlay with the transparent hole
    const [spotlightOverlayStyle, setSpotlightOverlayStyle] = useState<React.CSSProperties>({});
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
            const nextAvailableIndex = tutorialSteps.findIndex((step, index) =>
                index > currentStepIndex && document.getElementById(step.id) && step.view === currentView // Only find next step in current view
            );
            if (nextAvailableIndex !== -1) {
                setCurrentStepIndex(nextAvailableIndex);
            } else {
                onComplete(); // No more available steps in this view, end tutorial
            }
            return;
        } else {
            console.log(`Tutorial: Element with ID "${currentStep.id}" FOUND. Highlighting.`);
        }

        // Find the scrollable container (PageLayout's content area)
        const scrollableContainer = targetElement.closest('.overflow-y-auto') as HTMLElement;
        
        const rect = targetElement.getBoundingClientRect();

        // Check if the element has a valid position
        if (rect.width === 0 || rect.height === 0) {
             setTimeout(updateHighlightAndTooltip, 100);
             return;
        }

        // Reset z-index for all elements that were previously highlighted
        document.querySelectorAll('[data-tutorial-highlighted="true"]').forEach(el => {
            (el as HTMLElement).style.zIndex = '';
            el.removeAttribute('data-tutorial-highlighted');
        });

        // Apply a high z-index to the target element itself so it appears above the dark overlay
        targetElement.style.zIndex = '1001';
        targetElement.setAttribute('data-tutorial-highlighted', 'true'); // Mark it for cleanup

        // Define the padding for both the spotlight hole and the glow.
        // This padding now matches the border thickness (2px) on each side.
        const padding = 2;

        // Style for the spotlight hole using fixed positioning
        setSpotlightOverlayStyle({
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

        // Calculate highlight glow style using fixed positioning
        setHighlightGlowStyle({
            position: 'fixed',
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + (padding * 2),
            height: rect.height + (padding * 2),
            borderRadius: currentStep.borderRadius || '1rem',
            zIndex: 1000,
            transition: 'all 0.3s ease-in-out',
            pointerEvents: 'none',
        });

        let top = 0;
        let left = 0;
        const tooltipWidth = tooltipRef.current?.offsetWidth || 280;
        const tooltipHeight = tooltipRef.current?.offsetHeight || 120;
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

        // Scroll the element into view within its container
        if (scrollableContainer) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } else {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

    }, [currentStepIndex, onComplete, currentView]);

    useEffect(() => {
        console.log("Tutorial: Main useEffect triggered. currentStepIndex:", currentStepIndex, "currentView:", currentView);
        const timer = setTimeout(updateHighlightAndTooltip, 50); // Small delay to ensure DOM is ready

        // Find the scrollable container to listen for its scroll events
        const currentStepId = tutorialSteps[currentStepIndex]?.id;
        const targetElement = currentStepId ? document.getElementById(currentStepId) : null;
        const scrollableContainer = targetElement?.closest('.overflow-y-auto') as HTMLElement;

        // Event handlers
        const handleUpdate = () => {
            // Small delay to ensure DOM has updated
            setTimeout(updateHighlightAndTooltip, 10);
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
            console.log("Tutorial: Cleaning up event listeners and z-index.");
            clearTimeout(timer); // Clear the timeout on unmount
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
        } else if (currentStepIndex < tutorialSteps!.length - 1) { // Non-null assertion for tutorialSteps.length
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete(); // End tutorial
        }
    };

    const handlePrevious = () => {
        let prevIndex = currentStepIndex - 1;
        while (prevIndex >= 0) {
            // Find the first previous step that exists in the DOM and belongs to the current view
            if (document.getElementById(tutorialSteps[prevIndex]!.id) && tutorialSteps[prevIndex]!.view === currentView) {
                setCurrentStepIndex(prevIndex);
                return;
            }
            prevIndex--;
        }
        // If no previous step found in the current view, and we were on orderDetails, try going back to chat view
        if (currentView === 'orderDetails' && currentStepIndex > 0 && tutorialSteps.slice(0, currentStepIndex).every(step => step.view === 'orderDetails')) {
            // This condition is true if all previous steps (from index 0 up to currentStepIndex-1) were in 'orderDetails' view.
            // In this specific tutorial flow, it means we've just entered 'orderDetails' and there's no prior 'orderDetails' step.
            // So, if we are at the first 'orderDetails' step, go back to 'chat' view's first step.
            setCurrentView('chat');
            setCurrentStepIndex(0); // Go back to the chat menu button step (which is index 0)
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
            {/* The div that creates the dark overlay with a transparent hole via box-shadow */}
            <div className="spotlight-overlay" style={spotlightOverlayStyle} />

            {/* Highlight Glow - This creates the border/glow effect around the bright area */}
            <div style={highlightGlowStyle} className="rounded-lg border-2 border-[#FFDB0D] animate-pulse-once" />

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
