import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { generateInvite } from '../lib/invites';
import Header from '../components/ui/Header';
import InviteCard from '../components/invite-friend/InviteCard';

export default function InviteFriendPage() {
    const { user, loading: authLoading } = useAuth();
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace('/auth');
            return;
        }

        const fetchCode = async () => {
            const code = await generateInvite(user.id);
            setInviteCode(code);
            setLoading(false);
        };
        fetchCode();
    }, [user, authLoading]);

    const handleShare = async () => {
        if (!inviteCode) return;
        try {
            await Share.share({
                message: `Join me on Shelivery! Use my invite code: ${inviteCode}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    if (loading || authLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Header title="Invite Friend" />

            <View style={styles.content}>
                <InviteCard />

                <View style={styles.codeContainer}>
                    <Text style={styles.codeText}>{inviteCode}</Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleShare}>
                    <Text style={styles.buttonText}>Invite your friend</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 24, gap: 24, alignItems: 'center' },
    codeContainer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E8EB', borderRadius: 18, padding: 16, width: '100%', alignItems: 'center' },
    codeText: { fontSize: 14, color: '#111827' },
    button: { backgroundColor: '#FFDB0D', padding: 16, borderRadius: 16, width: '100%', alignItems: 'center', height: 56, justifyContent: 'center' },
    buttonText: { color: '#000000', fontWeight: '600', fontSize: 18 },
});
