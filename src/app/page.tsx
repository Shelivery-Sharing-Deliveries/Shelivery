// app/page.tsx
'use client'; // This directive is necessary for client-side interactivity in Next.js App Router

import React, { useState } from 'react';
// Import the PWAInstallGuidePopup component
import PWAInstallGuidePopup from '@/components/homepage/PWAInstallGuidePopup'; // Adjust the path if your structure is different

export default function HomePage() {
  // State to manage the visibility of the PWA install pop-up
  const [showPwaPopup, setShowPwaPopup] = useState<boolean>(false);

  // Function to open the PWA install pop-up
  const openPwaPopup = () => {
    setShowPwaPopup(true);
  };

  // Function to close the PWA install pop-up
  const closePwaPopup = () => {
    setShowPwaPopup(false);
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-24"
      style={{
        backgroundColor: '#245b7b', // Specific background color from original landing page
        color: 'white',              // General font color for the page
        fontFamily: 'Poppins, sans-serif' // Apply Poppins font to the whole page
      }}
    >
      <div className="text-center">
        {/* NEW: Shelivery Logo */}
        {/* Placed above the h1, centered with mx-auto, and given some bottom margin for spacing.
            Adjust h-24/h-32 (height) as needed for your desired size. */}
        <img
          src="/icons/shelivery-logo2.svg" // Path to your SVG in the public directory
          alt="Shelivery Logo"
          className="mx-auto h-24 sm:h-32 mb-6" // Centered horizontally, responsive height, and margin-bottom
        />

        {/* STEP 2: Color of Font (Specific - Shelivery Yellow) */}
        <h1 className="text-4xl font-bold tracking-tight text-shelivery-primary-yellow sm:text-6xl">
          Shelivery
        </h1>
        {/* STEP 2: Color of Font (Specific - White for description) */}
        <p className="mt-6 text-lg leading-8 text-white">
          Group Shopping for Dormitories
        </p>
        {/* STEP 2: Color of Font (Specific - White for detailed description) */}
        <p className="mt-4 text-sm text-white">
          Share delivery costs and coordinate group orders with your dormmates
        </p>
        <div className="mt-10 flex flex-col items-center gap-y-4">
          {/* Top row with two buttons */}
          <div className="flex gap-x-6">
            {/* Get Started Button */}
            <a
              href="/auth"
              className="rounded-lg px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shelivery-primary-yellow"
              style={{
                backgroundColor: '#FFD700',
                color: '#1E566F'
              }}
            >
              Get Started
            </a>

            {/* Learn More Button */}
            <a
              href="#features"
              className="rounded-lg px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: 'transparent',
                borderColor: '#FFD700',
                color: '#FFD700',
                borderWidth: '2px'
              }}
            >
              Learn more
            </a>
          </div>

          {/* Bottom centered button */}
          <button
            onClick={openPwaPopup}
            className="rounded-lg px-8 py-2.5 text-sm font-semibold shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#FFD700',
              color: '#FFD700',
              borderWidth: '2px'
            }}
          >
            How to install the app
          </button>
        </div>
      </div>

      {/* Render the PWAInstallGuidePopup component */}
      <PWAInstallGuidePopup isOpen={showPwaPopup} onClose={closePwaPopup} />
    </main>
  );
}
