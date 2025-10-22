"use client";

import Image from "next/image";
import React from "react";

interface SquareBannerProps {
  className?: string;
  id?: string;
}

export default function SquareBanner({ className = "", id }: SquareBannerProps) {
  return (
    <div className={`w-full  py-2 ${className}`} id={id}>
      <div className="w-full aspect-square rounded-[20px] overflow-hidden bg-gray-100 relative">
        <Image
          src="/banners/banner-4.png"
          alt="Welcome to Shelivery"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}
