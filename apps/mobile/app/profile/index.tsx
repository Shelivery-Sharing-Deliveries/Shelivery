import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            {user ? (
                <View style={styles.content}>
                    <Text>Email: {user.email}</Text>
                    <Text style={styles.spacer} />
                    <View style={styles.buttonContainer}>
                      <Text onPress={signOut} style={styles.signOutButton}>Sign Out</Text>
                    </View>
                </View>
            ) : (
                <Text>Not logged in</Text>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: colors.white },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    content: { gap: 10 },
    spacer: { height: 20 },
    buttonContainer: { marginTop: 20 },
    signOutButton: { color: 'red', fontSize: 16, textAlign: 'center' },
});
