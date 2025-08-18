"use client"; // This component is a client component for potential future interactivity

import React, { useEffect, useState } from 'react'; // Added useState and useEffect
import Image from 'next/image'; // For optimized images
// import Link from 'next/link';   // Removed: No longer directly using Link for these buttons
import { useSearchParams } from 'next/navigation'; // Added: Import useSearchParams

export default function AboutPage() {
  const [inviteCodeFromUrl, setInviteCodeFromUrl] = useState<string | null>(null); // Added: State to store invite code from URL
  const searchParams = useSearchParams(); // Added: Initialize useSearchParams

  // Added: New useEffect to read invite code from URL
  useEffect(() => {
    const invite = searchParams.get('invite');
    if (invite) {
      setInviteCodeFromUrl(invite);
      console.log("AboutPage: Detected invite code in URL:", invite);
    }
  }, [searchParams]); // Depend on searchParams to re-run if URL changes

  // Corrected: Construct the dynamic href as a STRING for "Get Started" links
  // This ensures compatibility with standard <a> tags.
  const authLinkHref = inviteCodeFromUrl
    ? `/auth?invite=${inviteCodeFromUrl}`
    : "/auth";

  return (
    // Main container for the entire page, applying the dominant background color
    // and ensuring content is centered and takes full height.
    <div className="flex flex-col items-center min-h-screen font-poppins text-white" style={{ backgroundColor: '#245b7b' }}>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center w-full max-w-[1600px] px-8 py-16 gap-12 lg:gap-24">
        {/* Left Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-1/2">
          {/* Logo - Assuming shelivery-logo2.svg exists in /public/icons/ */}
          <Image
            src="/icons/shelivery-logo2.svg"
            alt="Shelivery Logo"
            width={120} // Adjust size as needed
            height={120}
            className="mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFD700' }}>
            Shelivery Project
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Sustainable Progress Goals<br />Report June 2025
          </p>
          {/* Get Started Button - Now using <a> tag with dynamic string href */}
          <a href={authLinkHref}
             className="rounded-lg px-6 py-3 text-base font-semibold shadow-sm hover:opacity-80 transition-opacity"
             style={{
               backgroundColor: '#FFD700', // Exact yellow from Canva
               color: '#245b7b',            // Exact dark blue from Canva
               border: 'none',
             }}
          >
            GET STARTED
          </a>
        </div>

        <div className="lg:w-1/2 flex justify-center items-center h-[40vh]">
          <Image
            src="/images/about.png"
            alt="Shelivery Basket"
            width={0}
            height={0}
            sizes="100vw"
            className="h-full w-auto object-contain "
          />
        </div>
      </section>

      {/* Problem Section */}
      <section className="w-full py-16 px-8" style={{ backgroundColor: '#235B75' }}> {/* Slightly different blue from Canva */}
        <div className="max-w-[1600px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FFD700' }}>
            The Problem
          </h2>
          <p className="text-lg md:text-xl mb-12 text-white">
            Delivery Costs & Coordination Hassles
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Problem 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              {/* Icon - Placeholder */}
              <Image src="/icons/wallet.svg" alt="High Fees" width={60} height={60} className="mb-4" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFD700' }}>High Delivery Fees</h3>
              <p className="text-base text-white">Individual orders often come with hefty delivery charges, making everyday essentials expensive for students.</p>
            </div>
            {/* Problem 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              {/* Icon - Placeholder */}
              <Image src="/icons/clock.svg" alt="Time-Consuming" width={60} height={60} className="mb-4" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFD700' }}>Time-Consuming Coordination</h3>
              <p className="text-base text-white">Organizing group orders manually is a headache, involving endless messages and missed deadlines.</p>
            </div>
            {/* Problem 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              {/* Icon - Placeholder */}
              <Image src="/icons/group.svg" alt="Lack of Visibility" width={60} height={60} className="mb-4" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFD700' }}>Lack of Group Order Visibility</h3>
              <p className="text-base text-white">It's hard to see who's ordering what, leading to duplicate orders or missed opportunities for shared savings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="w-full py-16 px-8" style={{ backgroundColor: '#245b7b' }}> {/* Dark blue background */}
        <div className="max-w-[1600px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FFD700' }}>
            The Solution
          </h2>
          <p className="text-lg md:text-xl mb-12 text-white">
            Shelivery: Group Shopping for Dormitories
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Solution 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              {/* Icon - Placeholder */}
              <Image src="/icons/shopping-bag.svg" alt="Cost Savings" width={60} height={60} className="mb-4" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFD700' }}>Cost Savings</h3>
              <p className="text-base text-white">By pooling orders, Shelivery helps you reach minimum order values and split delivery fees, saving you money.</p>
            </div>
            {/* Solution 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              {/* Icon - Placeholder */}
              <Image src="/icons/chat.svg" alt="Effortless Coordination" width={60} height={60} className="mb-4" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFD700' }}>Effortless Coordination</h3>
              <p className="text-base text-white">Our intuitive platform simplifies communication, making group orders smooth and stress-free.</p>
            </div>
            {/* Solution 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              {/* Icon - Placeholder */}
              <Image src="/icons/delivery.svg" alt="Streamlined Deliveries" width={60} height={60} className="mb-4" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFD700' }}>Streamlined Deliveries</h3>
              <p className="text-base text-white">Track orders, manage payments, and ensure everyone gets their share with ease, right to your dorm.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 px-8" style={{ backgroundColor: '#235B75' }}> {/* Slightly different blue from Canva */}
        <div className="max-w-[1600px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FFD700' }}>
            How it Works
          </h2>
          <p className="text-lg md:text-xl mb-12 text-white">
            Simple Steps to Group Shopping
          </p>

          <div className="flex flex-col gap-16">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <div className="lg:w-1/2 text-center lg:text-left">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#FFD700' }}>1. Create a Basket</h3>
                <p className="text-base text-white">Navigate through the dashboard to create your a Shelivery basket.</p>
              </div>
              <div className="lg:w-1/2 flex justify-center">
                {/* Placeholder image. Replace with your actual step 1 image. */}
                <Image src="/images/dashboard.png" alt="Create Basket" width={300} height={100} className="rounded-lg " />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
              <div className="lg:w-1/2 text-center lg:text-right">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#FFD700' }}>2. Choose a shop and provide your items detail</h3>
                <p className="text-base text-white">Select your preferred shop and enter the product link, a short note about the item (e.g., color, size, special instructions), and the order price. This will help processing your request accurately and quickly.</p>
              </div>
              <div className="lg:w-1/2 flex justify-center">
                {/* Placeholder image. Replace with your actual step 2 image. */}
                <Image src="/images/shop.png" alt="Share with Dormmates" width={300} height={100} className="rounded-lg" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <div className="lg:w-1/2 text-center lg:text-left">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#FFD700' }}>3. Wait for others to join!</h3>
                <p className="text-base text-white">Invite your dormmates to join your basket or wait for others to join. Others can add their items, and you can track the total amount together.</p>
                <p className="text-base text-white">Once the minimum amount is reached or time is up, you will be directed to a chatroom. You can finlaize the order submission together! </p>
                <p className="text-base text-white">Enjoy shared savings and convenient delivery!</p>
              </div>
              <div className="lg:w-1/2 flex justify-center">
                {/* Placeholder image. Replace with your actual step 3 image. */}
                <Image src="/images/pool.png" alt="Place Order" width={300} height={100} className="rounded-lg " />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action / Footer */}
      <footer className="w-full py-16 px-8 text-center" style={{ backgroundColor: '#245b7b' }}> {/* Dark blue background */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FFD700' }}>
          Ready to start saving?
        </h2>
        <p className="text-lg md:text-xl mb-8 text-white">
          Join Shelivery today and revolutionize your dorm shopping experience.
        </p>
        {/* Now using <a> tag with dynamic string href */}
        <a href={authLinkHref}
           className="rounded-lg px-6 py-3 text-base font-semibold shadow-sm hover:opacity-80 transition-opacity"
           style={{
             backgroundColor: '#FFD700', // Exact yellow from Canva
             color: '#245b7b',            // Exact dark blue from Canva
             border: 'none',
           }}>
          GET STARTED
        </a>
        <p className="text-sm mt-16 text-gray-400">
          © 2025 Shelivery. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
