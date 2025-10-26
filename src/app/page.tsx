'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { incrementInviteCounter } from '@/lib/invites';
import { getInviteCodeFromUrlOrStorage } from '@/lib/invite-storage';

// Separate component that uses useSearchParams
function HomePageContent() {
  const counterIncrementedRef = useRef<string | null>(null); // Track which invite code we've already incremented

  const router = useRouter();
  const searchParams = useSearchParams();

  // Always redirect to dashboard after background functions complete
  useEffect(() => {
    // Small delay to ensure invite code processing finishes before redirect
    setTimeout(() => {
      router.replace('/dashboard');
    }, 2000); // 2 second delay for better UX
  }, []);

  // Handle invite code from URL or localStorage
  useEffect(() => {
    // Get invite code from URL or localStorage (URL takes priority)
    const invite = getInviteCodeFromUrlOrStorage(searchParams);

    if (invite) {
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


  // Always show loading screen and redirect to dashboard
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

// Loading component for homepage that matches the app's design
function HomePageLoading() {
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

// Main component wrapped with Suspense
export default function HomePage() {
  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomePageContent />
    </Suspense>
  );
}
