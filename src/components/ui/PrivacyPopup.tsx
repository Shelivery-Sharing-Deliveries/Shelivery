// src/components/ui/PrivacyPopup.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

interface PrivacyPopupProps {
  onAccept: () => void;
}

const PrivacyPopup: React.FC<PrivacyPopupProps> = ({ onAccept }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const accepted = localStorage.getItem("privacyAccepted");
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setCanAccept(true);
      }
    }
  };

  const handleAccept = () => {
    localStorage.setItem("privacyAccepted", "true");
    setIsOpen(false);
    if (onAccept) onAccept();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm px-2">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 m-4 flex flex-col items-center text-center max-h-4/5 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Shelivery Privacy Policy</h2>
        <div ref={contentRef} onScroll={handleScroll} className="privacy-policy-text h-72 overflow-y-scroll mb-4 border border-gray-200 p-2 rounded">
          <PrivacyPolicyContent />
        </div>
        <button 
          onClick={handleAccept} 
          disabled={!canAccept}
          className="w-full bg-[#111827] text-white font-semibold py-3 px-4 rounded-full shadow-md transition-colors disabled:bg-gray-400"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default PrivacyPopup;