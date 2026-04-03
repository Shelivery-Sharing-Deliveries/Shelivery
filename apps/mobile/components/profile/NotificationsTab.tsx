
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PushNotificationSettings } from '../../components/ui/PushNotificationSettings';

export const NotificationsTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <PushNotificationSettings />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
