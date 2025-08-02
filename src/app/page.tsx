'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PWAInstallGuidePopup from '@/components/homepage/PWAInstallGuidePopup';

export default function HomePage() {
  const [showPwaPopup, setShowPwaPopup] = useState(false);
  const [checkingPwa, setCheckingPwa] = useState(true); // For loading state while detecting PWA
  const router = useRouter();

  // Detect PWA and redirect
  useEffect(() => {
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isInStandaloneMode) {
      router.replace('/dashboard');
    } else {
      setCheckingPwa(false); // Not PWA, show normal page
    }
  }, []);

  if (checkingPwa) {
    // Show spinner while checking
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center p-24"
        style={{
          backgroundColor: '#245b7b',
          color: 'white',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <img
          src="/icons/shelivery-logo2.svg"
          alt="Shelivery Logo"
          className="mx-auto h-24 sm:h-32 mb-6 animate-bounce"
        />
        <div className="mt-6 h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-24"
      style={{
        backgroundColor: '#245b7b',
        color: 'white',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div className="text-center">
        <img
          src="/icons/shelivery-logo2.svg"
          alt="Shelivery Logo"
          className="mx-auto h-24 sm:h-32 mb-6"
        />
        <h1 className="text-4xl font-bold tracking-tight text-shelivery-primary-yellow sm:text-6xl">
          Shelivery
        </h1>
        <p className="mt-6 text-lg leading-8 text-white">
          Group Shopping for Dormitories
        </p>
        <p className="mt-4 text-sm text-white">
          Share delivery costs and coordinate group orders with your dormmates
        </p>
        <div className="mt-10 flex flex-col items-center gap-y-4">
          <div className="flex gap-x-6">
            <a
              href="/auth"
              className="rounded-lg px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shelivery-primary-yellow"
              style={{
                backgroundColor: '#FFD700',
                color: '#1E566F',
              }}
            >
              Get Started
            </a>

            <a
              href="/about"
              className="rounded-lg px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: 'transparent',
                borderColor: '#FFD700',
                color: '#FFD700',
                borderWidth: '2px',
              }}
            >
              Learn more
            </a>
          </div>

          <button
            onClick={() => setShowPwaPopup(true)}
            className="rounded-lg px-8 py-2.5 text-sm font-semibold shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#FFD700',
              color: '#FFD700',
              borderWidth: '2px',
            }}
          >
            How to install the app
          </button>
        </div>
      </div>

      <PWAInstallGuidePopup isOpen={showPwaPopup} onClose={() => setShowPwaPopup(false)} />
    </main>
  );
}
