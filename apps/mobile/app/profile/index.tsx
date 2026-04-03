import React, { use, useEffect, useState } from 'react';
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

export default function ProfileEditPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    dormitory: '',
    favoriteStore: '',
    address: '',
    lat: null,
    lng: null,
    preferedKm: 5,
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dormitories, setDormitories] = useState<string[]>([]);
  const [shops, setShops] = useState<string[]>([]);

  // Fetch options and user data on mount
  useEffect(() => {
    const load = async () => {
      const { data: userAuth } = await supabase.auth.getUser();
      const user = userAuth?.user;
      if (!user) return;
      setUserId(user.id);
      setFormData((prev) => ({
        ...prev,
        email: user.email ?? '',
        firstName: (user as any).first_name || '',
      }));

      // Fetch user profile data
       const { data, error } = await supabase
                .from("user")
                .select("first_name, last_name, email, favorite_store, dormitory(name), image, address, lat, lng, prefered_km")
                .eq("id", user.id)
                .single();
      console.log("Fetched user profile data:", data, "Error:", error);
      if (!error && data) {
        setFormData((prev) => ({
          ...prev,
          firstName: data.first_name || prev.firstName,
          lastName: data.last_name || prev.lastName,
          email: data.email || prev.email,
          dormitory: Array.isArray(data.dormitory)
            ? data.dormitory[0]?.name ?? ''
            : (data.dormitory as { name: string } | null)?.name ?? '',
          favoriteStore: data.favorite_store || prev.favoriteStore,
          address: data.address || prev.address,
          lat: data.lat ?? prev.lat,
          lng: data.lng ?? prev.lng,
          preferedKm: data.prefered_km ?? prev.preferedKm,

        }));
        if (data.image) setProfileImage("https://app.shelivery.com/" + data.image);
      }

      // Fetch dormitories
      const { data: dormData, error: dormError } = await supabase
        .from("dormitory")
        .select("name");

      if (!dormError && dormData) {
        setDormitories(dormData.map((d) => d.name));
      } else if (dormError) {
        console.error("Error fetching dormitories:", dormError);
      }

      // Fetch shops
      const { data: shopData, error: shopError } = await supabase
        .from("shop")
        .select("name");

      if (!shopError && shopData) {
        setShops(shopData.map((s) => s.name));
      } else if (shopError) {
        console.error("Error fetching shops:", shopError);
      }
    };
    load();
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
    if (!userId) return;

    launchImageLibrary({ mediaType: 'photo', quality: 1 }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          try {
            const fileExtension = asset.uri.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExtension}`;
            const { data, error } = await supabase.storage
              .from('avatars')
              .upload(fileName, { uri: asset.uri, type: asset.type, name: fileName } as any, {
                cacheControl: '3600',
                upsert: true,
              });

            if (error) {
              console.error('Error uploading image:', error);
              return;
            }

            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);

            console.log('Upload publicUrl:', publicUrlData.publicUrl);

            const r2Path = publicUrlData.publicUrl.split('public/')[1];
            const proxyUrl = `/api/images/${r2Path}`;

            const { error: updateError } = await supabase
              .from('user')
              .update({ image: proxyUrl })
              .eq('id', userId);

            if (updateError) {
              console.error('Failed to update user profile in database:', updateError);
              return;
            }

            setProfileImage(proxyUrl);

            console.log("Profile image updated successfully!");

          } catch (uploadError) {
            console.error('Upload error:', uploadError);
          }
        }
      }
    });
  };

  const handleSave = async () => {
    if (!userId) return;
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
      .eq('id', userId);
    if (error) {
      console.error('Error saving profile:', error);
    } else {
      console.log('Profile saved successfully!');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        dormitory: "",
        favoriteStore: "",
        address: "",
        lat: null,
        lng: null,
        preferedKm: 5,
      });
      setProfileImage(null);
      setUserId(null);
      router.replace('/dashboard'); // Navigate to login page after logout
      console.log("Logged out successfully, implement navigation to login/home.");
    }
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
  logoutButtonContainer: { paddingHorizontal: 16, marginTop: 32 }, // px-4 mt-8
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // gap-2
    paddingVertical: 12, // py-3
    paddingHorizontal: 0, // px-0
    width: '100%',
    backgroundColor: '#EF4444', // bg-red-500
    borderRadius: 16,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    lineHeight: 26, // leading-[26px]
  },
});
