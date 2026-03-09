import { Button } from "@/components/ui/Button";
import { MapboxLocationPicker } from "@/components/mapbox";
import { LocationData } from "./types";

interface Props {
  userLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function LocationStep({ userLocation, onLocationSelect, onContinue, onBack }: Props) {
  return (
    <div className="bg-white rounded-shelivery-lg p-4 mb-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-shelivery-text-primary mb-4">Step 2: Set Your Delivery Location</h2>

      <MapboxLocationPicker
        onLocationSelect={onLocationSelect}
        initialLocation={userLocation || undefined}
        label="Delivery Address"
        placeholder="Search for your address in Switzerland..."
      />

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onContinue} disabled={!userLocation} className="flex-1">Continue to Order Details</Button>
      </div>
    </div>
  );
}