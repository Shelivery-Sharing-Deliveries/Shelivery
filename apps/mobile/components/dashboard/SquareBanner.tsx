import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Video, ResizeMode } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/solid';
import { colors } from "@/lib/theme";

interface Banner {
  id: string;
  src: string;
  alt: string;
}

interface SquareBannerProps {
  className?: string; // Not directly used in RN, but kept for compatibility
  id?: string;
  autoPlay?: boolean;
  interval?: number;
}

const banners: Banner[] = [
  {
    id: "4",
    src: "https://zsqagqzztvzogyktgjph.supabase.co/storage/v1/object/public/banners/Copy%20of%20Order.mp4",
    alt: "Order video"
  },
  {
    id: "1",
    src: require("../../public/banners/banner-1.png"),
    alt: "Welcome to Shelivery - Start Shopping"
  },
  {
    id: "2",
    src: require("../../public/banners/banner-2.png"),
    alt: "The problem"
  },
  {
    id: "3",
    src: require("../../public/banners/banner-3.png"),
    alt: "Solution"
  },
];

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];

function isVideo(src: string): boolean {
  // In React Native, local image requires are numbers, so we only check string URIs
  if (typeof src !== 'string') {
    return false;
  }
  const lower = src.toLowerCase().split("?")[0] ?? "";
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

interface BannerSlideProps {
  banner: Banner;
}

function BannerSlide({ banner }: BannerSlideProps) {
  if (isVideo(banner.src)) {
    return (
      <Video
        source={{ uri: banner.src }}
        style={styles.video}
        useNativeControls={false}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
      />
    );
  }

  return (
    <Image
      source={typeof banner.src === 'string' ? { uri: banner.src } : banner.src}
      alt={banner.alt}
      style={styles.image}
    />
  );
}

export default function SquareBanner({
  id,
  autoPlay = true,
  interval = 4000
}: SquareBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false); // Not directly applicable in RN, but kept for logic flow
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { width: screenWidth } = Dimensions.get('window');
  const bannerWidth = screenWidth - 32; // Assuming 16px padding on each side

  // Auto-advance slides
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (autoPlay && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, interval, isHovered, banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  return (
    <View style={styles.container} accessibilityLabelledBy={id}>
      <View style={styles.carouselViewport}>
        {/* Slides */}
        {banners.map((banner, index) => (
          <View
            key={banner.id}
            style={[
              styles.slide,
              { opacity: index === currentIndex ? 1 : 0 },
            ]}
          >
            <BannerSlide banner={banner} />
          </View>
        ))}

        {/* Navigation Arrows */}
        <TouchableOpacity
          onPress={goToPrevious}
          style={[styles.navButton, styles.navButtonLeft]}
          accessibilityLabel="Previous banner"
        >
          <ChevronLeftIcon size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNext}
          style={[styles.navButton, styles.navButtonRight]}
          accessibilityLabel="Next banner"
        >
          <ChevronRightIcon size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Dashed Line Indicator */}
      <View style={styles.paginationDots}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? colors.white : colors['shelivery-text-disabled'] },
            ]}
            accessibilityLabel={`Go to banner ${index + 1}`}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16, // Added for spacing
  },
  carouselViewport: {
    width: "100%",
    aspectRatio: 1, // aspect-square
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors['shelivery-background-gray'], // bg-gray-100
    position: "relative",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // object-cover
  },
  slide: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    transitionProperty: "opacity",
    transitionDuration: "500ms",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -12 }], // Half of icon size
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 9999, // rounded-full
    zIndex: 10,
  },
  navButtonLeft: {
    left: 12, // left-3
  },
  navButtonRight: {
    right: 12, // right-3
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16, // mt-4
    gap: 8, // space-x-2
  },
  dot: {
    height: 2, // h-0.5
    flex: 1, // flex-1
    borderRadius: 9999, // rounded-full
  },
});
