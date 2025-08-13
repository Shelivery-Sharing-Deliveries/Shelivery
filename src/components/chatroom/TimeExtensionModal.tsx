"use client";

import { useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TimeExtensionModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onExtend now accepts the number of days to extend
    onExtend: (days: number) => void;
    timeLeft: { hours: number; minutes: number };
    isOrderedState: boolean; // NEW: True if chatroom state is 'ordered'
    hasExtendedOnceBeforeOrdered: boolean; // NEW: True if the one-time extension has been used
    currentTotalExtendedDaysInOrderedState: number; // NEW: Total days extended in ordered state
}

export function TimeExtensionModal({
    isOpen,
    onClose,
    onExtend,
    timeLeft,
    isOrderedState,
    hasExtendedOnceBeforeOrdered,
    currentTotalExtendedDaysInOrderedState,
}: TimeExtensionModalProps) {
    if (!isOpen) return null;

    const MAX_EXTENSION_DAYS_ORDERED_STATE = 14; // Max 2 weeks (14 days)
    const remainingExtensionDays = MAX_EXTENSION_DAYS_ORDERED_STATE - currentTotalExtendedDaysInOrderedState;

    // State for the number of days the user wants to extend (only relevant in ordered state)
    // Initialize with 1 or the max available if it's less than 1 (to avoid 0 if remainingExtensionDays is 0)
    const [daysToExtend, setDaysToExtend] = useState(remainingExtensionDays > 0 ? 1 : 0);

    // Determine if the single 1-day extension is available (before ordered state)
    const canDoOneTimeExtension = !isOrderedState && !hasExtendedOnceBeforeOrdered;

    // Determine if multi-day extension is available (in ordered state)
    const canDoMultiDayExtension = isOrderedState && remainingExtensionDays > 0;

    // Calculate dynamic message for current time left display
    const timeLeftMessage = timeLeft.hours > 0 || timeLeft.minutes > 0
        ? `${timeLeft.hours}h ${timeLeft.minutes}m`
        : "Less than a minute";

    // Generate options for the dropdown
    const extensionOptions = Array.from({ length: remainingExtensionDays }, (_, i) => i + 1);

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
                        {/*<AlertTriangle className="w-5 h-5 text-orange-500 absolute -top-1 -right-1" />*/}
                    </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    You're running out of time!
                </h3>
                <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                    {canDoOneTimeExtension
                        ? "You can extend the chat time only once by 1 day before the order is placed."
                        : canDoMultiDayExtension
                            ? `You can extend the chat time multiple times, up to a total of ${MAX_EXTENSION_DAYS_ORDERED_STATE} days. You have already extended by ${currentTotalExtendedDaysInOrderedState} day${currentTotalExtendedDaysInOrderedState !== 1 ? 's' : ''}.`
                            : "No more extensions available for this chatroom."
                    }
                </p>

                {/* Current Time Display */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">Current time left:</p>
                    <p className="text-lg font-bold text-gray-900">
                        {timeLeftMessage}
                    </p>
                </div>

                {/* Extension Options */}
                {canDoOneTimeExtension && (
                    <button
                        onClick={() => onExtend(1)} // Always 1 day for this case
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 px-6 rounded-2xl transition-colors mb-3"
                    >
                        Extend Time (+1 Day)
                    </button>
                )}

                {canDoMultiDayExtension && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center">
                            <label htmlFor="daysToExtend" className="text-sm font-medium text-gray-700 mb-2">
                                Extend by (days):
                            </label>
                            {/* Replaced input type="number" with select for mobile friendliness */}
                            <select
                                id="daysToExtend"
                                value={daysToExtend}
                                onChange={(e) => setDaysToExtend(parseInt(e.target.value))}
                                className="w-24 text-center border border-gray-300 rounded-lg p-2 text-lg font-bold bg-white appearance-none pr-8 cursor-pointer" // appearance-none to remove default arrow, pr-8 for custom arrow spacing
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
                            // Disable if no days selected, or if selected days exceed remaining limit
                            disabled={daysToExtend <= 0 || daysToExtend > remainingExtensionDays}
                        >
                            Extend Time (+{daysToExtend} Day{daysToExtend !== 1 ? 's' : ''})
                        </button>
                    </div>
                )}

                {/* Message if no extensions available at all */}
                {!canDoOneTimeExtension && !canDoMultiDayExtension && (
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
