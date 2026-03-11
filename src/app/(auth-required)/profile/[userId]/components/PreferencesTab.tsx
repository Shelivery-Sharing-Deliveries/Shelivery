import React from 'react';
import MapboxLocationPicker from "@/components/mapbox/MapboxLocationPicker";

interface ProfileFormData {
  favoriteStore: string;
  dormitory: string;
  address: string;
  lat: number | null;
  lng: number | null;
  preferedKm: number;
}

interface PreferencesTabProps {
  formData: ProfileFormData;
  shops: string[];
  onInputChange: (field: keyof ProfileFormData, value: string | number) => void;
  onLocationSelect: (locationData: { longitude: number; latitude: number; address?: string }) => void;
  onSave: () => void;
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({
  formData,
  shops,
  onInputChange,
  onLocationSelect,
  onSave,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Favorite Store Dropdown */}
      <div className="flex flex-col gap-1 w-full">
        <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
          Favorite Store
        </label>
        <select
          value={formData.favoriteStore}
          onChange={(e) => onInputChange("favoriteStore", e.target.value)}
          className="px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full text-[#111827] font-poppins text-sm"
        >
          <option value="" disabled>
            Select a store
          </option>
          {shops.map((shopName) => (
            <option key={shopName} value={shopName}>
              {shopName}
            </option>
          ))}
        </select>
      </div>

      {/* Preferred Distance */}
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="preferedKm" className="text-[#111827] font-poppins text-sm font-medium leading-5">
          Preferred Delivery Distance (km)
        </label>
        <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full">
          <input
            type="number"
            id="preferedKm"
            value={formData.preferedKm}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= 20) {
                onInputChange("preferedKm", value);
              }
            }}
            min={1}
            max={20}
            className="flex-1 text-[#111827] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
          />
        </div>
        <p className="text-xs text-[#6B7280] mt-1">Choose your preferred maximum delivery distance (1-20 km)</p>
      </div>

      {/* Location Picker */}
      <div className="flex flex-col gap-1 w-full">
        <MapboxLocationPicker
          onLocationSelect={onLocationSelect}
          initialLocation={
            formData.lat && formData.lng
              ? {
                  longitude: formData.lng,
                  latitude: formData.lat,
                  address: formData.address,
                }
              : undefined
          }
          label="Your Delivery Location"
          placeholder="Search for your delivery address..."
        />
      </div>

      {/* Dormitory (read-only) */}
      <div className="flex flex-col gap-1 w-full">
        <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
          Dormitory
        </label>
        <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] bg-gray-100 rounded-[18px] w-full">
          <input
            type="text"
            value={formData.dormitory}
            readOnly
            className="flex-1 text-[#6B7280] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="flex items-center justify-center gap-2 py-3 px-0 w-full bg-[#FFE75B] rounded-[16px] mt-4"
      >
        <span className="text-black font-poppins text-lg font-semibold leading-[26px]">
          Save Preferences
        </span>
      </button>
    </div>
  );
};