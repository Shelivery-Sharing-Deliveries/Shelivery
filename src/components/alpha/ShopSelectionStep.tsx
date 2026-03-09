import { Button } from "@/components/ui/Button";
import { Shop } from "./types";

interface Props {
  shops: Shop[];
  selectedShop: Shop | null;
  shopSearchQuery: string;
  onShopSelect: (shop: Shop) => void;
  onSearchChange: (query: string) => void;
  onContinue: () => void;
}

export function ShopSelectionStep({ shops, selectedShop, shopSearchQuery, onShopSelect, onSearchChange, onContinue }: Props) {
  const filtered = shops.filter((s) => s.name.toLowerCase().includes(shopSearchQuery.toLowerCase()));

  return (
    <div className="bg-white rounded-shelivery-lg p-4 mb-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-shelivery-text-primary mb-4">Step 1: Select a Shop</h2>

      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search shops..." value={shopSearchQuery} onChange={(e) => onSearchChange(e.target.value)} className="shelivery-input w-full pl-10" />
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-1 -mr-1">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((shop) => (
            <button
              key={shop.id}
              onClick={() => onShopSelect(shop)}
              className={`p-4 rounded-shelivery-lg border-2 transition-all text-left h-[100px] ${selectedShop?.id === shop.id ? "border-shelivery-primary-yellow bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}
            >
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <div className="w-12 h-12 bg-gray-100 rounded-shelivery-md flex items-center justify-center flex-shrink-0">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-contain rounded-shelivery-md" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium text-shelivery-text-primary text-sm truncate w-full">{shop.name}</p>
                  <p className="text-xs text-shelivery-text-tertiary">Min: CHF {shop.min_amount.toFixed(2)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-shelivery-text-secondary">No shops found matching "{shopSearchQuery}"</div>
        )}
      </div>

      <div className="mt-6">
        <Button onClick={onContinue} disabled={!selectedShop} className="w-full">Continue to Location</Button>
      </div>
    </div>
  );
}