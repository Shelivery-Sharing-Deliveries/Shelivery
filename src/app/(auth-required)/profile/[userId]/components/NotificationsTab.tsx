import React from 'react';
import { PushNotificationSettings } from '@/components/ui/PushNotificationSettings';

export const NotificationsTab: React.FC = () => {
  return (
    <div className="w-full">
      <PushNotificationSettings />
    </div>
  );
};