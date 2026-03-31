import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button, Avatar } from "@/components/ui";
import { globalStyles, mergeStyles, commonStyles } from "@/lib/globalStyles";
import { colors, spacing } from "@/lib/theme";

export default function AlphaScreen() {
  const router = useRouter();

  const features = [
    { id: 1, name: "Dashboard", description: "Overview of your pools and activity", route: "/(tabs)/dashboard" },
    { id: 2, name: "Stores", description: "Browse available stores for shopping", route: "/(tabs)/stores" },
    { id: 3, name: "Chatrooms", description: "Connect with shopping groups", route: "/(tabs)/chatrooms" },
    { id: 4, name: "Create Pool", description: "Start a new shopping pool", route: "" },
    { id: 5, name: "Profile", description: "Manage your account settings", route: "" },
    { id: 6, name: "Settings", description: "App preferences and notifications", route: "" },
  ];

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={globalStyles.heading1}>
            Shelivery Alpha
          </Text>
          <Text style={[globalStyles.body, styles.mt2]}>
            Welcome to the mobile app alpha version
          </Text>
          <Text style={globalStyles.bodySmall}>
            This is a placeholder for future features. Auth will be added later.
          </Text>
        </View>

        {/* Test Section for Migrated Components */}
        <View style={styles.testSection}>
          <Text style={styles.testSectionTitle}>
            Migrated Components Test
          </Text>
          
          <View style={styles.testComponents}>
            <View style={styles.testComponentGroup}>
              <Text style={styles.testComponentLabel}>Avatar Component:</Text>
              <View style={styles.avatarRow}>
                <Avatar size="sm" name="John Doe" />
                <Avatar size="md" name="Jane Smith" />
                <Avatar size="lg" name="Alex Johnson" />
                <Avatar size="xl" name="Sam Wilson" />
              </View>
            </View>

            <View style={styles.testComponentGroup}>
              <Text style={styles.testComponentLabel}>Button Components:</Text>
              <View style={styles.buttonColumn}>
                <Button variant="primary" size="md" style={styles.testButton}>
                  Primary Button
                </Button>
                <Button variant="secondary" size="md" style={styles.testButton}>
                  Secondary Button
                </Button>
                <Button variant="error" size="md" style={styles.testButton}>
                  Error Button
                </Button>
                <Button variant="success" size="md" style={styles.testButton}>
                  Success Button
                </Button>
                <Button variant="primary" size="sm" style={styles.testButton}>
                  Small Button
                </Button>
                <Button variant="primary" size="lg" style={styles.testButton}>
                  Large Button
                </Button>
                <Button variant="primary" loading style={styles.testButton}>
                  Loading Button
                </Button>
                <Button variant="primary" disabled style={styles.testButton}>
                  Disabled Button
                </Button>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.migrationProgressCard}>
          <Text style={styles.migrationProgressTitle}>
            Migration Progress
          </Text>
          <View style={styles.migrationProgressList}>
            <View style={styles.migrationProgressItem}>
              <View style={styles.migrationProgressBullet} />
              <Text style={styles.migrationProgressText}>Navigation Bar ✓</Text>
            </View>
            <View style={styles.migrationProgressItem}>
              <View style={styles.migrationProgressBullet} />
              <Text style={styles.migrationProgressText}>Tab Structure ✓</Text>
            </View>
            <View style={styles.migrationProgressItem}>
              <View style={styles.migrationProgressBullet} />
              <Text style={styles.migrationProgressText}>Design Tokens ✓</Text>
            </View>
            <View style={styles.migrationProgressItem}>
              <View style={styles.migrationProgressBullet} />
              <Text style={styles.migrationProgressText}>UI Components (Button, Avatar) ✓</Text>
            </View>
            <View style={styles.migrationProgressItem}>
              <View style={styles.migrationProgressBulletComingSoon} />
              <Text style={styles.migrationProgressTextComingSoon}>Authentication (Coming Soon)</Text>
            </View>
            <View style={styles.migrationProgressItem}>
              <View style={styles.migrationProgressBulletComingSoon} />
              <Text style={styles.migrationProgressTextComingSoon}>Real-time Chat</Text>
            </View>
            <View style={styles.migrationProgressItem}>
              <View style={styles.migrationProgressBulletComingSoon} />
              <Text style={styles.migrationProgressTextComingSoon}>Payment Integration</Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>
            Available Features
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
                onPress={() => feature.route && router.push(feature.route as any)}
                disabled={!feature.route}
              >
                <Text style={styles.featureName}>
                  {feature.name}
                </Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
                {!feature.route && (
                  <Text style={styles.featureComingSoon}>
                    Coming soon
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>
            Next Steps
          </Text>
          <Text style={styles.nextStepsDescription}>
            The following components will be migrated from the web app:
          </Text>
          <View style={styles.nextStepsList}>
            <Text style={styles.nextStepsItem}>• Authentication flows</Text>
            <Text style={styles.nextStepsItem}>• Pool creation wizard</Text>
            <Text style={styles.nextStepsItem}>• Real-time chat components</Text>
            <Text style={styles.nextStepsItem}>• Basket management</Text>
            <Text style={styles.nextStepsItem}>• Order tracking</Text>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Shelivery Mobile Alpha v0.1.0
          </Text>
          <Text style={styles.footerSubtext}>
            UI migrated from web app without NativeWind
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Only keep styles that are truly component-specific or not covered by globalStyles
  headerContainer: {
    marginBottom: spacing['shelivery-8'],
  },
  mt2: {
    marginTop: spacing['shelivery-2'],
  },
  testSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // bg-white/10
    borderRadius: 20, // rounded-shelivery-lg
    padding: 24, // p-6
    marginBottom: 24, // mb-6
  },
  testSectionTitle: {
    fontSize: 20, // text-xl
    fontWeight: '600', // font-semibold
    color: 'white',
    fontFamily: 'Poppins_600SemiBold', // font-poppins
    marginBottom: 16, // mb-4
  },
  testComponents: {
    rowGap: 24, // space-y-6
  },
  testComponentGroup: {
    rowGap: 12, // space-y-3
  },
  testComponentLabel: {
    color: 'rgba(255, 255, 255, 0.9)', // text-white/90
    fontFamily: 'Inter_500Medium', // font-inter
    fontSize: 16, // text-base
    marginBottom: 8, // mb-2
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // gap-4
    flexWrap: 'wrap',
  },
  buttonColumn: {
    rowGap: 12, // space-y-3
  },
  testButton: {
    marginBottom: 8, // mb-2
  },
  migrationProgressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // bg-white/10
    borderRadius: 20, // rounded-shelivery-lg
    padding: 24, // p-6
    marginBottom: 24, // mb-6
    // backdrop-blur-sm is not directly supported in React Native, might need a library
  },
  migrationProgressTitle: {
    fontSize: 20, // text-xl
    fontWeight: '600', // font-semibold
    color: 'white',
    fontFamily: 'Poppins_600SemiBold', // font-poppins
    marginBottom: 12, // mb-3
  },
  migrationProgressList: {
    rowGap: 16, // space-y-4
  },
  migrationProgressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  migrationProgressBullet: {
    width: 12, // w-3
    height: 12, // h-3
    borderRadius: 6, // rounded-full
    backgroundColor: '#FFDB0D', // bg-shelivery-primary-yellow
    marginRight: 12, // mr-3
  },
  migrationProgressText: {
    color: 'white',
    fontFamily: 'Inter_400Regular', // font-inter
  },
  migrationProgressBulletComingSoon: {
    width: 12, // w-3
    height: 12, // h-3
    borderRadius: 6, // rounded-full
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // bg-white/40
    marginRight: 12, // mr-3
  },
  migrationProgressTextComingSoon: {
    color: 'rgba(255, 255, 255, 0.8)', // text-white/80
    fontFamily: 'Inter_400Regular', // font-inter
  },
  featuresContainer: {
    marginBottom: 32, // mb-8
  },
  featuresTitle: {
    fontSize: 20, // text-xl
    fontWeight: '600', // font-semibold
    color: 'white',
    fontFamily: 'Poppins_600SemiBold', // font-poppins
    marginBottom: 16, // mb-4
  },
  featuresGrid: {
    flexDirection: 'row', // grid
    flexWrap: 'wrap', // grid-cols-2
    gap: 16, // gap-4
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // bg-white/10
    borderRadius: 16, // rounded-shelivery-md
    padding: 16, // p-4
    flex: 1, // For grid-like behavior
    minWidth: '48%', // To ensure two columns with gap
    // backdrop-blur-sm is not directly supported in React Native
  },
  featureName: {
    fontWeight: '600', // font-semibold
    color: 'white',
    fontFamily: 'Poppins_600SemiBold', // font-poppins
    marginBottom: 4, // mb-1
  },
  featureDescription: {
    color: 'rgba(255, 255, 255, 0.7)', // text-white/70
    fontFamily: 'Inter_400Regular', // font-inter
    fontSize: 14, // text-sm
  },
  featureComingSoon: {
    color: 'rgba(255, 255, 255, 0.5)', // text-white/50
    fontFamily: 'Inter_400Regular', // font-inter
    fontSize: 12, // text-xs
    marginTop: 8, // mt-2
  },
  nextStepsCard: {
    backgroundColor: '#FFDB0D', // bg-shelivery-primary-yellow
    borderRadius: 20, // rounded-shelivery-lg
    padding: 24, // p-6
    marginBottom: 32, // mb-8
  },
  nextStepsTitle: {
    fontSize: 20, // text-xl
    fontWeight: '600', // font-semibold
    color: '#245B7B', // text-shelivery-primary-blue
    fontFamily: 'Poppins_600SemiBold', // font-poppins
    marginBottom: 12, // mb-3
  },
  nextStepsDescription: {
    color: 'rgba(36, 91, 123, 0.9)', // text-shelivery-primary-blue/90
    fontFamily: 'Inter_400Regular', // font-inter
    marginBottom: 16, // mb-4
  },
  nextStepsList: {
    rowGap: 8, // space-y-2
  },
  nextStepsItem: {
    color: '#245B7B', // text-shelivery-primary-blue
    fontFamily: 'Inter_400Regular', // font-inter
  },
  footerContainer: {
    paddingBottom: 32, // pb-8
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)', // text-white/60
    fontFamily: 'Inter_400Regular', // font-inter
    textAlign: 'center',
    fontSize: 14, // text-sm
  },
  footerSubtext: {
    color: 'rgba(255, 255, 255, 0.4)', // text-white/40
    fontFamily: 'Inter_400Regular', // font-inter
    textAlign: 'center',
    fontSize: 12, // text-xs
    marginTop: 4, // mt-1
  },
});
