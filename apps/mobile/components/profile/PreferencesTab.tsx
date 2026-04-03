
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MapboxLocationPicker from '../../components/mapbox/MapboxLocationPicker';

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
    <View style={styles.container}>
      {/* Favorite Store Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Favorite Store
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.favoriteStore}
            onValueChange={(itemValue) => onInputChange("favoriteStore", itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a store" value="" enabled={false} />
            {shops.map((shopName) => (
              <Picker.Item key={shopName} label={shopName} value={shopName} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Preferred Distance */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Preferred Delivery Distance (km)
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            keyboardType="numeric"
            value={String(formData.preferedKm)}
            onChangeText={(text) => {
              const value = parseInt(text);
              if (!isNaN(value) && value >= 1 && value <= 20) {
                onInputChange("preferedKm", value);
              } else if (text === "") {
                onInputChange("preferedKm", 0); // Allow clearing the input
              }
            }}
            style={styles.textInput}
            maxLength={2} // Max 2 digits for 1-20
          />
        </View>
        <Text style={styles.hintText}>Choose your preferred maximum delivery distance (1-20 km)</Text>
      </View>

      {/* Location Picker */}
      <View style={styles.inputGroup}>
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
      </View>

      {/* Dormitory (read-only) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Dormitory
        </Text>
        <View style={[styles.inputWrapper, styles.readOnlyInput]}>
          <TextInput
            value={formData.dormitory}
            editable={false}
            style={[styles.textInput, styles.readOnlyTextInput]}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={onSave}
        style={styles.saveButton}
      >
        <Text style={styles.saveButtonText}>
          Save Preferences
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16, // gap-4
    width: '100%',
  },
  inputGroup: {
    flexDirection: 'column',
    gap: 4, // gap-1
    width: '100%',
  },
  label: {
    color: '#111827',
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    lineHeight: 20, // leading-5
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 18,
    width: '100%',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 18,
    overflow: 'hidden',
  },
  picker: {
    height: 48, // Approximate height for py-3
    width: '100%',
  },
  textInput: {
    flex: 1,
    color: '#111827',
    fontSize: 14, // text-sm
    lineHeight: 20, // leading-5
    backgroundColor: 'transparent',
    padding: 0, // Remove default padding
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6', // gray-100
  },
  readOnlyTextInput: {
    color: '#6B7280',
  },
  hintText: {
    fontSize: 12, // text-xs
    color: '#6B7280', // gray-500
    marginTop: 4, // mt-1
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // gap-2
    paddingVertical: 12, // py-3
    paddingHorizontal: 0, // px-0
    width: '100%',
    backgroundColor: '#FFE75B',
    borderRadius: 16,
    marginTop: 16, // mt-4
  },
  saveButtonText: {
    color: 'black',
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    lineHeight: 26, // leading-[26px]
  },
});
