"use client";

import ShopCard from "./ShopCard";

interface Shop {
  id: string;
  name: string;
  logo: string;
  minAmount: string;
  currentAmount: string;
  progress: number;
}

interface ShopsGridProps {
  shops: Shop[];
  onShopSelect: (shopId: string) => void;
  selectedShopId?: string | null;
}

export default function ShopsGrid({
  shops,
  onShopSelect,
  selectedShopId,
}: ShopsGridProps) {
  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-[14px] text-gray-500 text-center">
          No shops found matching your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {shops.map((shop) => (
        <ShopCard
          key={shop.id}
          shop={shop}
          onClick={() => onShopSelect(shop.id)}
          isSelected={selectedShopId === shop.id}
        />
      ))}
    </div>
  );
}
