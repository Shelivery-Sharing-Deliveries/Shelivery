import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';

interface VoiceWaveformBubbleProps {
  src: string;
}

export default function VoiceWaveformBubble({ src }: VoiceWaveformBubbleProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      try {
        // Unload any previous sound
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        // Set audio mode so it plays through speaker
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: src },
          { shouldPlay: false },
          (status: AVPlaybackStatus) => {
            if (!isMounted) return;
            if (status.isLoaded) {
              setIsLoaded(true);
              setPosition(status.positionMillis);
              setDuration(status.durationMillis ?? 0);
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                sound.setPositionAsync(0);
              }
            }
          }
        );

        if (isMounted) {
          soundRef.current = sound;
          setIsLoaded(true);
          setLoadError(false);
        } else {
          // Component unmounted while loading — clean up
          await sound.unloadAsync();
        }
      } catch (e) {
        console.warn('VoiceMessageBubble: failed to load audio', e);
        if (isMounted) setLoadError(true);
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      setIsLoaded(false);
    };
  }, [src]);

  const togglePlayback = async () => {
    if (!soundRef.current || !isLoaded) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (e) {
      console.warn('VoiceMessageBubble: playback error', e);
    }
  };

  const handleSeek = async (value: number) => {
    if (!soundRef.current || !isLoaded) return;
    try {
      await soundRef.current.setPositionAsync(value);
    } catch (e) {
      // ignore seek errors
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
        <Text style={styles.errorText}>Audio unavailable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={togglePlayback}
        style={[styles.playButton, !isLoaded && styles.playButtonDisabled]}
        disabled={!isLoaded}
      >
        {!isLoaded ? (
          <Ionicons name="hourglass-outline" size={16} color="#9ca3af" />
        ) : (
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color="#374151" />
        )}
      </TouchableOpacity>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration > 0 ? duration : 1}
          value={position}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#ffdb0d"
          maximumTrackTintColor="#d1d5db"
          thumbTintColor="#ffdb0d"
          disabled={!isLoaded}
        />
        <Text style={styles.timeText}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
    flex: 1,
  },
  playButton: {
    backgroundColor: '#ffdb0b',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  playButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  sliderContainer: {
    flex: 1,
    marginLeft: 10,
  },
  slider: {
    width: '100%',
    height: 20,
  },
  timeText: {
    fontSize: 10,
    color: '#6b7280',
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },
});
