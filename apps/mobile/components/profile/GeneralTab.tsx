
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface GeneralTabProps {
  formData: ProfileFormData;
  profileImage: string | null;
  onInputChange: (field: keyof ProfileFormData, value: string) => void;
  onImageUpload: () => void; // Modified for RN, will trigger native image picker
  onSave: () => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  formData,
  profileImage,
  onInputChange,
  onImageUpload,
  onSave,
}) => {
  return (
    <View style={styles.container}>
      {/* Profile Picture Upload */}
      <TouchableOpacity
        style={styles.imageUploadButton}
        onPress={onImageUpload}
      >
        <Image
          source={profileImage ? { uri: profileImage } : require('../../public/avatars/default-avatar.png')}
          style={styles.profileImage}
        />
        <View style={styles.uploadOverlay}>
          <Image
            source={require('../../public/icons/upload-icon.svg')}
            style={styles.uploadIcon}
          />
          <Text style={styles.uploadText}>
            Upload
          </Text>
        </View>
      </TouchableOpacity>

      {/* Form Fields */}
      <View style={styles.formFieldsContainer}>
        {/* First Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            First Name
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={formData.firstName}
              onChangeText={(text) => onInputChange("firstName", text)}
              style={styles.textInput}
            />
          </View>
        </View>

        {/* Last Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Last Name
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={formData.lastName}
              onChangeText={(text) => onInputChange("lastName", text)}
              style={styles.textInput}
            />
          </View>
        </View>

        {/* Email (read-only) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Email
          </Text>
          <View style={[styles.inputWrapper, styles.readOnlyInput]}>
            <TextInput
              value={formData.email}
              editable={false}
              style={[styles.textInput, styles.readOnlyTextInput]}
            />
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={onSave}
        style={styles.saveButton}
      >
        <Text style={styles.saveButtonText}>
          Save Changes
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32, // gap-8
    width: '100%',
  },
  imageUploadButton: {
    position: 'relative',
    width: 126,
    height: 126,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ccc', // Placeholder background
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 31,
    backgroundColor: '#FFE65B',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4, // gap-1
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
  },
  uploadIcon: {
    width: 16,
    height: 16,
  },
  uploadText: {
    color: 'black',
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    lineHeight: 20, // leading-5
  },
  formFieldsContainer: {
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
  },
  saveButtonText: {
    color: 'black',
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    lineHeight: 26, // leading-[26px]
  },
});
