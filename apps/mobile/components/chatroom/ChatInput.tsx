import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, Text, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import VoiceMessageBubble from './VoiceMessageBubble'; // Import the new VoiceMessageBubble

interface ChatInputProps {
  onSendMessage: (content: string | { type: 'audio' | 'image', url: string }) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<any>(null); // Changed to any to resolve type error

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [selectedImage, recordedAudioUrl]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const sendImage = () => {
    if (selectedImage) {
      onSendMessage({ type: 'image', url: selectedImage });
      setSelectedImage(null);
    }
  };

  const startRecording = async () => {
    if (isRecording || isUploadingAudio) return;

    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Microphone access failed. Ensure permissions are granted.');
      releaseAudioResources();
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    if (uri) {
      setRecordedAudioUrl(uri);
    }
    recordingRef.current = null;
  };

  const releaseAudioResources = () => {
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const sendRecordedAudio = () => {
    if (recordedAudioUrl) {
      onSendMessage({ type: 'audio', url: recordedAudioUrl });
      setRecordedAudioUrl(null);
    }
  };

  const discardRecording = () => {
    setRecordedAudioUrl(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };

  if (disabled) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>This chat is read-only</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {selectedImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity onPress={sendImage} style={styles.sendButton}><Ionicons name='send' size={16} color='#fff' /></TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.cancelButton}><Ionicons name='close' size={16} color='#000' /></TouchableOpacity>
        </View>
      )}

      {recordedAudioUrl && (
        <View style={styles.audioPreviewContainer}>
          <VoiceMessageBubble src={recordedAudioUrl} />
          <TouchableOpacity onPress={sendRecordedAudio} style={styles.sendButton}><Ionicons name='send' size={16} color='#fff' /></TouchableOpacity>
          <TouchableOpacity onPress={discardRecording} style={styles.cancelButton}><Ionicons name='close' size={16} color='#000' /></TouchableOpacity>
        </View>
      )}

      <View style={styles.container}>
        <TouchableOpacity style={styles.iconButton} onPress={handleImagePicker}>
          <Ionicons name='add' size={24} color='#6b7280' />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder='Message...'
          multiline
        />

        {message.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSubmit}>
            <Ionicons name='send' size={20} color='#fff' />
          </TouchableOpacity>
        ) : (
          <View style={styles.recordButtonContainer}>
            {isRecording && <Text style={styles.recordingTimer}>{formatTime(recordingTime)}</Text>}
            <TouchableOpacity 
              style={styles.iconButton} 
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={24} color={isRecording ? '#ef4444' : '#6b7280'} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  iconButton: { padding: 8 },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#245b7b',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  audioPreviewContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  previewImage: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  cancelButton: { marginLeft: 10, padding: 5 },
  disabledContainer: { padding: 16, backgroundColor: '#f3f4f6', alignItems: 'center' },
  disabledText: { color: '#6b7280', fontSize: 14 },
  recordButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingTimer: {
    fontSize: 14,
    color: '#ef4444',
    marginRight: 8,
  },
});
