import { Button } from "@/components/ui/Button";
import { NearbyPool, Shop, LocationData } from "./types";

interface Props {
  selectedShop: Shop;
  userLocation: LocationData;
  nearbyPools: NearbyPool[];
  selectedPool: string | null;
  totalAmount: number;
  loading: boolean;
  error: string | null;
  success: string | null;
  onPoolSelect: (poolId: string | null) => void;
  onConfirm: (poolId: string | null) => void;
  onBack: () => void;
  onExpandSearch?: () => void;
  expandedSearchLoading?: boolean;
  currentSearchRadius?: number;
}

export function PoolSelectionStep({
  selectedShop, userLocation, nearbyPools, selectedPool, totalAmount,
  loading, error, success, onPoolSelect, onConfirm, onBack,
  onExpandSearch, expandedSearchLoading = false, currentSearchRadius = 5,
}: Props) {
  return (
    <div className="bg-white rounded-shelivery-lg p-4 mb-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-shelivery-text-primary mb-4">Step 4: Choose a Pool</h2>

      {/* Summary */}
      <div className="bg-gray-50 rounded-shelivery-sm p-3 mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-shelivery-text-secondary">Shop:</span>
          <span className="text-sm font-medium text-shelivery-text-primary">{selectedShop.name}</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm text-shelivery-text-secondary flex-shrink-0">Location:</span>
          <span className="text-sm font-medium text-shelivery-text-primary text-right">
            {userLocation.placeName || userLocation.address}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-shelivery-text-secondary">
          {nearbyPools.length > 0
            ? `Found ${nearbyPools.length} nearby pool${nearbyPools.length > 1 ? "s" : ""} for ${selectedShop.name}:`
            : `No nearby pools found for ${selectedShop.name} within ${currentSearchRadius} km.`}
        </p>
        {nearbyPools.length === 0 && (
          <p className="text-xs text-shelivery-text-tertiary mt-1">
            💡 Try expanding the search range to find more options
          </p>
        )}
      </div>

      <div className="space-y-3">
        {/* Expand search button when no pools found */}
        {nearbyPools.length === 0 && onExpandSearch && (
          <button
            onClick={onExpandSearch}
            disabled={expandedSearchLoading}
            className={`
              w-full py-3 px-4 rounded-shelivery-lg font-medium text-sm transition-all duration-200
              ${expandedSearchLoading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md"
              }
              flex items-center justify-center gap-2
            `}
          >
            {expandedSearchLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Expanding Search...
              </>
            ) : (
              <>
                <span className="text-base">🔍</span>
                Expand Search Range
              </>
            )}
          </button>
        )}

        {/* Existing pools */}
        {nearbyPools.map((pool) => (
          <div
            key={pool.pool_id}
            className={`p-4 rounded-shelivery-lg border-2 transition-all cursor-pointer ${
              selectedPool === pool.pool_id
                ? "border-shelivery-primary-yellow bg-yellow-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onPoolSelect(pool.pool_id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={selectedPool === pool.pool_id}
                  onChange={() => onPoolSelect(pool.pool_id)}
                  className="mt-1 w-4 h-4 accent-shelivery-primary-yellow"
                  readOnly
                />
                <div>
                  <p className="font-medium text-shelivery-text-primary">
                    {pool.distance_km.toFixed(2)} km away
                  </p>
                  <p className="text-sm text-shelivery-text-secondary">
                    {pool.member_count} member{pool.member_count !== 1 ? "s" : ""} waiting
                  </p>
                  {pool.address && (
                    <p className="text-xs text-shelivery-text-tertiary mt-1">📍 {pool.address}</p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-shelivery-text-secondary">Progress</p>
                <p className="font-semibold text-shelivery-text-primary">
                  CHF {pool.current_amount.toFixed(2)}
                </p>
                <p className="text-xs text-shelivery-text-tertiary">
                  of CHF {pool.min_amount.toFixed(2)}
                </p>
                {/* Progress bar */}
                <div className="mt-1 w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-shelivery-primary-yellow rounded-full"
                    style={{ width: `${Math.min(100, (pool.current_amount / pool.min_amount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Create new pool option */}
        <div
          className={`p-4 rounded-shelivery-lg border-2 transition-all cursor-pointer ${
            selectedPool === null
              ? "border-shelivery-primary-yellow bg-yellow-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onPoolSelect(null)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={selectedPool === null}
                onChange={() => onPoolSelect(null)}
                className="mt-1 w-4 h-4 accent-shelivery-primary-yellow"
                readOnly
              />
              <div>
                <p className="font-medium text-shelivery-text-primary">Create New Pool</p>
                <p className="text-sm text-shelivery-text-secondary">Your location will be the anchor</p>
                {userLocation && (
                  <p className="text-xs text-shelivery-text-tertiary mt-1">
                    📍 {userLocation.placeName || userLocation.address}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-shelivery-text-secondary">Your amount</p>
              <p className="font-semibold text-shelivery-text-primary">CHF {totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-shelivery-sm text-sm mt-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-shelivery-sm text-sm mt-4">{success}</div>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={onBack} disabled={loading} className="flex-1">Back</Button>
        <Button onClick={() => onConfirm(selectedPool)} disabled={loading} loading={loading} className="flex-1">
          {loading ? "Processing..." : "Confirm Selection"}
        </Button>
      </div>
    </div>
  );
}