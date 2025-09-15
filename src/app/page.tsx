'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import PWAInstallGuidePopup from '@/components/homepage/PWAInstallGuidePopup';
import { incrementInviteCounter } from '@/lib/invites';
import { getInviteCodeFromUrlOrStorage } from '@/lib/invite-storage';

// Separate component that uses useSearchParams
function HomePageContent() {
  const [showPwaPopup, setShowPwaPopup] = useState(false);
  const [checkingPwa, setCheckingPwa] = useState(true); // For loading state while detecting PWA
  const [inviteCodeFromUrl, setInviteCodeFromUrl] = useState<string | null>(null); // State to store invite code from URL
  const counterIncrementedRef = useRef<string | null>(null); // Track which invite code we've already incremented

  const router = useRouter();
  const searchParams = useSearchParams(); // Initialize useSearchParams

  // Detect PWA and redirect
  useEffect(() => {
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isInStandaloneMode) {
      router.replace('/dashboard');
    } else {
      // For web users, also redirect to dashboard to let them explore
      //router.replace('/dashboard');
      setCheckingPwa(false);
    }
  }, []);

  // New useEffect to read invite code from URL or localStorage
  useEffect(() => {
    // Get invite code from URL or localStorage (URL takes priority)
    const invite = getInviteCodeFromUrlOrStorage(searchParams);
    
    if (invite) {
      setInviteCodeFromUrl(invite);
      console.log("HomePage: Using invite code:", invite);
      
      // Increment counter only if we haven't already done it for this invite code
      if (counterIncrementedRef.current !== invite) {
        counterIncrementedRef.current = invite;
        incrementInviteCounter(invite).then((success) => {
          if (success) {
            console.log(`HomePage: Successfully incremented counter for invite code: ${invite}`);
          } else {
            console.log(`HomePage: Failed to increment counter for invite code: ${invite} (code may not exist in database)`);
          }
        }).catch((error) => {
          console.error(`HomePage: Error incrementing counter for invite code ${invite}:`, error);
        });
      }
    }
  }, [searchParams]); // Depend on searchParams to re-run if URL changes

  // Construct the dynamic href for the "Get Started" button (to Auth page)
  // Now always a string, converting the object format if necessary.
  const getStartedHref = inviteCodeFromUrl 
    ? `/auth?invite=${inviteCodeFromUrl}` 
    : "/auth";

  // Construct the dynamic href for the "Learn more" button (to About page)
  // Now always a string, converting the object format if necessary.
  const learnMoreHref = inviteCodeFromUrl
    ? `/about?invite=${inviteCodeFromUrl}`
    : "/about";

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
              href={getStartedHref} // Dynamically set the href here (now a string)
              className="rounded-lg px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shelivery-primary-yellow"
              style={{
                backgroundColor: '#FFD700',
                color: '#1E566F',
              }}
            >
              Get Started
            </a>

            <a
              href={learnMoreHref} // Dynamically set the href for Learn more (now a string)
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

// Main component wrapped with Suspense
export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
