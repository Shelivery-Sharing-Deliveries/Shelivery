import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function InviteCard() {
    return (
        <View style={styles.container}>
            <View style={styles.illustrationContainer}>
                <View style={styles.illustrationBackground} />
                <Image 
                    source={require('../../public/icons/invite-illustration.png')} 
                    style={styles.illustration}
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.title}>Group up, Save more !</Text>
                <Text style={styles.description}>Add Your Friend, share the order and unlock free delivery together</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 24, alignItems: 'center' },
    illustrationContainer: { width: 205, height: 205, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    illustrationBackground: { position: 'absolute', inset: 0, backgroundColor: '#FFFADF', borderRadius: 102.5 },
    illustration: { width: 205, height: 205, borderRadius: 102.5 },
    textContainer: { gap: 16, width: '100%' },
    title: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    description: { fontSize: 14, textAlign: 'left' },
});
