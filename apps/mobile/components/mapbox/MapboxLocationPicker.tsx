
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

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
  // This is a placeholder component.
  // In a real React Native application, you would integrate a native Mapbox SDK
  // (e.g., @rnmapbox/maps) or a webview-based solution.
  // For now, it will display the initial address or a text input.

  const [address, setAddress] = React.useState(initialLocation?.address || '');

  React.useEffect(() => {
    if (initialLocation?.address) {
      setAddress(initialLocation.address);
    }
  }, [initialLocation]);

  const handleTextChange = (text: string) => {
    setAddress(text);
    // In a real implementation, this would trigger a search and then onLocationSelect
    // with actual lat/lng values.
    // For the placeholder, we'll just simulate a selection if an address is typed.
    if (text && initialLocation) {
      onLocationSelect({
        longitude: initialLocation.longitude,
        latitude: initialLocation.latitude,
        address: text,
      });
    } else if (text) {
        // Mock a location if no initial location is provided
        onLocationSelect({
            longitude: 0,
            latitude: 0,
            address: text,
        });
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder || "Enter address"}
        value={address}
        onChangeText={handleTextChange}
      />
      {/* You might add a button here to trigger a map view for selection */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827',
    backgroundColor: 'white',
  },
});

export default MapboxLocationPicker;
