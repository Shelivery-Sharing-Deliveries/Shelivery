"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/lib/database.types";

type Location = Tables<'location'>;

interface LocationTypeSelectorProps {
  selectedType: 'residence' | 'meetup';
  selectedMeetupLocationId?: string;
  onTypeChange: (type: 'residence' | 'meetup') => void;
  onMeetupLocationChange?: (locationId: string) => void;
  userHasDormitory?: boolean;
}

export default function LocationTypeSelector({
  selectedType,
  selectedMeetupLocationId,
  onTypeChange,
  onMeetupLocationChange,
  userHasDormitory = true
}: LocationTypeSelectorProps) {
  const [meetupLocations, setMeetupLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedType === 'meetup') {
      fetchMeetupLocations();
    }
  }, [selectedType]);

  const fetchMeetupLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('location')
        .select('*')
        .eq('type', 'other')
        .order('name');

      if (error) throw error;
      setMeetupLocations(data || []);
    } catch (err: any) {
      console.error('Error fetching meetup locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedLocation = meetupLocations.find(loc => loc.id === selectedMeetupLocationId);

  return (
    <div className="bg-white rounded-shelivery-lg p-2 mb-1">
      <div className="flex gap-4">
        <button
          onClick={() => {
            if (userHasDormitory) {
              onTypeChange('residence');
              onMeetupLocationChange?.(''); // Clear meetup selection
            }
          }}
          disabled={!userHasDormitory}
          className={`flex-1 py-3 px-4 rounded-shelivery-md border-2 transition-all ${
            selectedType === 'residence'
              ? 'border-shelivery-primary-blue bg-blue-50 text-shelivery-primary-blue'
              : !userHasDormitory
              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-gray-200 bg-white text-shelivery-text-secondary hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <div className="text-sm font-medium mb-1">At Residence</div>
            <div className="text-xs opacity-75">
              {userHasDormitory ? 'Meet at your place' : 'Select dormitory first'}
            </div>
          </div>
        </button>

        <button
          onClick={() => onTypeChange('meetup')}
          className={`flex-1 py-3 px-4 rounded-shelivery-md border-2 transition-all ${
            selectedType === 'meetup'
              ? 'border-shelivery-primary-blue bg-blue-50 text-shelivery-primary-blue'
              : 'border-gray-200 bg-white text-shelivery-text-secondary hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <div className="text-sm font-medium mb-1">
              {selectedLocation ? `at ${selectedLocation.name}` : 'Meetup Point'}
            </div>
            <div className="text-xs opacity-75">
              {selectedLocation ? "": 'Select a location'}
            </div>
          </div>
        </button>
      </div>

      {/* Compact Select Dropdown */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out mt-4 ${
        selectedType === 'meetup' ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <div className="w-4 h-4 border-2 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <select
            value={selectedMeetupLocationId || ""}
            onChange={(e) => onMeetupLocationChange?.(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-shelivery-md focus:outline-none focus:ring-2 focus:ring-shelivery-primary-blue focus:border-transparent text-sm"
          >
            <option value="" disabled>
              Select a location
            </option>
            {meetupLocations.map((location) => (
              <option key={location.id} value={location.id}>
                at {location.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
