// components/dashboard/AddBasket.tsx
"use client"; // Ensure this is present if it uses client-side features

import Image from "next/image";
import React from "react"; // Ensure React is imported if not already present

interface AddBasketProps {
  onClick?: () => void;
  id?: string; // ADDED: Make the id prop optional
}

export default function AddBasket({ onClick, id }: AddBasketProps) { // Destructure id from props
  return (
    <div className="w-full h-[67px] mb-[18px]">
      <div
        id={id} // ADDED: Apply the id prop here
        className="w-full h-full bg-[#FFDB0D] rounded-[18px] flex px-4 cursor-pointer hover:opacity-90 transition-opacity "
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          {/* Plus Icon */}
          <div className="w-12 h-12 flex ">
            <Image
              src="/icons/plus-circle-icon.svg"
              alt="Add"
              width={36}
              height={36}
              className="text-[#181D27]"
            />
          </div>

          {/* Add Basket Text */}
          <span className="text-[16px] font-bold leading-[24px] text-[#111827]">
            Add Basket
          </span>
        </div>
      </div>
    </div>
  );
}
