"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/lib/database.types";

type Location = Tables<'location'>;

interface LocationSelectorProps {
  selectedLocationId?: string;
  onLocationChange: (locationId: string) => void;
  locationType?: 'residence' | 'meetup';
  className?: string;
}

export default function LocationSelector({
  selectedLocationId,
  onLocationChange,
  locationType = 'residence',
  className = ""
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('location')
        .select('*')
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (err: any) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-white border border-[#E5E8EB] rounded-[18px] px-4 py-3">
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#FFDB0D] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-white border border-[#E5E8EB] rounded-[18px] px-4 py-3">
          <p className="text-red-500 text-sm text-center py-2">{error}</p>
        </div>
      </div>
    );
  }

  // Filter locations based on type
  const filteredLocations = locations.filter(location => {
    if (locationType === 'residence') {
      return location.type === 'dorm';
    } else if (locationType === 'meetup') {
      return location.type === 'other';
    }
    return true; // Show all if no type specified
  });

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col gap-1 w-full">
        <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
          Delivery Location
        </label>
        <div className="bg-white border border-[#E5E8EB] rounded-[18px] px-4 py-3">
          <select
            value={selectedLocationId || ""}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full text-[14px] font-normal leading-[20px] text-black bg-transparent outline-none"
          >
            <option value="" disabled>
              Select a delivery location
            </option>
            {filteredLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} {location.type === 'dorm' ? '(Dormitory)' : '(Meetup Point)'}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[12px] text-[#6B7280] leading-[16px]">
          Choose where you'd like to meet for delivery pickup
        </p>
      </div>
    </div>
  );
}
