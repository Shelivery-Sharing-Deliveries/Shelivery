"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

interface Banner {
  id: string;
  src: string;
  alt: string;
}

interface SquareBannerProps {
  className?: string;
  id?: string;
  autoPlay?: boolean;
  interval?: number;
}

const banners: Banner[] = [
  {
  id: "4",
  src: "https://zsqagqzztvzogyktgjph.supabase.co/storage/v1/object/public/banners/Copy%20of%20Order.mp4",
  alt: "Order video"
  },
  {
    id: "2",
    src: "/banners/banner-2.png",
    alt: "The problem"
  },
  {
    id: "3",
    src: "/banners/banner-3.png",
    alt: "Solution"
  },
  {
    id: "1",
    src: "/banners/banner-1.png",
    alt: "Welcome to Shelivery - Start Shopping"
  }
];

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];

function isVideo(src: string): boolean {
  const lower = src.toLowerCase().split("?")[0] ?? "";
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

interface BannerSlideProps {
  banner: Banner;
  priority?: boolean;
}

function BannerSlide({ banner, priority }: BannerSlideProps) {
  if (isVideo(banner.src)) {
    return (
      <video
        src={banner.src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-label={banner.alt}
      />
    );
  }

  return (
    <Image
      src={banner.src}
      alt={banner.alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={priority}
    />
  );
}

export default function SquareBanner({
  className = "",
  id,
  autoPlay = true,
  interval = 4000
}: SquareBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    if (autoPlay && !isHovered) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, interval);

      return () => clearInterval(timer);
    }

    return undefined;
  }, [autoPlay, interval, isHovered]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  return (
    <div
      className={`w-full ${className}`}
      id={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full aspect-square rounded-[20px] overflow-hidden bg-gray-100 relative">
        {/* Slides */}
        <div className="relative w-full h-full">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <BannerSlide banner={banner} priority={index === 0} />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous banner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next banner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dashed Line Indicator */}
      <div className="w-full flex justify-center mt-4">
        <div className="flex items-center space-x-2">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`h-0.5 flex-1 transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white shadow-sm"
                  : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}