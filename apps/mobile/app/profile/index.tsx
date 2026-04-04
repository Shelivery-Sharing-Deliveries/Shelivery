import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import BackArrow from '../../public/icons/back-arrow.svg';
import PageLayout from '../../components/ui/PageLayout';
import { GeneralTab } from '../../components/profile/GeneralTab';
import { PreferencesTab } from '../../components/profile/PreferencesTab';
import { NotificationsTab } from '../../components/profile/NotificationsTab';
import { TabNavigation } from '../../components/profile/TabNavigation';
import { supabase } from '../../lib/supabase';
import { launchImageLibrary } from 'react-native-image-picker';
import { router } from 'expo-router';
import { useAuthContext } from '@/providers/AuthProvider';
import { useUserStore } from '@/store/userStore';

type TabType = 'general' | 'preferences' | 'notifications';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  dormitory: string;
  favoriteStore: string;
  address: string;
  lat: number | null;
  lng: number | null;
  preferedKm: number;
}

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

function resolveImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_BASE_URL) return `${API_BASE_URL}${url}`;
  return url;
}

export default function ProfileEditPage() {
  const { user, profile, refreshProfile, signOut } = useAuthContext();
  const { updateProfile } = useUserStore();

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dormitories, setDormitories] = useState<string[]>([]);
  const [shops, setShops] = useState<string[]>([]);

  // Initialize form from cached profile (instant, no network call)
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    email: profile?.email ?? user?.email ?? '',
    dormitory: profile?.dormitory ?? '',
    favoriteStore: profile?.favoriteStore ?? '',
    address: profile?.address ?? '',
    lat: profile?.lat ?? null,
    lng: profile?.lng ?? null,
    preferedKm: profile?.preferedKm ?? 5,
  });

  // ── Hydrate form when profile loads from cache or refreshes ─────────────────
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email || user?.email || '',
        dormitory: profile.dormitory,
        favoriteStore: profile.favoriteStore,
        address: profile.address,
        lat: profile.lat,
        lng: profile.lng,
        preferedKm: profile.preferedKm,
      });
      setProfileImage(resolveImageUrl(profile.imageUrl));
    }
  }, [profile]);

  // ── Fetch dormitories & shops (static reference data) ───────────────────────
  useEffect(() => {
    const loadReferenceData = async () => {
      const [dormRes, shopRes] = await Promise.all([
        supabase.from('dormitory').select('name'),
        supabase.from('shop').select('name'),
      ]);
      if (!dormRes.error && dormRes.data) {
        setDormitories(dormRes.data.map((d) => d.name));
      }
      if (!shopRes.error && shopRes.data) {
        setShops(shopRes.data.map((s) => s.name));
      }
    };
    loadReferenceData();
  }, []);

  const handleInputChange = (field: keyof ProfileFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (locationData: { longitude: number; latitude: number; address?: string }) => {
    setFormData((prev) => ({
      ...prev,
      address: locationData.address ?? '',
      lat: locationData.latitude,
      lng: locationData.longitude,
    }));
  };

  const handleImageUpload = async () => {
    if (!user?.id) return;

    launchImageLibrary({ mediaType: 'photo', quality: 1 }, async (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        console.error('ImagePicker Error: ', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          try {
            const fileExtension = asset.uri.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExtension}`;
            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(fileName, { uri: asset.uri, type: asset.type, name: fileName } as any, {
                cacheControl: '3600',
                upsert: true,
              });

            if (uploadError) {
              console.error('Error uploading image:', uploadError);
              return;
            }

            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);

            const r2Path = publicUrlData.publicUrl.split('public/')[1];
            const proxyUrl = `/api/images/${r2Path}`;

            const { error: updateError } = await supabase
              .from('user')
              .update({ image: proxyUrl })
              .eq('id', user.id);

            if (updateError) {
              console.error('Failed to update user profile image:', updateError);
              return;
            }

            // Update MMKV cache immediately (no re-fetch needed)
            updateProfile({ imageUrl: resolveImageUrl(proxyUrl) });
            setProfileImage(resolveImageUrl(proxyUrl));
          } catch (err) {
            console.error('Upload error:', err);
          }
        }
      }
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('user')
      .update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        favorite_store: formData.favoriteStore,
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
        prefered_km: formData.preferedKm,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving profile:', error);
    } else {
      // Update MMKV cache with new values immediately
      updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        favoriteStore: formData.favoriteStore,
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
        preferedKm: formData.preferedKm,
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/dashboard');
  };

  const header = (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => { router.back(); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <BackArrow width={24} height={24} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Edit Profile</Text>
    </View>
  );

  return (
    <PageLayout header={header} showNavigation={false}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <View style={styles.tabContent}>
          {activeTab === 'general' && (
            <GeneralTab
              formData={{ firstName: formData.firstName, lastName: formData.lastName, email: formData.email }}
              profileImage={profileImage}
              onInputChange={handleInputChange}
              onImageUpload={handleImageUpload}
              onSave={handleSave}
            />
          )}
          {activeTab === 'preferences' && (
            <PreferencesTab
              formData={{
                favoriteStore: formData.favoriteStore,
                dormitory: formData.dormitory,
                address: formData.address,
                lat: formData.lat,
                lng: formData.lng,
                preferedKm: formData.preferedKm,
              }}
              shops={shops}
              onInputChange={handleInputChange}
              onLocationSelect={handleLocationSelect}
              onSave={handleSave}
            />
          )}
          {activeTab === 'notifications' && <NotificationsTab />}
        </View>
        <View style={styles.logoutButtonContainer}>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  scrollContent: { paddingBottom: 20 },
  tabContent: { paddingHorizontal: 16 },
  logoutButtonContainer: { paddingHorizontal: 16, marginTop: 32 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 0,
    width: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 16,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
});
