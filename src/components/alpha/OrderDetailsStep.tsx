import { Button } from "@/components/ui/Button";
import { Shop, LocationData } from "./types";
import { useEffect, useState, useRef } from "react";

interface Props {
  selectedShop: Shop;
  userLocation: LocationData;
  basketLink: string;
  basketNote: string;
  basketAmount: string;
  canSubmit: boolean;
  submitting: boolean;
  error: string | null;
  onLinkChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}




export function OrderDetailsStep({
  selectedShop, userLocation, basketLink, basketNote, basketAmount,
  canSubmit, submitting, error, onLinkChange, onNoteChange, onAmountChange, onSubmit, onBack,
}: Props) {
      // Info tooltip state & helpers
    const [infoOpen, setInfoOpen] = useState(false);
    const hideTooltipTimerRef = useRef<number | null>(null);

    const showInfo = () => {
        if (hideTooltipTimerRef.current) {
            clearTimeout(hideTooltipTimerRef.current);
            hideTooltipTimerRef.current = null;
        }
        setInfoOpen(true);
    };

    const hideInfo = () => {
        if (hideTooltipTimerRef.current) clearTimeout(hideTooltipTimerRef.current);
        hideTooltipTimerRef.current = window.setTimeout(() => {
            setInfoOpen(false);
            hideTooltipTimerRef.current = null;
        }, 300);
    };
  return (
    <div className="bg-white rounded-shelivery-lg p-4 mb-6 border border-gray-200">
       <h2 className="text-lg font-semibold text-shelivery-text-primary mb-4 flex justify-between items-center relative">
                    <span>Step 3: Enter Order Details</span>

                    <div
                        className="relative"
                        onMouseEnter={showInfo}
                        onMouseLeave={hideInfo}
                    >
                        <button
                            type="button"
                            onFocus={showInfo}
                            onBlur={hideInfo}
                            className="ml-4 p-1"
                            aria-label="Basket details help"
                        >
                            <svg className="w-4 h-4 text-shelivery-text-tertiary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <text x="12" y="16" fontSize="12" textAnchor="middle" fill="currentColor">i</text>
                            </svg>
                        </button>
                      </div>

                      {infoOpen && (
                        <div
                            role="dialog"
                            tabIndex={0}
                            onMouseEnter={showInfo}
                            onMouseLeave={hideInfo}
                            onFocus={showInfo}
                            onBlur={hideInfo}
                            className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-[320px] bg-white p-3 border rounded shadow"
                        >
                            <p className="text-sm text-shelivery-text-secondary">
                                <strong>Provide order details:</strong> You can use a basket link, write a note, or use both to describe your order.</p>  
                                <p className="text-sm text-shelivery-text-secondary mt-2">
                                For more information about how to provide your order efficiently, you can visit the {selectedShop.name} blog <a href={`/shops/${selectedShop.id}/blog`} className="text-shelivery-primary underline">here</a>.
                            </p>
                        </div>
                    )}
            </h2>

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
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-shelivery-text-tertiary">
            📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-shelivery-text-secondary mb-1">Basket Link (URL)</label>
          <input type="url" placeholder="e.g., https://shop.com/my-order" value={basketLink} onChange={(e) => onLinkChange(e.target.value)} className="shelivery-input w-full" />
        </div>

        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300" />
          <span className="px-3 text-sm text-shelivery-text-tertiary">OR</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        <div>
          <label className="block text-sm font-medium text-shelivery-text-secondary mb-1">Order Note</label>
          <textarea placeholder="Describe what you want to order..." value={basketNote} onChange={(e) => onNoteChange(e.target.value)} className="shelivery-input w-full min-h-[100px] resize-y" rows={4} />
        </div>

        <div>
          <label className="block text-sm font-medium text-shelivery-text-secondary mb-1">Total Amount (CHF) *</label>
          <input type="number" placeholder="e.g., 25.50" value={basketAmount} onChange={(e) => onAmountChange(e.target.value)} step="0.1" min="0" className="shelivery-input w-full" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-shelivery-sm text-sm mt-4">{error}</div>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onSubmit} disabled={!canSubmit || submitting} loading={submitting} className="flex-1">
          {submitting ? "Finding Pools..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}