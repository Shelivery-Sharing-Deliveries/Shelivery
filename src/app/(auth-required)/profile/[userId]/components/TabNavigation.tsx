import React from 'react';

type TabType = 'general' | 'preferences' | 'notifications';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => onTabChange('general')}
        className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
          activeTab === 'general'
            ? 'text-[#FFDB0D] border-b-2 border-[#FFDB0D]'
            : 'text-gray-500'
        }`}
      >
        General
      </button>
      <button
        onClick={() => onTabChange('preferences')}
        className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
          activeTab === 'preferences'
            ? 'text-[#FFDB0D] border-b-2 border-[#FFDB0D]'
            : 'text-gray-500'
        }`}
      >
        Preferences
      </button>
      <button
        onClick={() => onTabChange('notifications')}
        className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
          activeTab === 'notifications'
            ? 'text-[#FFDB0D] border-b-2 border-[#FFDB0D]'
            : 'text-gray-500'
        }`}
      >
        Notifications
      </button>
    </div>
  );
};