
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapboxLocationPickerProps {
  onLocationSelect: (locationData: { longitude: number; latitude: number; address?: string }) => void;
  initialLocation?: { longitude: number; latitude: number; address?: string };
  label?: string;
  placeholder?: string;
}

const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  label,
  placeholder,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial address when it loads from profile
  useEffect(() => {
    if (initialLocation?.address) {
      setSearchQuery(initialLocation.address);
    }
  }, [initialLocation?.address]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 && showSuggestions) {
        searchPlaces(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showSuggestions]);

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
      console.error('Geocoding search error:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (longitude: number, latitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      return data.features?.[0]?.place_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }, []);

  const handleSelectSuggestion = useCallback(
    (suggestion: any) => {
      const [longitude, latitude] = suggestion.center;
      const address = suggestion.place_name || suggestion.text || '';
      setSearchQuery(address);
      setSuggestions([]);
      setShowSuggestions(false);
      onLocationSelect({ longitude, latitude, address });
    },
    [onLocationSelect]
  );

  const handleGetCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { longitude, latitude } = loc.coords;
      const address = await reverseGeocode(longitude, latitude);
      setSearchQuery(address);
      setSuggestions([]);
      setShowSuggestions(false);
      onLocationSelect({ longitude, latitude, address });
    } catch (err) {
      setError('Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect, reverseGeocode]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Search row */}
      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder={placeholder || 'Search for your address...'}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Small delay so tap on suggestion registers
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          {isLoading && <ActivityIndicator size="small" color="#6B7280" style={styles.spinner} />}
        </View>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleGetCurrentLocation}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Ionicons name="locate" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((s, index) => (
            <TouchableOpacity
              key={s.id || index}
              style={[
                styles.suggestionItem,
                index === suggestions.length - 1 && styles.suggestionItemLast,
              ]}
              onPress={() => handleSelectSuggestion(s)}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={14} color="#9CA3AF" style={styles.suggestionIcon} />
              <View style={styles.suggestionTextContainer}>
                <Text style={styles.suggestionMain}>{s.text}</Text>
                <Text style={styles.suggestionSub} numberOfLines={1}>
                  {s.place_name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Selected address pill */}
      {!showSuggestions && searchQuery.length > 0 && (
        <View style={styles.selectedAddressContainer}>
          <Ionicons name="checkmark-circle" size={14} color="#34C759" />
          <Text style={styles.selectedAddressText} numberOfLines={2}>
            {searchQuery}
          </Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#111827',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E5E8EB',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  spinner: {
    marginLeft: 8,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFE75B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E8EB',
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMain: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  suggestionSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  selectedAddressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  selectedAddressText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  errorText: {
    color: '#F04438',
    fontSize: 12,
    marginTop: 6,
  },
});

export default MapboxLocationPicker;
