import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av'; // Import AVPlaybackStatus
import Slider from '@react-native-community/slider';

interface VoiceWaveformBubbleProps {
  src: string;
  className?: string; // Not directly used in RN, but kept for compatibility
}

export default function VoiceWaveformBubble({ src }: VoiceWaveformBubbleProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const loadSound = async () => {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: src },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [src]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => { // Use AVPlaybackStatus
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        soundRef.current?.setPositionAsync(0);
      }
    }
  };

  const togglePlayback = async () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const getFormattedTime = (millis: number) => { // Corrected function name
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color="#374151" />
      </TouchableOpacity>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={async (value) => {
            if (soundRef.current) {
              await soundRef.current.setPositionAsync(value);
            }
          }}
          minimumTrackTintColor="#ffdb0d"
          maximumTrackTintColor="#d1d5db"
          thumbTintColor="#ffdb0d"
        />
        <Text style={styles.timeText}>{getFormattedTime(position)} / {getFormattedTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
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
  sliderContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 20,
  },
  timeText: {
    fontSize: 10,
    color: '#6b7280',
    alignSelf: 'flex-end',
    marginTop: -5,
  },
});
