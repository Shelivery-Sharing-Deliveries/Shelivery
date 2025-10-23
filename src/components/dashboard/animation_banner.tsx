"use client";

import React, { useState, useEffect } from "react";

interface AnimationBannerProps {
  className?: string;
  id?: string;
}

export default function AnimationBanner({ className = "", id }: AnimationBannerProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Start the single animation sequence after component mounts with delay
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`w-full py-2 ${className}`} id={id}>
      <div className="bg-shelivery-card-background border border-shelivery-card-border rounded-shelivery-lg p-shelivery-6 shadow-shelivery-md min-h-[420px] ">
        {/* Header */}
        <div className="text-center mb-shelivery-6">
          <h2 className="text-shelivery-text-primary font-poppins font-semibold text-lg">
            ORDER OVERVIEW
          </h2>
        </div>

        {/* Order Details */}
        <div className="space-y-shelivery-4">
          {/* Subtotal */}
          <div className="flex justify-between items-start">
            <span className="text-shelivery-text-secondary font-medium">Subtotal</span>
            <div className="flex flex-col items-end min-w-[100px]">
              <span className="font-semibold text-shelivery-text-primary">
                45.00 CHF
              </span>
            </div>
          </div>

          {/* Estimated Shipping Cost */}
          <div className="flex justify-between items-start">
            <span className="text-shelivery-text-secondary font-medium whitespace-nowrap">Estimated Shipping Cost</span>
            <div className="flex flex-col items-end min-w-[100px]">
              <span
                className={`relative font-semibold transition-all duration-1000 ease-in-out ${
                  hasAnimated ? 'text-red-500 opacity-50 line-through' : 'text-shelivery-text-primary'
                }`}
              >
                10.00 CHF
                {hasAnimated && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 20">
                    <path
                      d="M5 10 Q30 8 55 10 T95 10"
                      stroke="red"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-marker-stroke-1"
                      style={{ animationDelay: '0.5s', animationDuration: '2.0s' }}
                    />
                  </svg>
                )}
              </span>
              {hasAnimated && (
                <span className="font-bold text-lg text-shelivery-success-green animate-fade-in mt-1" style={{ animationDelay: '2.8s', animationDuration: '0.6s' }}>
                  0.00 CHF
                </span>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-start pt-shelivery-2 border-t border-shelivery-card-border">
            <span className="text-shelivery-text-primary font-semibold text-lg">Total</span>
            <div className="flex flex-col items-end min-w-[110px]">
              <span
                className={`relative font-bold text-xl transition-all duration-1000 ease-in-out ${
                  hasAnimated ? 'text-red-500 opacity-50 line-through' : 'text-shelivery-text-primary'
                }`}
              >
                55.00 CHF
                {hasAnimated && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 110 24">
                    <path
                      d="M5 12 Q30 10 55 12 T105 12"
                      stroke="red"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      className="animate-marker-stroke-1"
                      style={{ animationDelay: '3.5s', animationDuration: '2.0s' }}
                    />
                  </svg>
                )}
              </span>
              {hasAnimated && (
                <span className="font-bold text-2xl text-shelivery-success-green animate-fade-in mt-1" style={{ animationDelay: '5.8s', animationDuration: '0.6s' }}>
                  45.00 CHF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Make It Shared Section - Handwritten Style */}
        {hasAnimated && (
          <div className="mt-shelivery-4 pt-shelivery-2 ">
            {/* Arrow and Text Side by Side */}
            <div className="flex items-center justify-center gap-shelivery-4 mb-shelivery-3">
              {/* Downward arrow - Bigger size */}
              <svg
                className="w-16 h-16 animate-bounce-minimal"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ animationDelay: '6.5s' }}
              >
                {/* Downward arrow with more organic/hand-drawn style */}
                <path
                  d="M32 8 L32 48"
                  stroke="#10B981"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className="animate-draw-line"
                  style={{ animationDelay: '6.5s', animationDuration: '0.7s' }}
                />
                <path
                  d="M20 38 L32 50 L44 38"
                  stroke="#10B981"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-draw-arrowhead"
                  style={{ animationDelay: '7.0s', animationDuration: '0.5s' }}
                />
              </svg>

              {/* Handwritten "Make It Shared" */}
              <div className="relative">
                <h3 className="font-handwriting text-2xl text-shelivery-success-green animate-fade-in transform scale-105" style={{ animationDelay: '6.5s', animationDuration: '0.6s' }}>
                  Make It Shared
                </h3>

                {/* Handwritten underline */}
                <svg className="absolute -bottom-1 left-0 w-full h-4" viewBox="0 0 140 16">
                  <path
                    d="M10 8 Q25 6 40 8 T70 8 Q90 10 110 8 T130 8"
                    stroke="#10B981"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    className="animate-marker-underline"
                    style={{ animationDelay: '7.0s', animationDuration: '1.0s' }}
                  />
                </svg>
              </div>
            </div>

            <p className="text-shelivery-text-secondary text-sm text-center animate-fade-in" style={{ animationDelay: '7.5s', animationDuration: '0.6s' }}>
              Share the cost and save together!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
