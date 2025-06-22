"use client";

import { useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TimeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: () => void;
  timeLeft: { hours: number; minutes: number };
}

export function TimeExtensionModal({
  isOpen,
  onClose,
  onExtend,
  timeLeft,
}: TimeExtensionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full">
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-0">
          <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="relative">
              <Clock className="w-10 h-10 text-yellow-600" />
              <AlertTriangle className="w-5 h-5 text-orange-500 absolute -top-1 -right-1" />
            </div>
          </div>

          {/* Title and Description */}
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            You running out of time
          </h3>
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            You can extend the chat time only once. Make sure to place the group
            order before it ends.
          </p>

          {/* Current Time Display */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Current time left:</p>
            <p className="text-lg font-bold text-gray-900">
              {timeLeft.hours}h {timeLeft.minutes}m
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              onExtend();
              onClose();
            }}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 px-6 rounded-2xl transition-colors mb-3"
          >
            Extend Time (+2 hours)
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full text-gray-600 font-medium py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
