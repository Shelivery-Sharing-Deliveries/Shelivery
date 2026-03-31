import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ViewStyle } from "react-native";
import { getInitials, getInitialsColor, optimizeImageUrl } from "@/lib/utils";
import { colors, borderRadius } from "@/lib/theme";

interface AvatarProps {
  src?: string | null | undefined;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  style?: ViewStyle;
}

const sizeMap = {
  sm: {
    size: 32,
    fontSize: 12,
    borderWidth: 1,
  },
  md: {
    size: 48,
    fontSize: 14,
    borderWidth: 2,
  },
  lg: {
    size: 64,
    fontSize: 16,
    borderWidth: 2,
  },
  xl: {
    size: 80,
    fontSize: 20,
    borderWidth: 2,
  },
};

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md", style }) => {
  const [imageError, setImageError] = useState(false);

  const sizeConfig = sizeMap[size];
  const optimizedSrc = optimizeImageUrl(src);
  const initials = getInitials(name);
  const backgroundColor = getInitialsColor(name);

  const avatarStyles: ViewStyle = {
    width: sizeConfig.size,
    height: sizeConfig.size,
    borderRadius: sizeConfig.size / 2,
    borderWidth: sizeConfig.borderWidth,
    borderColor: colors["shelivery-primary-yellow"],
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  };

  const initialsStyles = {
    fontSize: sizeConfig.fontSize,
    color: colors.white,
    fontWeight: "600" as const,
  };

  return (
    <View style={[avatarStyles, style]}>
      {optimizedSrc && !imageError ? (
        <Image
          source={{ uri: optimizedSrc }}
          style={styles.image}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.initialsContainer, { backgroundColor }]}>
          <Text style={initialsStyles}>{initials}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  initialsContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});