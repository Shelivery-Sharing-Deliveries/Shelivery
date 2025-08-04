// components/dashboard/Baskets.tsx
"use client"; // Ensure this is present if it uses client-side features

import Image from "next/image";
import React from "react"; // Ensure React is imported

interface Basket {
    id: string;
    shopName: string;
    shopLogo: string | null; // shopLogo can be null
    total: string;
    status: "in_pool" | "in_chat" | "resolved"; // Updated to match DB statuses
}

interface BasketsProps {
    baskets: Basket[];
    onBasketClick?: (basketId: string) => void;
    id?: string; // ADDED: Make the id prop optional
}

// Updated statusConfig to match database 'status' values
const statusConfig = {
    in_pool: {
        text: "In Pool",
        bgColor: "#EFF8FF", // Light blue
        textColor: "#175CD3", // Darker blue
        borderColor: "#D8F0FE", // Lighter blue border
    },
    in_chat: {
        text: "In Chat",
        bgColor: "#FEF3F2", // Light red/orange
        textColor: "#B42318", // Darker red/orange
        borderColor: "#FFECEE", // Lighter red/orange border
    },
    resolved: {
        text: "Resolved",
        bgColor: "#ECFDF3", // Light green
        textColor: "#027A48", // Darker green
        borderColor: "#D1FADF", // Lighter green border
    },
};

export default function Baskets({ baskets, onBasketClick, id }: BasketsProps) { // Destructure id from props
    const isEmpty = baskets.length === 0;

    return (
        <div className="mb-6" id={id}> {/* ADDED: Apply the id prop here */}
            {/* Section Header */}
            <div className="flex items-center mb-4">
                <h2 className="text-[16px] font-bold leading-8 text-black">
                    Your Baskets
                </h2>
            </div>

            {isEmpty ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center gap-3 w-full px-4 py-8">
                    <div className="flex justify-center">
                        <Image
                            src="/icons/empty-basket-illustration.png"
                            alt="Empty basket"
                            width={160}
                            height={190}
                        />
                    </div>
                    <p className="text-[14px] font-medium leading-[20px] text-center text-black max-w-[280px]">
                        Create your first group basket to unlock free delivery
                    </p>
                </div>
            ) : (
                /* Baskets List */
                <div className="flex flex-col gap-3">
                    {baskets.map((basket) => (
                        <BasketCard
                            key={basket.id}
                            basket={basket}
                            onClick={() => onBasketClick?.(basket.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface BasketCardProps {
    basket: Basket;
    onClick?: () => void;
}

function BasketCard({ basket, onClick }: BasketCardProps) {
    const statusStyle = statusConfig[basket.status];

    // Add error handling in case statusStyle is undefined
    if (!statusStyle) {
        console.error("Unknown basket status:", basket.status);
        return null; // Don't render if status is unknown
    }

    // Handle cases where shopLogo might be null or undefined
    const shopLogoUrl = basket.shopLogo || "/images/default-shop-logo.png"; // Fallback image if logo is null

    return (
        <div
            className="w-full bg-white border border-[#D1D5DB] rounded-[16px] p-2 cursor-pointer hover:shadow-sm transition-shadow"
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                {/* Left side - Shop info */}
                <div className="flex items-center gap-3">
                    {/* Shop Logo */}
                    <div
                        className="w-[54px] h-[54px] rounded-[12px] bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${shopLogoUrl.replace(/ /g, "%20")})` }}
                    >
                        {/* Fallback SVG if shopLogoUrl is a placeholder and you want an icon */}
                        {shopLogoUrl === "/images/default-shop-logo.png" && (
                            <svg className="w-full h-full text-gray-400 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        )}
                    </div>

                    {/* Shop details */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[16px] font-bold leading-[24px] text-[#111827]">
                            {basket.shopName}
                        </span>
                        <span className="text-[12px] font-normal leading-[16px] text-[#374151]">
                            Total: {basket.total} {/* Currency prefix already in total string */}
                        </span>
                    </div>
                </div>

                {/* Right side - Status badge */}
                <div className="flex items-center">
                    <div
                        className="px-2 py-0.5 rounded-[16px] border"
                        style={{
                            backgroundColor: statusStyle.bgColor,
                            borderColor: statusStyle.borderColor,
                        }}
                    >
                        <span
                            className="text-[12px] font-medium leading-[16px]"
                            style={{ color: statusStyle.textColor }}
                        >
                            {statusStyle.text}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
