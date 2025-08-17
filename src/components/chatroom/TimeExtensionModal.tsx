"use client";

import { useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TimeExtensionModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onExtend now accepts the number of days to extend
    onExtend: (days: number) => void;
    timeLeft: { hours: number; minutes: number };
    // The `isOrderedState` prop can be derived from `chatroomState`, but kept for compatibility.
    isOrderedState: boolean; 
    hasExtendedOnceBeforeOrdered: boolean;
    currentTotalExtendedDaysInOrderedState: number;
    // NEW: Add prop for delivered state total extension days
    currentTotalExtendedDaysInDeliveredState: number;
    // NEW: Pass the actual chatroom state to determine extension rules
    chatroomState: "waiting" | "active" | "ordered" | "delivered" | "resolved" | "canceled";
}

export function TimeExtensionModal({
    isOpen,
    onClose,
    onExtend,
    timeLeft,
    // isOrderedState is technically redundant with chatroomState, but kept as it was in your original code.
    isOrderedState, 
    hasExtendedOnceBeforeOrdered,
    currentTotalExtendedDaysInOrderedState,
    // NEW: Destructure new prop
    currentTotalExtendedDaysInDeliveredState,
    // NEW: Destructure new prop
    chatroomState,
}: TimeExtensionModalProps) {
    // Add console logs here to inspect props
    console.log("TimeExtensionModal Props Debug:");
    console.log("  isOpen:", isOpen);
    console.log("  chatroomState:", chatroomState);
    console.log("  hasExtendedOnceBeforeOrdered:", hasExtendedOnceBeforeOrdered);
    console.log("  currentTotalExtendedDaysInOrderedState:", currentTotalExtendedDaysInOrderedState);
    console.log("  currentTotalExtendedDaysInDeliveredState:", currentTotalExtendedDaysInDeliveredState);
    
    if (!isOpen) return null;

    const MAX_EXTENSION_DAYS_ORDERED_STATE = 14; // Max 2 weeks (14 days) of extension in 'ordered' state
    const MAX_EXTENSION_DAYS_DELIVERED_STATE = 7; // Max 1 week (7 days) of extension in 'delivered' state

    // Determine remaining extension days based on current chatroom state
    let remainingExtensionDays = 0;
    if (chatroomState === 'ordered') {
        remainingExtensionDays = MAX_EXTENSION_DAYS_ORDERED_STATE - currentTotalExtendedDaysInOrderedState;
    } else if (chatroomState === 'delivered') {
        remainingExtensionDays = MAX_EXTENSION_DAYS_DELIVERED_STATE - currentTotalExtendedDaysInDeliveredState;
    }
    // Ensure remainingExtensionDays is not negative
    remainingExtensionDays = Math.max(0, remainingExtensionDays);


    // State for the number of days the user wants to extend
    // Initialize with 1 or the max available if it's less than 1 (to avoid 0 if remainingExtensionDays is 0)
    const [daysToExtend, setDaysToExtend] = useState(remainingExtensionDays > 0 ? 1 : 0);

    // Determine if the single 1-day extension is available (before ordered state)
    // This logic correctly relies on the chatroomState and if the one-time extension has NOT been used.
    const canDoOneTimeExtensionLogic = (chatroomState === 'waiting' || chatroomState === 'active') && !hasExtendedOnceBeforeOrdered;


    // Determine if multi-day extension is available for 'ordered' state
    const canDoMultiDayExtensionOrdered = chatroomState === 'ordered' && remainingExtensionDays > 0;
    // Determine if multi-day extension is available for 'delivered' state
    const canDoMultiDayExtensionDelivered = chatroomState === 'delivered' && remainingExtensionDays > 0;

    // Add console logs for calculated flags
    console.log("  remainingExtensionDays:", remainingExtensionDays);
    console.log("  canDoOneTimeExtensionLogic:", canDoOneTimeExtensionLogic);
    console.log("  canDoMultiDayExtensionOrdered:", canDoMultiDayExtensionOrdered);
    console.log("  canDoMultiDayExtensionDelivered:", canDoMultiDayExtensionDelivered);


    // Calculate dynamic message for current time left display
    const timeLeftMessage = timeLeft.hours > 0 || timeLeft.minutes > 0
        ? `${timeLeft.hours}h ${timeLeft.minutes}m`
        : "Less than a minute";

    // Generate options for the dropdown based on the current state's remaining days
    const extensionOptions = Array.from({ length: remainingExtensionDays }, (_, i) => i + 1);

    // Determine the descriptive message for the modal
    let descriptiveMessage = "";
    if (canDoOneTimeExtensionLogic) {
        descriptiveMessage = "You can extend the chat time only once by 1 day before the order is placed.";
    } else if (canDoMultiDayExtensionOrdered) {
        descriptiveMessage = `You can extend the chat time multiple times, up to a total of ${MAX_EXTENSION_DAYS_ORDERED_STATE} days. You have already extended by ${currentTotalExtendedDaysInOrderedState} day${currentTotalExtendedDaysInOrderedState !== 1 ? 's' : ''} in the ordered state.`;
    } else if (canDoMultiDayExtensionDelivered) { 
        descriptiveMessage = `You can extend the chat time multiple times, up to a total of ${MAX_EXTENSION_DAYS_DELIVERED_STATE} days. You have already extended by ${currentTotalExtendedDaysInDeliveredState} day${currentTotalExtendedDaysInDeliveredState !== 1 ? 's' : ''} in the delivered state.`;
    } else {
        descriptiveMessage = "No more extensions available for this chatroom in its current state.";
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Icon */}
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="relative">
                        <Clock className="w-10 h-10 text-yellow-600" />
                        {/* Consider adding AlertTriangle conditionally if time is very low */}
                    </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    You're running out of time!
                </h3>
                <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                    {descriptiveMessage}
                </p>

                {/* Current Time Display */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">Current time left:</p>
                    <p className="text-lg font-bold text-gray-900">
                        {timeLeftMessage}
                    </p>
                </div>

                {/* Extension Options */}
                {canDoOneTimeExtensionLogic && (
                    <button
                        onClick={() => onExtend(1)} // Always 1 day for this case
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 px-6 rounded-2xl transition-colors mb-3"
                    >
                        Extend Time (+1 Day)
                    </button>
                )}

                {(canDoMultiDayExtensionOrdered || canDoMultiDayExtensionDelivered) && ( // Apply to both ordered and delivered multi-day extensions
                    <div className="space-y-4">
                        <div className="flex flex-col items-center">
                            <label htmlFor="daysToExtend" className="text-sm font-medium text-gray-700 mb-2">
                                Extend by (days):
                            </label>
                            <select
                                id="daysToExtend"
                                value={daysToExtend}
                                onChange={(e) => setDaysToExtend(parseInt(e.target.value))}
                                className="w-24 text-center border border-gray-300 rounded-lg p-2 text-lg font-bold bg-white appearance-none pr-8 cursor-pointer"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em' }}
                            >
                                {extensionOptions.map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Max additional extension: {remainingExtensionDays} day{remainingExtensionDays !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            onClick={() => onExtend(daysToExtend)}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 px-6 rounded-2xl transition-colors mb-3"
                            disabled={daysToExtend <= 0 || daysToExtend > remainingExtensionDays}
                        >
                            Extend Time (+{daysToExtend} Day{daysToExtend !== 1 ? 's' : ''})
                        </button>
                    </div>
                )}

                {/* Message if no extensions available at all (in states other than waiting/active/ordered/delivered, or when limits are reached) */}
                {!canDoOneTimeExtensionLogic && !canDoMultiDayExtensionOrdered && !canDoMultiDayExtensionDelivered && (
                    <p className="text-red-500 text-sm mb-3">This chatroom has reached its maximum extension limit or cannot be extended in its current state.</p>
                )}

                {/* Cancel Button */}
                <button
                    onClick={onClose}
                    className="w-full text-gray-600 font-medium py-2"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
