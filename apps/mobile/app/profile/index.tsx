import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Modal,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { registerExpoPushToken } from '../../hooks/useExpoPushNotifications';
import { useAuthContext } from '@/providers/AuthProvider';
import { useUserStore } from '@/store/userStore';
import { supabase } from '../../lib/supabase';
import PageLayout, { NavBarSpacer } from '../../components/ui/PageLayout';
import MapboxLocationPicker from '../../components/mapbox/MapboxLocationPicker';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemeColors } from '@/lib/theme';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

function resolveImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_BASE_URL) return `${API_BASE_URL}${url}`;
  return url;
}

interface PrefsData {
  favoriteStore: string;
  address: string;
  lat: number | null;
  lng: number | null;
  preferedKm: number;
}

// ── Reusable row components ─────────────────────────────────────────────────

interface RowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  valueColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: ThemeColors;
}

const SettingsRow: React.FC<RowProps> = ({ icon, label, value, valueColor, onPress, rightElement, colors }) => (
  <TouchableOpacity
    style={rowStyles.row}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View style={rowStyles.rowLeft}>
      <Ionicons name={icon} size={20} color={colors['shelivery-text-secondary']} style={rowStyles.rowIcon} />
      <Text style={[rowStyles.rowLabel, { color: colors['shelivery-text-primary'] }]}>{label}</Text>
    </View>
    <View style={rowStyles.rowRight}>
      {value !== undefined && (
        <Text
          style={[rowStyles.rowValue, { color: valueColor ?? colors['shelivery-text-tertiary'] }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
      {rightElement}
      {onPress && !rightElement && (
        <Ionicons name="chevron-forward" size={16} color={colors['shelivery-text-disabled']} style={{ marginLeft: 4 }} />
      )}
    </View>
  </TouchableOpacity>
);

// Static row layout (never changes)
const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0,
    flexShrink: 0,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { fontSize: 15, fontWeight: '400' },
  rowValue: { fontSize: 14, textAlign: 'right', flexShrink: 1 },
});

// ── Dynamic styles factory ──────────────────────────────────────────────────

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    scrollContent: { paddingBottom: 40 },

    /* ── Hero ── */
    heroSection: {
      alignItems: 'center',
      paddingTop: 32,
      paddingBottom: 24,
      paddingHorizontal: 16,
    },
    avatarTouchable: { marginBottom: 12 },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: colors['shelivery-card-border'],
    },
    heroName: {
      fontSize: 22,
      fontWeight: '700',
      color: colors['shelivery-text-primary'],
      marginBottom: 4,
    },
    heroEmail: {
      fontSize: 14,
      color: colors['shelivery-text-tertiary'],
      marginBottom: 16,
    },
    editProfileButton: {
      paddingVertical: 8,
      paddingHorizontal: 28,
      borderRadius: 24,
      borderWidth: 1.5,
      borderColor: colors['shelivery-text-secondary'],
    },
    editProfileButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors['shelivery-text-secondary'],
    },

    /* ── Section card ── */
    section: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : '#F5F5F5',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors['shelivery-text-primary'],
      paddingTop: 14,
      paddingBottom: 10,
    },
    divider: {
      height: 1,
      backgroundColor: colors['shelivery-card-border'],
    },

    /* ── Logout ── */
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginTop: 8,
      paddingVertical: 14,
      backgroundColor: '#EF4444',
      borderRadius: 16,
    },
    logoutText: { color: 'white', fontSize: 16, fontWeight: '600' },

    /* ── Modal shared ── */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: isDark ? colors['shelivery-card-background'] : 'white',
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
      borderBottomColor: colors['shelivery-card-border'],
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors['shelivery-text-primary'],
    },

    /* ── Store modal ── */
    storeListContent: { paddingHorizontal: 16, paddingVertical: 8 },
    storeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    storeItemSelected: {
      backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : '#FFF9C4',
    },
    storeItemText: { fontSize: 15, color: colors['shelivery-text-secondary'] },
    storeItemTextSelected: { fontWeight: '600', color: colors['shelivery-text-primary'] },
    separator: {
      height: 1,
      backgroundColor: isDark ? colors['shelivery-card-border'] : '#F3F4F6',
    },

    /* ── Distance modal ── */
    distanceBody: { padding: 20 },
    distanceHint: {
      fontSize: 13,
      color: colors['shelivery-text-tertiary'],
      marginBottom: 12,
    },
    distanceInput: {
      borderWidth: 1,
      borderColor: colors['shelivery-card-border'],
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 18,
      color: colors['shelivery-text-primary'],
      backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : 'white',
      textAlign: 'center',
      marginBottom: 16,
    },
    distanceSaveButton: {
      backgroundColor: colors['shelivery-primary-yellow'],
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
    },
    distanceSaveText: { fontSize: 16, fontWeight: '600', color: '#111827' },

    /* ── Location modal ── */
    locationModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    locationModalSheet: {
      backgroundColor: isDark ? colors['shelivery-card-background'] : 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 16,
    },
    locationBody: { padding: 20 },
  });

