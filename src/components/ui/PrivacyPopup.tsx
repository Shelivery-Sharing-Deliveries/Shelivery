// src/components/ui/PrivacyPopup.tsx
"use client";

import React, { useState, useEffect } from "react";
import PrivacyPolicyContent from "./PrivacyPolicyContent";
import TermsOfServiceContent from "./TermsOfServiceContent";

interface PrivacyPopupProps {
  onAccept: (termsAccepted: boolean, privacyAccepted: boolean) => void;
  onBack?: () => void;
}

type ViewMode = 'checkboxes' | 'terms' | 'privacy';

const PrivacyPopup: React.FC<PrivacyPopupProps> = ({ onAccept, onBack }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('checkboxes');

  useEffect(() => {
    const accepted = localStorage.getItem("privacyAccepted");
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleSave = () => {
    if (termsAccepted && privacyAccepted) {
      localStorage.setItem("privacyAccepted", "true");
      setIsOpen(false);
      onAccept(termsAccepted, privacyAccepted);
    }
  };

  const handleBackToCheckboxes = () => {
    setViewMode('checkboxes');
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (viewMode) {
      case 'terms':
        return (
          <>
            <div className="flex justify-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Terms of Service</h2>
            </div>
            <div className="h-72 overflow-y-scroll mb-4 border border-gray-200 p-4 rounded text-left">
              <TermsOfServiceContent />
            </div>
            <button
              onClick={handleBackToCheckboxes}
              className="w-full bg-[#FFE75B] text-black font-semibold py-3 px-4 rounded-full shadow-md transition-colors"
            >
              Back
            </button>
          </>
        );
      
      case 'privacy':
        return (
          <>
            <div className="flex justify-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Privacy Policy</h2>
            </div>
            <div className="h-72 overflow-y-scroll mb-4 border border-gray-200 p-4 rounded text-left">
              <PrivacyPolicyContent />
            </div>
            <button
              onClick={handleBackToCheckboxes}
              className="w-full bg-[#FFE75B] text-black font-semibold py-3 px-4 rounded-full shadow-md transition-colors"
            >
              Back
            </button>
          </>
        );
      
      default: // checkboxes
        return (
          <>
            <div className="flex items-center justify-between w-full mb-6">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  ← Back
                </button>
              )}
              <h2 className="text-xl font-bold text-gray-900">Agreement Required</h2>
              <div className="w-12"></div> {/* Spacer for centering */}
            </div>
            <div className="w-full space-y-4 mb-6">
              {/* Terms of Service Checkbox */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms-checkbox" className="text-sm text-gray-700 text-left">
                  I agree to the{' '}
                  <button
                    onClick={() => setViewMode('terms')}
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Terms of Service
                  </button>
                </label>
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="privacy-checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="privacy-checkbox" className="text-sm text-gray-700 text-left">
                  I agree to the{' '}
                  <button
                    onClick={() => setViewMode('privacy')}
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!termsAccepted || !privacyAccepted}
              className="w-full bg-[#FFE75B] text-black font-semibold py-3 px-4 rounded-full shadow-md transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm px-2">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 m-4 flex flex-col items-center text-center max-h-[90vh] overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default PrivacyPopup;
