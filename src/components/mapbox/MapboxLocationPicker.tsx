"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface LocationData {
  longitude: number;
  latitude: number;
  address?: string;
  placeName?: string;
}

interface MapboxLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData | undefined;
  className?: string;
  label?: string;
  placeholder?: string;
}

export default function MapboxLocationPicker({
  onLocationSelect,
  initialLocation,
  className = "",
  label = "Your Location",
  placeholder = "Search for your address...",
}: MapboxLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get Mapbox token from environment
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (token) {
      setMapboxToken(token);
      mapboxgl.accessToken = token;
    } else {
      setError("Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env file.");
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    const initialCenter: [number, number] = initialLocation 
      ? [initialLocation.longitude, initialLocation.latitude] 
      : [8.5417, 47.3769]; // Default to Zurich, Switzerland

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: false,
        showUserHeading: false,
      }),
      "top-right"
    );

    // Add initial marker if location exists
    if (initialLocation) {
      marker.current = new mapboxgl.Marker({ color: "#FFDB0D" })
        .setLngLat([initialLocation.longitude, initialLocation.latitude])
        .addTo(map.current);
    }

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    // Handle map click to place marker
    map.current.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      
      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }

      // Add new marker
      marker.current = new mapboxgl.Marker({ color: "#FFDB0D" })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`
        );
        const data = await response.json();
        
        const locationData: LocationData = {
          longitude: lng,
          latitude: lat,
          address: data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          placeName: data.features[0]?.text || data.features[0]?.place_name,
        };

        setSelectedLocation(locationData);
        setSearchQuery(locationData.address || "");
        onLocationSelect(locationData);
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        const locationData: LocationData = {
          longitude: lng,
          latitude: lat,
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        };
        setSelectedLocation(locationData);
        setSearchQuery(locationData.address || "");
        onLocationSelect(locationData);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Search for places using Mapbox Geocoding API
  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim() || !mapboxToken) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Bias results towards Switzerland
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=ch&limit=5&types=address,place,locality,neighborhood,poi`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error("Geocoding search error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [mapboxToken]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchPlaces(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPlaces]);

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: any) => {
    const [lng, lat] = suggestion.center;
    
    const locationData: LocationData = {
      longitude: lng,
      latitude: lat,
      address: suggestion.place_name,
      placeName: suggestion.text,
    };

    setSelectedLocation(locationData);
    setSearchQuery(suggestion.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect(locationData);

    // Update map view
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
      });

      // Update marker
      if (marker.current) {
        marker.current.remove();
      }
      marker.current = new mapboxgl.Marker({ color: "#FFDB0D" })
        .setLngLat([lng, lat])
        .addTo(map.current);
    }
  };

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;
        
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
          });

          // Update marker
          if (marker.current) {
            marker.current.remove();
          }
          marker.current = new mapboxgl.Marker({ color: "#FFDB0D" })
            .setLngLat([longitude, latitude])
            .addTo(map.current);
        }

        // Reverse geocode
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`
          );
          const data = await response.json();
          
          const locationData: LocationData = {
            longitude,
            latitude,
            address: data.features[0]?.place_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            placeName: data.features[0]?.text || data.features[0]?.place_name,
          };

          setSelectedLocation(locationData);
          setSearchQuery(locationData.address || "");
          onLocationSelect(locationData);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          const locationData: LocationData = {
            longitude,
            latitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          };
          setSelectedLocation(locationData);
          setSearchQuery(locationData.address || "");
          onLocationSelect(locationData);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to get your location. Please enable location permissions.");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-shelivery-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-shelivery-text-primary mb-2">
        {label}
      </label>

      {/* Search Input */}
      <div className="relative mb-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="shelivery-input w-full pr-24"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && (
              <div className="w-4 h-4 border-2 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin" />
            )}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              title="Use my current location"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-shelivery-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <p className="text-sm font-medium text-shelivery-text-primary">
                  {suggestion.text}
                </p>
                <p className="text-xs text-shelivery-text-tertiary mt-0.5">
                  {suggestion.place_name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-[300px] rounded-shelivery-lg overflow-hidden border border-gray-200"
      />

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-shelivery-sm">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                {selectedLocation.placeName || "Selected Location"}
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {selectedLocation.address}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Coordinates: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <p className="text-xs text-shelivery-text-tertiary mt-2">
        Click on the map or search for an address to set your delivery location
      </p>
    </div>
  );
}