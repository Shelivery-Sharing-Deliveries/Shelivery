"use client";

import { Navigation } from "./Navigation"; // Assuming Navigation is in the same folder or adjust path
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode; // Keeping footer prop as requested
  showNavigation?: boolean;
  className?: string; // Applies to the scrollable content area
}

export function PageLayout({ 
  children, 
  header, 
  footer, 
  showNavigation = true, 
  className = "" 
}: PageLayoutProps) {

  // Determine padding-bottom for the scrollable content based on footer or default navigation
  // If there's a footer, we need to account for its height. Otherwise, use original navigation padding.
  const contentPaddingBottom = footer
    ? 'pb-[80px]' // Enough space for a typical button/footer (h-14 button + padding)
    : (showNavigation ? 'pb-[90px]' : 'pb-[18px]'); // Original logic for navigation or no footer

  return (
    <div className="min-h-screen bg-[#245B7B] relative flex justify-center">
      {/*
        Removed min-h-screen from this div.
        It will now take height based on its content or expand due to flex-1 on its child.
        The outer div (min-h-screen) ensures the overall layout is at least full screen.
      */}
      <div className="w-[calc(100vw-25px)] md:w-[375px] bg-white rounded-t-[30px] md:mx-[10px] flex flex-col">
        {/* Fixed Header - Optional */}
        {header && (
          <div className="sticky top-0 z-10 bg-white rounded-t-[30px] px-4 pt-[18px] pb-4 border-b border-gray-100 shadow-sm">
            {header}
          </div>
        )}
        
        {/* Scrollable Content */}
        {/*
          flex-1 allows this div to grow and take available space.
          overflow-y-auto ensures scrolling only happens when content exceeds available height.
        */}
        <div className={`flex-1 overflow-y-auto px-4 ${header ? 'pt-0' : 'pt-[18px]'} ${contentPaddingBottom} ${className}`}>
          {children}
        </div>
        
        {/* Fixed Footer - Renders custom footer if provided */}
        {footer && (
          <div className="fixed bottom-0 left-0 right-0 z-20 w-full md:w-[375px] md:left-1/2 md:-translate-x-1/2">
            {footer}
          </div>
        )}

        {/* Fixed Navigation - Renders ONLY if no custom footer and showNavigation is true */}
        {!footer && showNavigation && (
          <div className="fixed bottom-0 left-0 right-0 z-20 w-full md:w-[375px] md:left-1/2 md:-translate-x-1/2">
            <Navigation />
          </div>
        )}
      </div>
    </div>
  );
}
