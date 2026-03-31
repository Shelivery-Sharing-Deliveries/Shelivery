import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "./Avatar"; // Assuming Avatar is in the same folder or adjust path
import { useEffect, useState } from "react";
import { colors } from "@/lib/theme";

interface ProgressBarProps {
  current: number;
  target: number;
  users?: Array<{
    id: string;
    name: string;
    avatar?: string | null;
    amount: number;
  }>;
  className?: string; // Not directly used in RN, but kept for compatibility
  showPercentage?: boolean;
  animated?: boolean; // Animation handled differently in RN
  showAmount?: boolean;
  currency?: string;
  variant?: 'default' | 'shops' | 'pool';
}

export function ProgressBar({
  current,
  target,
  users = [],
  showPercentage = true,
  showAmount = true,
  currency = "CHF",
  variant = "default",
}: ProgressBarProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const safeCurrent = typeof current === 'number' ? current : parseFloat(current as any) || 0;
  const safeTarget = typeof target === 'number' ? target : parseFloat(target as any) || 0;

  const percentage = safeTarget > 0 ? Math.min((safeCurrent / safeTarget) * 100, 100) : 0;
  const isComplete = percentage >= 100;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getFillColor = () => {
    switch (variant) {
      case 'shops':
        return colors['shelivery-primary-blue'];
      case 'pool':
        return colors['shelivery-success-green'];
      default:
        return isComplete ? colors['shelivery-success-green'] : colors['shelivery-primary-yellow'];
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: getFillColor() },
          ]}
        />
        {/* Wave overlay is not directly translatable to React Native without complex custom animations */}
      </View>

      {/* User avatars positioned along progress bar */}
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
                style={[
                  styles.userAvatarWrapper,
                  { left: `${position}%` },
                  { opacity: userPercentageAmount <= safeCurrent ? 1 : 0.5 }
                ]}
              >
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="sm"
                />
              </View>
            );
          })}
        </View>
      )}

      {/* Progress information */}
      {showAmount && (
        <View style={styles.progressInfo}>
          <Text style={styles.progressAmountText}>
            {safeCurrent.toFixed(0)} / {safeTarget.toFixed(0)}
            {currency && ` ${currency}`}
          </Text>
          {showPercentage && (
            <Text style={styles.progressPercentageText}>
              {percentage.toFixed(0)}%
            </Text>
          )}
        </View>
      )}

      {/* Completion status */}
      {isComplete && (
        <View style={styles.completionBadge}>
          <Text style={styles.completionBadgeText}>
            Pool Complete!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // space-y-4
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 16, // shelivery-progress-bar height
    backgroundColor: colors['shelivery-card-border'], // shelivery-progress-bar background
    borderRadius: 9999, // rounded-full
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999, // rounded-full
    // transition-all duration-500 ease-out is handled by LayoutAnimation or Animated API if needed
  },
  userAvatarsContainer: {
    position: 'absolute',
    top: -24, // -top-6
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  userAvatarWrapper: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    transform: [{ translateX: -27 }], // Half of avatar width (54/2)
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16, // text-sm
  },
  progressAmountText: {
    fontSize: 14,
    color: colors['shelivery-text-secondary'],
  },
  progressPercentageText: {
    fontSize: 14,
    color: colors['shelivery-text-primary'],
    fontWeight: '500', // font-medium
  },
  completionBadge: {
    marginTop: 16,
    alignItems: 'center',
  },
  completionBadgeText: {
    backgroundColor: colors['shelivery-badge-green-bg'], // shelivery-badge shelivery-badge-delivered
    color: colors['shelivery-badge-green-text'],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: '600',
  },
});
