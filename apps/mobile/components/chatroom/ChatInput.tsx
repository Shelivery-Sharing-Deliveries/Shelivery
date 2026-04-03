import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import VoiceMessageBubble from './VoiceMessageBubble';
import { uploadChatMedia } from '@/lib/uploadChatMedia';

interface ChatInputProps {
  chatroomId: string;
  onSendMessage: (content: string | { type: 'audio' | 'image'; url: string }) => void;
  disabled?: boolean;
}

export function ChatInput({ chatroomId, onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // ─── Text message ──────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  // ─── Image picking ─────────────────────────────────────────────────────────

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

  const sendImage = async () => {
    if (!selectedImage) return;

    setIsUploadingImage(true);
    const { url, error } = await uploadChatMedia(selectedImage, chatroomId, 'image');
    setIsUploadingImage(false);

    if (error || !url) {
      Alert.alert('Upload failed', error || 'Could not upload image. Please try again.');
      return;
    }

    onSendMessage({ type: 'image', url });
    setSelectedImage(null);
  };

  // ─── Audio recording ───────────────────────────────────────────────────────

  /**
   * Custom recording preset that produces AAC/M4A on iOS and Android.
   * The default HIGH_QUALITY preset records CAF (Linear PCM) on iOS which
   * web browsers cannot play. M4A (AAC) is supported on iOS, Android AND web.
   * Web still records WebM (browser limitation) but that plays fine in browsers.
   */
  const RECORDING_OPTIONS: Audio.RecordingOptions = {
    isMeteringEnabled: true,
    android: {
      extension: '.m4a',
      outputFormat: 3, // MPEG_4
      audioEncoder: 3, // AAC
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      audioQuality: Audio.IOSAudioQuality.HIGH,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  };

  const startRecording = async () => {
    if (isRecording || isUploadingAudio) return;

    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Microphone Error', 'Could not access microphone. Please check permissions.');
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

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      if (uri) {
        setRecordedAudioUrl(uri);
      }
    } catch (e) {
      console.error('Stop recording error', e);
    }
    recordingRef.current = null;
  };

  const releaseAudioResources = () => {
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const sendRecordedAudio = async () => {
    if (!recordedAudioUrl) return;

    setIsUploadingAudio(true);
    const { url, error } = await uploadChatMedia(recordedAudioUrl, chatroomId, 'audio');
    setIsUploadingAudio(false);

    if (error || !url) {
      Alert.alert('Upload failed', error || 'Could not upload audio. Please try again.');
      return;
    }

    onSendMessage({ type: 'audio', url });
    setRecordedAudioUrl(null);
    setRecordingTime(0);
  };

  const discardRecording = () => {
    setRecordedAudioUrl(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  };

  // ─── Disabled state ────────────────────────────────────────────────────────

  if (disabled) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>This chat is read-only</Text>
      </View>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View>
      {/* Image preview */}
      {selectedImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity
            onPress={sendImage}
            style={styles.sendButton}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={16} color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.cancelButton}>
            <Ionicons name="close" size={16} color="#374151" />
          </TouchableOpacity>
        </View>
      )}

      {/* Audio preview (before sending) */}
      {recordedAudioUrl && (
        <View style={styles.audioPreviewContainer}>
          <VoiceMessageBubble src={recordedAudioUrl} />
          <TouchableOpacity
            onPress={sendRecordedAudio}
            style={[styles.sendButton, styles.sendButtonSmall]}
            disabled={isUploadingAudio}
          >
            {isUploadingAudio ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={16} color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={discardRecording} style={styles.cancelButton}>
            <Ionicons name="close" size={16} color="#374151" />
          </TouchableOpacity>
        </View>
      )}

      {/* Main input bar */}
      <View style={styles.container}>
        <TouchableOpacity style={styles.iconButton} onPress={handleImagePicker}>
          <Ionicons name="add" size={24} color="#6b7280" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Message..."
          placeholderTextColor="#9ca3af"
          multiline
          returnKeyType="default"
        />

        {message.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSubmit}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.recordButtonContainer}>
            {isRecording && (
              <Text style={styles.recordingTimer}>{formatTime(recordingTime)}</Text>
            )}
            <TouchableOpacity
              style={styles.iconButton}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Ionicons
                name={isRecording ? 'mic' : 'mic-outline'}
                size={24}
                color={isRecording ? '#ef4444' : '#6b7280'}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
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
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 100,
    color: '#111827',
  },
  sendButton: {
    backgroundColor: '#245b7b',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonSmall: {
    marginLeft: 8,
    flexShrink: 0,
  },
  previewContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
  },
  audioPreviewContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  cancelButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    marginLeft: 4,
  },
  disabledContainer: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  disabledText: {
    color: '#6b7280',
    fontSize: 14,
  },
  recordButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingTimer: {
    fontSize: 14,
    color: '#ef4444',
    marginRight: 4,
    fontVariant: ['tabular-nums'],
  },
});
