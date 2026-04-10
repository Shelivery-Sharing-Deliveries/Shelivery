import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { generateInvite } from '../lib/invites';
import InviteCard from '../components/invite-friend/InviteCard';
import PageLayout from '../components/ui/PageLayout';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';

export default function InviteFriendPage() {
    const { user, loading: authLoading } = useAuth();
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { colors, isDark } = useTheme();

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

    const header = (
        <View style={styles.headerRow}>
            <TouchableOpacity
                style={[
                    styles.backButton,
                    { backgroundColor: isDark ? colors['shelivery-card-border'] : '#F3F4F6' },
                ]}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={22} color={colors['shelivery-text-primary']} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors['shelivery-text-primary'] }]}>
                Invite Friend
            </Text>
        </View>
    );

    if (loading || authLoading) {
        return (
            <PageLayout header={header}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors['shelivery-primary-yellow']} />
                </View>
            </PageLayout>
        );
    }

    return (
        <PageLayout header={header}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <InviteCard />

                <View
                    style={[
                        styles.codeContainer,
                        {
                            backgroundColor: isDark ? colors['shelivery-card-background'] : '#F9FAFB',
                            borderColor: colors['shelivery-card-border'],
                        },
                    ]}
                >
                    <Text style={[styles.codeText, { color: colors['shelivery-text-primary'] }]}>
                        {inviteCode}
                    </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleShare}>
                    <Text style={styles.buttonText}>Invite your friend</Text>
                </TouchableOpacity>
            </ScrollView>
        </PageLayout>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        gap: 24,
        alignItems: 'center',
        paddingBottom: 120,
    },
    codeContainer: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        width: '100%',
        alignItems: 'center',
    },
    codeText: {
        fontSize: 14,
        letterSpacing: 2,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#FFDB0D',
        padding: 16,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        height: 56,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#000000',
        fontWeight: '600',
        fontSize: 18,
    },
});
