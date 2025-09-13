"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/choose-shop/Header";
import SearchSection from "@/components/choose-shop/SearchSection";
import ShopsGrid from "@/components/choose-shop/ShopsGrid";
import { Navigation, Button } from "@/components/ui";

// Mock data for shops
const mockShops = [
  {
    id: "1",
    name: "Denner",
    logo: "/shop-logos/Denner Logo.png",
    minAmount: "$50",
    currentAmount: "$37",
    progress: 74, // 37/50 = 74%
  },
  {
    id: "2",
    name: "Coop",
    logo: "/shop-logos/Coop Logo.png",
    minAmount: "$50",
    currentAmount: "$37",
    progress: 74,
  },
  {
    id: "3",
    name: "Aldi",
    logo: "/shop-logos/Aldi Logo.png",
    minAmount: "$50",
    currentAmount: "$37",
    progress: 74,
  },
  {
    id: "4",
    name: "Migros",
    logo: "/shop-logos/Migros Logo.png",
    minAmount: "$50",
    currentAmount: "$37",
    progress: 74,
  },
  {
    id: "5",
    name: "Lidl",
    logo: "/shop-logos/Lidl Logo.png",
    minAmount: "$50",
    currentAmount: "$37",
    progress: 74,
  },
];

export default function ChooseShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const router = useRouter();

  // Filter shops based on search query
  const filteredShops = mockShops.filter((shop) =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShopSelect = (shopId: string) => {
    setSelectedShopId(selectedShopId === shopId ? null : shopId);
  };

  const handleNext = () => {
    if (selectedShopId) {
      // Navigate to shop-specific page or basket
      router.push(`/shops/${selectedShopId}/basket`);
    }
  };

  return (
    <div className="min-h-screen bg-[#245B7B] relative flex justify-center">
      {/* Main Content Container - Responsive width */}
      <div className="w-[calc(100vw-25px)] md:w-[375px] bg-white rounded-t-[30px] min-h-screen md:mx-[10px] relative">
        {/* Header */}
        <Header />

        {/* Content Section */}
        <div className="px-4 py-4 pb-[90px]">
          {/* Search Section */}
          <SearchSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Shops Grid */}
          <ShopsGrid
            shops={filteredShops}
            onShopSelect={handleShopSelect}
            selectedShopId={selectedShopId}
          />
        </div>

        {/* Bottom Button - Only show when a shop is selected */}
        {selectedShopId && (
          <div className="fixed bottom-[90px] left-1/2 transform -translate-x-1/2 w-[calc(100vw-45px)] md:w-[321px] z-10 md:ml-[10px]">
            <Button
              onClick={handleNext}
              className="w-full h-[56px] bg-[#FFDB0D] text-black font-semibold text-[18px] rounded-[16px] hover:bg-[#FFDB0D]/90 transition-all duration-200"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Navigation - Fixed to bottom */}
      <div className="fixed bottom-0 left-0 right-0">
        <Navigation />
      </div>
    </div>
  );
}
