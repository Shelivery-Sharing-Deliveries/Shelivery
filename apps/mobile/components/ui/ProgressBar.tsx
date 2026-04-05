import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Avatar } from "./Avatar";
import { useEffect, useState } from "react";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface ProgressBarProps {
  current: number;
  target: number;
  users?: Array<{
    id: string;
    name: string;
    avatar?: string | null;
    amount: number;
  }>;
  className?: string;
  containerStyle?: ViewStyle;
  showPercentage?: boolean;
  animated?: boolean;
  showAmount?: boolean;
  currency?: string;
  variant?: 'default' | 'shops' | 'pool';
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { marginBottom: 16 },
  progressBarBackground: {
    height: 16,
    backgroundColor: colors['shelivery-card-border'],
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 9999 },
  userAvatarsContainer: {
    position: 'absolute', top: -24, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  userAvatarWrapper: {
    position: 'absolute', flexDirection: 'column', alignItems: 'center',
    transform: [{ translateX: -27 }],
  },
  progressInfo: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 16,
  },
  progressAmountText: { fontSize: 14, color: colors['shelivery-text-secondary'] },
  progressPercentageText: { fontSize: 14, color: colors['shelivery-text-primary'], fontWeight: '500' },
  completionBadge: { marginTop: 16, alignItems: 'center' },
  completionBadgeText: {
    backgroundColor: colors['shelivery-badge-green-bg'],
    color: colors['shelivery-badge-green-text'],
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 9999, fontSize: 12, fontWeight: '600',
  },
});

export function ProgressBar({
  current,
  target,
  users = [],
  showPercentage = true,
  showAmount = true,
  currency = "CHF",
  variant = "default",
  containerStyle,
}: ProgressBarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const safeCurrent = typeof current === 'number' ? current : parseFloat(current as any) || 0;
  const safeTarget = typeof target === 'number' ? target : parseFloat(target as any) || 0;
  const percentage = safeTarget > 0 ? Math.min((safeCurrent / safeTarget) * 100, 100) : 0;
  const isComplete = percentage >= 100;

  useEffect(() => { setIsLoaded(true); }, []);

  const getFillColor = () => {
    switch (variant) {
      case 'shops': return colors['shelivery-primary-blue'];
      case 'pool': return colors['shelivery-success-green'];
      default: return isComplete ? colors['shelivery-success-green'] : colors['shelivery-primary-yellow'];
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: getFillColor() }]} />
      </View>

      {users.length > 0 && (
        <View style={styles.userAvatarsContainer}>
          {users.map((user, index) => {
            const userPercentageAmount = users
              .slice(0, index + 1)
              .reduce((sum, u) => sum + (typeof u.amount === 'number' ? u.amount : parseFloat(u.amount as any) || 0), 0);
            const position = safeTarget > 0 ? Math.min((userPercentageAmount / safeTarget) * 100, 100) : 0;
            return (
              <View
                key={user.id}
                style={[styles.userAvatarWrapper, { left: `${position}%` }, { opacity: userPercentageAmount <= safeCurrent ? 1 : 0.5 }]}
              >
                <Avatar src={user.avatar} name={user.name} size="sm" />
              </View>
            );
          })}
        </View>
      )}

      {showAmount && (
        <View style={styles.progressInfo}>
          <Text style={styles.progressAmountText}>
            {safeCurrent.toFixed(0)} / {safeTarget.toFixed(0)}
            {currency && ` ${currency}`}
          </Text>
          {showPercentage && (
            <Text style={styles.progressPercentageText}>{percentage.toFixed(0)}%</Text>
          )}
        </View>
      )}

      {isComplete && (
        <View style={styles.completionBadge}>
          <Text style={styles.completionBadgeText}>Pool Complete!</Text>
        </View>
      )}
    </View>
  );
}
