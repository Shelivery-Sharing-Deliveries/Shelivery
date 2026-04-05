import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuthContext } from '@/providers/AuthProvider';
import { useUserStore } from '@/store/userStore';
import { supabase } from '../../lib/supabase';
import PageLayout from '../../components/ui/PageLayout';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

function resolveImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_BASE_URL) return `${API_BASE_URL}${url}`;
  return url;
}

interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function EditProfilePage() {
  const { user, profile } = useAuthContext();
  const { updateProfile } = useUserStore();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [form, setForm] = useState<EditFormData>({
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    email: profile?.email ?? user?.email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Hydrate from profile cache
  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        email: profile.email || user?.email || '',
      });
      setProfileImage(resolveImageUrl(profile.imageUrl));
    }
  }, [profile]);

  const handleImageUpload = async () => {
    if (!user?.id) return;
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, async (response) => {
      if (response.didCancel || response.errorMessage) return;
      const asset = response.assets?.[0];
      if (!asset?.uri) return;
      try {
        const ext = asset.uri.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, { uri: asset.uri, type: asset.type, name: fileName } as any, {
            cacheControl: '3600',
            upsert: true,
          });
        if (uploadError) return;
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        const r2Path = publicUrlData.publicUrl.split('public/')[1];
        const proxyUrl = `/api/images/${r2Path}`;
        await supabase.from('user').update({ image: proxyUrl }).eq('id', user.id);
        const resolved = resolveImageUrl(proxyUrl);
        updateProfile({ imageUrl: resolved });
        setProfileImage(resolved);
      } catch (err) {
        console.error('Upload error:', err);
      }
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from('user')
      .update({ first_name: form.firstName, last_name: form.lastName })
      .eq('id', user.id);
    setSaving(false);
    if (!error) {
      updateProfile({ firstName: form.firstName, lastName: form.lastName });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const header = (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={22} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Edit Profile</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <PageLayout header={header} showNavigation={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar ─────────────────────────────────────────────── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handleImageUpload} activeOpacity={0.8}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('../../public/avatars/default-avatar.png')
              }
              style={styles.avatar}
            />
            <View style={styles.uploadBadge}>
              <Ionicons name="camera" size={14} color="#111827" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Change photo</Text>
        </View>

        {/* ── Form ───────────────────────────────────────────────── */}
        <View style={styles.formSection}>
          {/* First Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={form.firstName}
                onChangeText={(t) => setForm((prev) => ({ ...prev, firstName: t }))}
                placeholder="Enter first name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Last Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={form.lastName}
                onChangeText={(t) => setForm((prev) => ({ ...prev, lastName: t }))}
                placeholder="Enter last name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Email (read-only) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={[styles.inputWrapper, styles.inputReadOnly]}>
              <TextInput
                style={[styles.input, { color: '#9CA3AF' }]}
                value={form.email}
                editable={false}
              />
              <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* ── Save button ─────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saveSuccess ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#111827" />
              <Text style={styles.saveButtonText}>Saved!</Text>
            </>
          ) : (
            <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* ── Avatar ── */
  avatarSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E8EB',
  },
  uploadBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFE75B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  changePhotoText: {
    fontSize: 13,
    color: '#6B7280',
  },

  /* ── Form ── */
  formSection: {
    marginHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginBottom: 24,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputReadOnly: {
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },

  /* ── Save ── */
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFE75B',
    borderRadius: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
