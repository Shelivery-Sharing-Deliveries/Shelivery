import React from "react";
import { Button } from "@/components/ui/Button";

interface ShareButtonProps {
  content: string;
}

const ShareButton = ({ content }: ShareButtonProps) => {
  const handleShare = async (): Promise<void> => {
    // Check if we're in a secure context and have user activation
    if (!window.isSecureContext) {
      console.warn('Share API requires secure context (HTTPS)');
      await fallbackCopyToClipboard();
      return;
    }
  
    // Enhanced Web Share API check
    if (navigator.share && navigator.canShare) {
      // Check if the data can be shared
      const shareData = {
        text: content,
        // Optional: add title and url if needed
        // title: 'My App',
        // url: window.location.href
      };
  
      try {
        // Verify the data can be shared before attempting
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          console.log("Shared successfully!");
          return;
        }
      } catch (err: unknown) {
        console.error("Error sharing:", err);
        // Fall through to clipboard fallback
      }
    }
  
    // Enhanced clipboard fallback
    await fallbackCopyToClipboard();
  };
  
  const fallbackCopyToClipboard = async (): Promise<void> => {
    try {
      // Modern clipboard API (preferred)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
        showShareFeedback("Text copied! You can now share it anywhere.");
      } else {
        // Legacy fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            showShareFeedback("Text copied! You can now share it anywhere.");
          } else {
            throw new Error('Copy command failed');
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err: unknown) {
      console.error("Copy failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      showShareFeedback(`Unable to copy text: ${errorMessage}`, true);
    }
  };
  
  // Better user feedback function with proper types
  const showShareFeedback = (message: string, isError: boolean = false): void => {
    // You can replace this with a toast notification, modal, or other UI feedback
    if (isError) {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
    
    // Alternative: Use a custom toast/notification system
    // showToast(message, isError ? 'error' : 'success');
  };

  return (
    <Button
      onClick={handleShare}
      variant="primary"
    >
      {/* Share icon SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
      Share
    </Button>
  );
};

export default ShareButton;