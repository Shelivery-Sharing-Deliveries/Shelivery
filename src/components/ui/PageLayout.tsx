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

  return (
    <div className="min-h-screen bg-[#245B7B] relative flex justify-center">
      {/* Rounded content container */}
      <div className="w-[calc(100vw-25px)] md:w-[375px] bg-white rounded-[30px] md:mx-[10px] flex flex-col overflow-hidden relative" style={{ height: showNavigation && !footer ? 'calc(100vh - 148px)' : '100vh', marginBottom: showNavigation && !footer ? '148px' : '0' }}>
        
        {/* Fixed Header - Optional */}
        {header && (
          <div className="flex-shrink-0 bg-white rounded-t-[30px] px-4 pt-[18px] pb-4 border-b border-gray-100 shadow-sm z-10">
            {header}
          </div>
        )}
        
        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto px-4 ${header ? 'pt-0' : 'pt-[18px]'} ${footer ? 'pb-[80px]' : 'pb-[18px]'} ${className}`}>
          {children}
        </div>
        
        {/* Fixed Footer within rounded container */}
        {footer && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-b-[30px]">
            {footer}
          </div>
        )}
      </div>

      {/* Fixed Navigation outside rounded container - touches bottom */}
      {!footer && showNavigation && (
        <div className="fixed bottom-0 left-0 right-0 z-20 w-full md:w-[375px] md:left-1/2 md:-translate-x-1/2">
          <Navigation />
        </div>
      )}
    </div>
  );
}
