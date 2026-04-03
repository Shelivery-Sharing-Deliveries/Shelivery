import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button, Avatar } from "@/components/ui";
import PageLayout from "@/components/ui/PageLayout";
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
    <PageLayout>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading1}>Shelivery Alpha</Text>
          <Text style={[styles.body, { marginTop: spacing['shelivery-2'] }]}>
            Welcome to the mobile app alpha version
          </Text>
          <Text style={styles.bodySmall}>
            This is a placeholder for future features. Auth will be added later.
          </Text>
        </View>

        {/* Test Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Migrated Components Test</Text>

          <View style={styles.componentGroup}>
            <Text style={styles.componentLabel}>Avatar Component:</Text>
            <View style={styles.avatarRow}>
              <Avatar size="sm" name="John Doe" />
              <Avatar size="md" name="Jane Smith" />
              <Avatar size="lg" name="Alex Johnson" />
              <Avatar size="xl" name="Sam Wilson" />
            </View>
          </View>

          <View style={styles.componentGroup}>
            <Text style={styles.componentLabel}>Button Components:</Text>
            <View style={styles.buttonColumn}>
              <Button variant="primary" size="md">Primary Button</Button>
              <Button variant="secondary" size="md">Secondary Button</Button>
              <Button variant="error" size="md">Error Button</Button>
              <Button variant="success" size="md">Success Button</Button>
              <Button variant="primary" size="sm">Small Button</Button>
              <Button variant="primary" size="lg">Large Button</Button>
              <Button variant="primary" loading>Loading Button</Button>
              <Button variant="primary" disabled>Disabled Button</Button>
            </View>
          </View>
        </View>

        {/* Migration Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Migration Progress</Text>
          {[
            { label: "Navigation Bar ✓", done: true },
            { label: "Tab Structure ✓", done: true },
            { label: "Design Tokens ✓", done: true },
            { label: "UI Components (Button, Avatar) ✓", done: true },
            { label: "Authentication (Coming Soon)", done: false },
            { label: "Real-time Chat", done: false },
            { label: "Payment Integration", done: false },
          ].map((item) => (
            <View key={item.label} style={styles.progressItem}>
              <View style={[styles.bullet, item.done ? styles.bulletDone : styles.bulletSoon]} />
              <Text style={[styles.progressText, !item.done && styles.progressTextSoon]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Available Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
                onPress={() => feature.route && router.push(feature.route as any)}
                disabled={!feature.route}
                activeOpacity={0.7}
              >
                <Text style={styles.featureName}>{feature.name}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                {!feature.route && <Text style={styles.featureComingSoon}>Coming soon</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>Next Steps</Text>
          <Text style={styles.nextStepsDescription}>
            The following components will be migrated from the web app:
          </Text>
          {["Authentication flows", "Pool creation wizard", "Real-time chat components", "Basket management", "Order tracking"].map((item) => (
            <Text key={item} style={styles.nextStepsItem}>• {item}</Text>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Shelivery Mobile Alpha v0.1.0</Text>
          <Text style={styles.footerSubtext}>UI migrated from web app without NativeWind</Text>
        </View>
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
    gap: 24,
  },
  headerContainer: {
    gap: 4,
  },
  heading1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
  },
  body: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Inter_400Regular',
  },
  bodySmall: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
  },
  section: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E5E8EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  componentGroup: {
    gap: 10,
  },
  componentLabel: {
    fontSize: 15,
    color: '#374151',
    fontFamily: 'Inter_500Medium',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  buttonColumn: {
    gap: 10,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bulletDone: {
    backgroundColor: colors['shelivery-primary-blue'],
  },
  bulletSoon: {
    backgroundColor: '#D1D5DB',
  },
  progressText: {
    color: '#374151',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  progressTextSoon: {
    color: '#9CA3AF',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flex: 1,
    minWidth: '47%',
    borderWidth: 1,
    borderColor: '#E5E8EB',
    gap: 4,
  },
  featureName: {
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  featureDescription: {
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  featureComingSoon: {
    color: '#9CA3AF',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 4,
  },
  nextStepsCard: {
    backgroundColor: colors['shelivery-primary-yellow'],
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors['shelivery-primary-blue'],
    fontFamily: 'Poppins_600SemiBold',
  },
  nextStepsDescription: {
    color: colors['shelivery-primary-blue'],
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    opacity: 0.85,
  },
  nextStepsItem: {
    color: colors['shelivery-primary-blue'],
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 8,
    gap: 4,
  },
  footerText: {
    color: '#9CA3AF',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
  footerSubtext: {
    color: '#D1D5DB',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    fontSize: 11,
  },
});