// ── Main page ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, profile, signOut } = useAuthContext();
  const { updateProfile } = useUserStore();
  const { colors, isDark, toggleColorScheme, setColorScheme } = useTheme();

  // Re-create styles whenever the theme changes
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [shops, setShops] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<PrefsData>({
    favoriteStore: profile?.favoriteStore ?? '',
    address: profile?.address ?? '',
    lat: profile?.lat ?? null,
    lng: profile?.lng ?? null,
    preferedKm: profile?.preferedKm ?? 5,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Modals
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const [distanceModalVisible, setDistanceModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [tempKm, setTempKm] = useState('5');

  // Hydrate from cached profile
  useEffect(() => {
    if (profile) {
      setPrefs({
        favoriteStore: profile.favoriteStore ?? '',
        address: profile.address ?? '',
        lat: profile.lat ?? null,
        lng: profile.lng ?? null,
        preferedKm: profile.preferedKm ?? 5,
      });
      setProfileImage(resolveImageUrl(profile.imageUrl));
    }
  }, [profile]);

  // Load shops for store picker
  useEffect(() => {
    supabase
      .from('shop')
      .select('name')
      .then(({ data, error }) => {
        if (!error && data) setShops(data.map((s) => s.name));
      });
  }, []);

  // Check push notification permission status
  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotificationsEnabled(status === 'granted');
    });
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const savePrefs = useCallback(
    async (patch: Partial<PrefsData>) => {
      const merged = { ...prefs, ...patch };
      setPrefs(merged);
      if (!user?.id) return;
      await supabase
        .from('user')
        .update({
          favorite_store: merged.favoriteStore,
          address: merged.address,
          lat: merged.lat,
          lng: merged.lng,
          prefered_km: merged.preferedKm,
        })
        .eq('id', user.id);
      updateProfile({
        favoriteStore: merged.favoriteStore,
        address: merged.address,
        lat: merged.lat,
        lng: merged.lng,
        preferedKm: merged.preferedKm,
      });
    },
    [prefs, user?.id, updateProfile]
  );

  const handleNotifToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        const { status } = await Notifications.requestPermissionsAsync();
        setNotificationsEnabled(status === 'granted');
        if (status === 'granted' && user?.id) {
          await registerExpoPushToken(user.id);
        }
      } else {
        if (user?.id) {
          await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
        }
        setNotificationsEnabled(false);
      }
    },
    [user?.id]
  );

  const handleLogout = useCallback(async () => {
    await signOut();
    router.replace('/dashboard');
  }, [signOut]);

  const shortAddress = prefs.address
    ? prefs.address.length > 18
      ? prefs.address.slice(0, 18) + '…'
      : prefs.address
    : 'Not set';

  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Your Name';

  return (
    <PageLayout showNavigation={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Hero: avatar / name / email / edit button ──────────────── */}
        <View style={styles.heroSection}>
          <TouchableOpacity
            onPress={() => router.push('/profile/edit')}
            style={styles.avatarTouchable}
            activeOpacity={0.85}
          >
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('../../public/avatars/default-avatar.png')
              }
              style={styles.avatar}
            />
          </TouchableOpacity>

          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroEmail}>{profile?.email || user?.email || ''}</Text>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push('/profile/edit')}
            activeOpacity={0.7}
          >
            <Text style={styles.editProfileButtonText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Preferences section ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <SettingsRow
            colors={colors}
            icon="storefront-outline"
            label="Favorite Store"
            value={prefs.favoriteStore || 'Not set'}
            onPress={() => setStoreModalVisible(true)}
          />
          <View style={styles.divider} />
          <SettingsRow
            colors={colors}
            icon="location-outline"
            label="Delivery Location"
            value={shortAddress}
            onPress={() => setLocationModalVisible(true)}
          />
          <View style={styles.divider} />
          <SettingsRow
            colors={colors}
            icon="navigate-outline"
            label="Delivery Distance"
            value={`${prefs.preferedKm} km`}
            onPress={() => {
              setTempKm(String(prefs.preferedKm));
              setDistanceModalVisible(true);
            }}
          />
        </View>

        {/* ── Settings section ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <SettingsRow
            colors={colors}
            icon="notifications-outline"
            label="Notifications"
            value={notificationsEnabled ? 'Enabled' : 'Disabled'}
            valueColor={notificationsEnabled ? colors['shelivery-success-green'] : colors['shelivery-text-disabled']}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotifToggle}
                trackColor={{ false: colors['shelivery-card-border'], true: colors['shelivery-primary-yellow'] }}
                thumbColor={notificationsEnabled ? '#111827' : '#f4f3f4'}
                style={{ marginLeft: 8 }}
              />
            }
          />
          <View style={styles.divider} />

          {/* ── Dark Mode toggle ── */}
          <SettingsRow
            colors={colors}
            icon={isDark ? 'moon' : 'sunny-outline'}
            label="Dark Mode"
            value={isDark ? 'On' : 'Off'}
            valueColor={isDark ? colors['shelivery-badge-blue-text'] : colors['shelivery-text-tertiary']}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleColorScheme}
                trackColor={{ false: colors['shelivery-card-border'], true: colors['shelivery-primary-blue'] }}
                thumbColor={isDark ? colors['shelivery-primary-yellow'] : '#f4f3f4'}
                style={{ marginLeft: 8 }}
              />
            }
          />
          <View style={styles.divider} />

          <SettingsRow
            colors={colors}
            icon="phone-portrait-outline"
            label="Follow System Theme"
            onPress={() => setColorScheme(null)}
          />
        </View>

        {/* ── Logout ────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <NavBarSpacer />
      </ScrollView>

      {/* ════ Store modal ════════════════════════════════════════════ */}
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Store</Text>
              <TouchableOpacity
                onPress={() => setStoreModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={colors['shelivery-text-secondary']} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={shops}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.storeListContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const isSelected = prefs.favoriteStore === item;
                return (
                  <TouchableOpacity
                    style={[styles.storeItem, isSelected && styles.storeItemSelected]}
                    onPress={() => {
                      savePrefs({ favoriteStore: item });
                      setStoreModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.storeItemText, isSelected && styles.storeItemTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={colors['shelivery-text-primary']} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>

      {/* ════ Distance modal ═════════════════════════════════════════ */}
      <Modal
        visible={distanceModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDistanceModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDistanceModalVisible(false)}
        >
          <SafeAreaView style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Distance</Text>
              <TouchableOpacity
                onPress={() => setDistanceModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={colors['shelivery-text-secondary']} />
              </TouchableOpacity>
            </View>
            <View style={styles.distanceBody}>
              <Text style={styles.distanceHint}>
                Enter your maximum delivery distance (1–20 km)
              </Text>
              <TextInput
                style={styles.distanceInput}
                keyboardType="numeric"
                value={tempKm}
                onChangeText={setTempKm}
                maxLength={2}
                autoFocus
                selectTextOnFocus
                placeholderTextColor={colors['shelivery-text-tertiary']}
              />
              <TouchableOpacity
                style={styles.distanceSaveButton}
                activeOpacity={0.8}
                onPress={() => {
                  const val = parseInt(tempKm);
                  if (!isNaN(val) && val >= 1 && val <= 20) {
                    savePrefs({ preferedKm: val });
                    setDistanceModalVisible(false);
                  }
                }}
              >
                <Text style={styles.distanceSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>

      {/* ════ Location modal ═════════════════════════════════════════ */}
      <Modal
        visible={locationModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.locationModalOverlay}>
          <SafeAreaView style={styles.locationModalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Location</Text>
              <TouchableOpacity
                onPress={() => setLocationModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={colors['shelivery-text-secondary']} />
              </TouchableOpacity>
            </View>
            <View style={styles.locationBody}>
              <MapboxLocationPicker
                label="Search your address"
                placeholder="Search for your delivery address..."
                initialLocation={
                  prefs.lat && prefs.lng
                    ? { longitude: prefs.lng, latitude: prefs.lat, address: prefs.address }
                    : undefined
                }
                onLocationSelect={(loc) => {
                  savePrefs({
                    address: loc.address ?? '',
                    lat: loc.latitude,
                    lng: loc.longitude,
                  });
                  setLocationModalVisible(false);
                }}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </PageLayout>
  );
}
