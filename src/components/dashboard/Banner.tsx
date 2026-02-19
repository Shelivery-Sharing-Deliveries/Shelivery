// components/dashboard/Banner.tsx
"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Tables } from "@/lib/supabase"; // type helper
import React from "react";

interface BannerProps {
    className?: string;
    id?: string;
}

// UPDATED: Include 'link' in the Banner type definition
type Banner = Tables<"banner"> & {
    link: string | null; // Assuming 'link' column is of type text and nullable
};

export default function Banner({ className = "", id }: BannerProps) {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0); // State to track current banner

    // Filter out banners without images. Moved here to be accessible by all useCallback hooks.
    const displayBanners = banners.filter((banner) => banner.image);

    // Fetch banners from Supabase
    useEffect(() => {
        async function fetchBanners() {
            setLoading(true);

            const { data, error } = await supabase
                .from("banner")
                .select("*, link") // Select all existing columns and the new 'link' column
                .order("date", { ascending: false });

            if (error) {
                console.error("Failed to fetch banners:", error);
            } else {
                setBanners(data || []);
            }

            setLoading(false);
        }

        fetchBanners();
    }, []);

    // Automatic slideshow advancement
    useEffect(() => {
        let slideshowInterval: NodeJS.Timeout | null = null;
        if (displayBanners.length > 1) { // Only start slideshow if there's more than one banner
            slideshowInterval = setInterval(() => {
                setCurrentBannerIndex((prevIndex) =>
                    (prevIndex + 1) % displayBanners.length
                );
            }, 5000); // Change banner every 5 seconds (5000ms)

            return () => {
                if (slideshowInterval) {
                    clearInterval(slideshowInterval); // Cleanup on component unmount or banners change
                }
            };
        }
        return () => { }; // Ensure a cleanup function is always returned
    }, [displayBanners.length]); // Re-run effect when the number of banners changes

    // NEW: Navigation Handlers for Arrows
    const handlePrev = () => {
        setCurrentBannerIndex((prevIndex) =>
            prevIndex === 0 ? displayBanners.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentBannerIndex((prevIndex) =>
            (prevIndex + 1) % displayBanners.length
        );
    };

    // Function to delete all tutorial data from local storage when a banner is clicked
    const deleteAllTutorialData = () => {
        if (typeof window !== 'undefined') { // Ensure localStorage is available
            localStorage.removeItem('hasSeenDashboardTutorial');
            localStorage.removeItem('hasSeenPoolPageTutorial');
            localStorage.removeItem('hasSeenShopBasketTutorial');
            localStorage.removeItem('hasSeenChatroomPageTutorial');
            console.log('All tutorial data cleared from localStorage.');
        }
    };

    if (loading) return <p>Loading banners...</p>;

    if (displayBanners.length === 0) {
        return <p className="text-center text-gray-500">No new banners</p>;
    }

    const currentBanner = displayBanners[currentBannerIndex];

    if (!currentBanner) {
        console.warn("No current banner found at index:", currentBannerIndex);
        return <p className="text-center text-gray-500">Error displaying banner.</p>;
    }

    return (
        <div className={`flex flex-col gap-3 ${className}`} id={id}>
            {/* Outer container for the carousel viewport: responsive aspect ratio, rounded corners, hides overflow */}
            <div className="relative w-full aspect-[16/9]  rounded-[20px] overflow-hidden group"> {/* Added group for hover effects */}
                {/* Inner container that holds all banners side-by-side. 
            This container slides horizontally. */}
                <div
                    className="flex h-full transition-transform duration-700 ease-in-out" // Added transition for smooth sliding
                    style={{
                        transform: `translateX(-${currentBannerIndex * 100}%)` // Slides based on current index
                    }}
                >
                    {displayBanners.map((banner) => (
                        // Each banner is an anchor tag, forced to take full width of the viewport
                        <a
                            key={banner.id}
                            href={banner.link || undefined}
                            target={banner.link ? "_blank" : undefined}
                            rel={banner.link ? "noopener noreferrer" : undefined}
                            className={`flex-shrink-0 w-full h-full relative ${banner.link ? "cursor-pointer hover:opacity-90" : ""
                                }`}
                            style={{ backgroundColor: "#f3f3f3", textDecoration: 'none' }}
                            onClick={(e) => {
                                // Prevent default if no link is present
                                if (!banner.link) {
                                    e.preventDefault();
                                }
                                deleteAllTutorialData(); // Call the function to delete tutorial data
                            }}
                        >
                            <Image
                                src={banner.image!} // Use ! as we've filtered out banners without images
                                alt={`Banner ${banner.id}`}
                                fill // Makes the image fill the anchor tag
                                className="object-cover" // Ensures image covers the area without distortion
                            />
                        </a>
                    ))}
                </div>

                {/* NEW: Navigation Arrows */}
                {displayBanners.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 focus:outline-none transition-opacity opacity-0 group-hover:opacity-100"
                            aria-label="Previous banner"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 focus:outline-none transition-opacity opacity-0 group-hover:opacity-100"
                            aria-label="Next banner"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Dots/indicators for navigation */}
            {displayBanners.length > 1 && (
                <div className="flex justify-center gap-2 mt-2">
                    {displayBanners.map((_, idx) => (
                        <span
                            key={idx}
                            className={`block w-2 h-2 rounded-full ${idx === currentBannerIndex ? "bg-[#FFDB0D]" : "bg-gray-300"
                                } cursor-pointer`}
                            onClick={() => setCurrentBannerIndex(idx)}
                            aria-label={`Go to banner ${idx + 1}`}
                        ></span>
                    ))}
                </div>
            )}
        </div>
    );
}
