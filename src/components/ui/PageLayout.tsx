"use client";

import { Navigation } from "./Navigation";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  showNavigation?: boolean;
  className?: string;
}

export function PageLayout({ 
  children, 
  header, 
  showNavigation = true, 
  className = "" 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#245B7B] relative flex justify-center">
      <div className="w-[calc(100vw-25px)] md:w-[375px] bg-white rounded-t-[30px] min-h-screen md:mx-[10px] flex flex-col">
        {/* Fixed Header - Optional */}
        {header && (
          <div className="sticky top-0 z-10 bg-white rounded-t-[30px] px-3 pt-[18px] pb-4 border-b border-gray-100">
            {header}
          </div>
        )}
        
        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto px-3 ${header ? 'pt-0' : 'pt-[18px]'} ${showNavigation ? 'pb-[90px]' : 'pb-[18px]'} ${className}`}>
          {children}
        </div>
        
        {/* Fixed Navigation - Optional */}
        {showNavigation && (
          <div className="fixed bottom-0 left-0 right-0 z-20">
            <Navigation />
          </div>
        )}
      </div>
    </div>
  );
}
