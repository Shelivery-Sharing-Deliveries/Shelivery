import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapboxLocationPicker from '../../components/mapbox/MapboxLocationPicker';
import { useTheme } from '@/providers/ThemeProvider';

interface ProfileFormData {
  favoriteStore: string;
  // dormitory: string; // commented out - kept for future reference
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
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const { isDark, toggleColorScheme, setColorScheme, colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* ── Favorite Store ─────────────────────────────────────────── */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Favorite Store</Text>

        {/* Trigger button */}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setStoreModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={formData.favoriteStore ? styles.selectButtonText : styles.selectButtonPlaceholder}>
            {formData.favoriteStore || 'Select a store'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#6B7280" />
        </TouchableOpacity>

        {/* Store selection modal */}
        <Modal
          visible={storeModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setStoreModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setStoreModalVisible(false)}
          >
            <SafeAreaView style={styles.modalSheet}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select a Store</Text>
                <TouchableOpacity onPress={() => setStoreModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Store list */}
              <FlatList
                data={shops}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = formData.favoriteStore === item;
                  return (
                    <TouchableOpacity
                      style={[styles.storeItem, isSelected && styles.storeItemSelected]}
                      onPress={() => {
                        onInputChange('favoriteStore', item);
                        setStoreModalVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.storeItemText, isSelected && styles.storeItemTextSelected]}>
                        {item}
                      </Text>
                      {isSelected && <Ionicons name="checkmark" size={18} color="#111827" />}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.storeListContent}
              />
            </SafeAreaView>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* ── Preferred Delivery Distance ─────────────────────────────── */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred Delivery Distance (km)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            keyboardType="numeric"
            value={String(formData.preferedKm)}
            onChangeText={(text) => {
              const value = parseInt(text);
              if (!isNaN(value) && value >= 1 && value <= 20) {
                onInputChange('preferedKm', value);
              } else if (text === '') {
                onInputChange('preferedKm', 0);
              }
            }}
            style={styles.textInput}
            maxLength={2}
          />
        </View>
        <Text style={styles.hintText}>Choose your preferred maximum delivery distance (1-20 km)</Text>
      </View>

      {/* ── Delivery Location ───────────────────────────────────────── */}
      <View style={[styles.inputGroup, { zIndex: 10 }]}>
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

      {/* ── Dormitory (commented out – kept for future reference) ─────
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dormitory</Text>
        <View style={[styles.inputWrapper, styles.readOnlyInput]}>
          <TextInput
            value={formData.dormitory}
            editable={false}
            style={[styles.textInput, styles.readOnlyTextInput]}
          />
        </View>
      </View>
      */}

      {/* ── Appearance ───────────────────────────────────────────────── */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors['shelivery-text-primary'] }]}>Appearance</Text>
        <View style={[styles.toggleRow, { backgroundColor: colors['shelivery-card-background'], borderColor: colors['shelivery-card-border'] }]}>
          <View style={styles.toggleLeft}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={20}
              color={isDark ? '#5BA8E0' : '#FFDB0D'}
              style={styles.toggleIcon}
            />
            <View>
              <Text style={[styles.toggleTitle, { color: colors['shelivery-text-primary'] }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={[styles.toggleSubtitle, { color: colors['shelivery-text-tertiary'] }]}>
                {isDark ? 'Using dark color scheme' : 'Using light color scheme'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleColorScheme}
            trackColor={{ false: '#D5D7DA', true: '#245B7B' }}
            thumbColor={isDark ? '#FFDB0D' : '#FFFFFF'}
          />
        </View>
        <TouchableOpacity onPress={() => setColorScheme(null)} style={styles.followSystemButton}>
          <Text style={[styles.followSystemText, { color: colors['shelivery-text-tertiary'] }]}>
            Follow system setting
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Save Button ──────────────────────────────────────────────── */}
      <TouchableOpacity onPress={onSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16,
    width: '100%',
  },
  inputGroup: {
    flexDirection: 'column',
    gap: 4,
    width: '100%',
  },
  label: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  /* ── Store selector button ── */
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 18,
    backgroundColor: 'white',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#111827',
  },
  selectButtonPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  storeListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  storeItemSelected: {
    backgroundColor: '#FFF9C4',
  },
  storeItemText: {
    fontSize: 15,
    color: '#374151',
  },
  storeItemTextSelected: {
    fontWeight: '600',
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  /* ── Text input ── */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 18,
    width: '100%',
  },
  textInput: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: 'transparent',
    padding: 0,
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
  },
  readOnlyTextInput: {
    color: '#6B7280',
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  /* ── Appearance toggle ── */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 18,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  followSystemButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  followSystemText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  /* ── Save button ── */
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '100%',
    backgroundColor: '#FFE75B',
    borderRadius: 16,
    marginTop: 16,
  },
  saveButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
});
