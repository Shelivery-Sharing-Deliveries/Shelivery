import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { LocationData } from "../../types/stores/types";
import { Ionicons } from '@expo/vector-icons';
import Mapbox, { MapView, Camera, MarkerView } from "@rnmapbox/maps";
import * as Location from 'expo-location';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
Mapbox.setAccessToken(MAPBOX_TOKEN);

interface Props {
  userLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function LocationStep({ userLocation, onLocationSelect, onContinue, onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(userLocation || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraRef = useRef<Camera>(null);

  const defaultCamera = userLocation
    ? [userLocation.longitude, userLocation.latitude]
    : [8.5417, 47.3769]; // Default to Zurich, Switzerland

  useEffect(() => {
    if (userLocation) {
      setSelectedLocation(userLocation);
      setSearchQuery(userLocation.placeName || userLocation.address || "");
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [userLocation.longitude, userLocation.latitude],
          zoomLevel: 13,
          animationDuration: 1000,
        });
      }
    }
  }, [userLocation]);

  const reverseGeocode = useCallback(async (longitude: number, latitude: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      const address = data.features?.[0]?.place_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      const placeName = data.features?.[0]?.text || data.features?.[0]?.place_name;
      return { address, placeName };
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return { address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, placeName: undefined };
    }
  }, []);

  const handleMapPress = useCallback(async (event: any) => {
    const { geometry } = event;
    if (!geometry?.coordinates) return;
    const [longitude, latitude] = geometry.coordinates;

    const { address, placeName } = await reverseGeocode(longitude, latitude);

    const newLocation: LocationData = { longitude, latitude, address, placeName };
    setSelectedLocation(newLocation);
    setSearchQuery(address || "");
    setShowSuggestions(false);
    onLocationSelect(newLocation);
  }, [onLocationSelect, reverseGeocode]);

  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim() || !MAPBOX_TOKEN) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=ch&limit=5&types=address,place,locality,neighborhood,poi`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error("Geocoding search error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const handleSelectSuggestion = useCallback(async (suggestion: any) => {
    const [longitude, latitude] = suggestion.center;
    const { address, placeName } = await reverseGeocode(longitude, latitude);

    const newLocation: LocationData = { longitude, latitude, address, placeName };
    setSelectedLocation(newLocation);
    setSearchQuery(address || "");
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect(newLocation);

    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  }, [onLocationSelect, reverseGeocode]);

  const handleGetCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { longitude, latitude } = location.coords;
      const { address, placeName } = await reverseGeocode(longitude, latitude);

      const newLocation: LocationData = { longitude, latitude, address, placeName };
      setSelectedLocation(newLocation);
      setSearchQuery(address || "");
      onLocationSelect(newLocation);

      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 15,
          animationDuration: 1000,
        });
      }
    } catch (err) {
      setError('Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect, reverseGeocode]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Step 2: Set Delivery Location</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for your address in Switzerland..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Ionicons name="locate" size={20} color="black" />
          )}
        </TouchableOpacity>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionItem}
              onPress={() => handleSelectSuggestion(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
              <Text style={styles.suggestionPlaceName} numberOfLines={1}>{suggestion.place_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          onPress={handleMapPress}
          zoomEnabled={true}
          scrollEnabled={true}
        >
          <Camera
            ref={cameraRef}
            zoomLevel={userLocation ? 13 : 10}
            centerCoordinate={defaultCamera as [number, number]}
            animationMode="flyTo"
            animationDuration={0}
          />
          {selectedLocation && (
            <MarkerView coordinate={[selectedLocation.longitude, selectedLocation.latitude]}>
              <View style={styles.marker}>
                <Ionicons name="location" size={30} color="#FFDB0D" />
              </View>
            </MarkerView>
          )}
        </MapView>
      </View>

      {selectedLocation ? (
        <View style={styles.selectedLocationContainer}>
          <View style={styles.selectedLocationHeader}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.selectedLocationText}>Selected Location:</Text>
          </View>
          <Text style={styles.selectedLocationAddress}>
            {selectedLocation.placeName || selectedLocation.address || "Selected location on map"}
          </Text>
        </View>
      ) : (
        <Text style={styles.locationPrompt}>
          Search for your address or tap on the map to set your delivery point.
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !selectedLocation && styles.disabledButton]}
          onPress={onContinue}
          disabled={!selectedLocation}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E8EB",
  },
  headerTitle: {
    color: "#111827",
    marginBottom: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderColor: "#E5E8EB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#111827",
  },
  currentLocationButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#FFDB0D",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionsContainer: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E8EB",
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    marginBottom: 10,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  suggestionPlaceName: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  errorText: {
    color: "#F04438",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 13,
  },
  mapContainer: {
    height: 280,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E8EB",
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  marker: {
    alignItems: "center",
    justifyContent: "center",
  },
  selectedLocationContainer: {
    backgroundColor: "#ECFDF3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D1FADF",
  },
  selectedLocationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  selectedLocationText: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 13,
  },
  selectedLocationAddress: {
    fontSize: 13,
    color: "#374151",
  },
  locationPrompt: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E8EB",
    gap: 6,
  },
  backButtonText: {
    fontWeight: "600",
    color: "#374151",
    fontSize: 15,
  },
  continueButton: {
    flex: 2,
    backgroundColor: "#FFDB0D",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
