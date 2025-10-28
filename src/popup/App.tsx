import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { MainTab } from './components/MainTab';
import { NetworkTab } from './components/NetworkTab';
import { ConsoleTab } from './components/ConsoleTab';
import { SettingsTab } from './components/SettingsTab';
import { ScreenshotTab } from './components/ScreenshotTab';
import { RecordingTab } from './components/RecordingTab';
import { DuplicateDetectionTab } from './components/DuplicateDetectionTab';
import { TemplatesTab } from './components/TemplatesTab';
import { DataExportTab } from './components/DataExportTab';
import { TeamMentionsTab } from './components/TeamMentionsTab';
import { AdvancedDataTab } from './components/AdvancedDataTab';
import { storage } from '../utils/storage';
import './styles.css';

type Tab = 'main' | 'network' | 'console' | 'settings' | 'screenshots' | 'recording' | 'duplicates' | 'templates' | 'export' | 'team' | 'data';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('main');
  const { setCapturedData, setSettings, settings, error, setError } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings
    storage.getSettings().then(setSettings);

    // Capture data from current tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]?.id) {
        setIsLoading(false);
        return;
      }

      const tabId = tabs[0].id;

      try {
        // Get network requests from background script
        chrome.runtime.sendMessage(
          { action: 'getNetworkRequests', tabId },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Background script error:', chrome.runtime.lastError.message);
              setError(`Failed to get network requests: ${chrome.runtime.lastError.message}`);
              setIsLoading(false);
              return;
            }
            
            const networkRequests = response?.requests || [];
            console.log('[App] Got network requests:', networkRequests.length);

            // Get console logs and page data from content script
            chrome.tabs.sendMessage(
              tabId,
              { action: 'getCapturedData' },
              (contentData) => {
                if (chrome.runtime.lastError) {
                  console.error('Content script error:', chrome.runtime.lastError.message);
                  setError('Content script not loaded. Please refresh the page.');
                  setIsLoading(false);
                  return;
                }

                if (contentData) {
                  console.log('[App] Got content data with', contentData.consoleLogs?.length || 0, 'console logs');
                  setCapturedData({
                    ...contentData,
                    networkRequests,
                  });
                }
                setIsLoading(false);
              }
            );
          }
        );
      } catch (err) {
        console.error('Error capturing data:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to capture page data: ${errorMessage}`);
        setIsLoading(false);
      }
    });
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'main', label: 'Create Issue', icon: '📝' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'console', label: 'Console', icon: '🔍' },
    { id: 'screenshots', label: 'Screenshots', icon: '📸' },
    { id: 'recording', label: 'Recording', icon: '🎬' },
    { id: 'duplicates', label: 'Duplicates', icon: '🔄' },
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'export', label: 'Export', icon: '📊' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'data', label: 'Data', icon: '💾' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className={`w-[400px] h-[600px] ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            GitHub Issue Creator
          </h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-start">
              <span className="text-red-600 dark:text-red-400 text-sm flex-1">
                {error}
              </span>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation - Horizontally Scrollable */}
        <div className="overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-hide">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'main' && <MainTab />}
              {activeTab === 'network' && <NetworkTab />}
              {activeTab === 'console' && <ConsoleTab />}
              {activeTab === 'screenshots' && <ScreenshotTab />}
              {activeTab === 'recording' && <RecordingTab />}
              {activeTab === 'duplicates' && <DuplicateDetectionTab />}
              {activeTab === 'templates' && <TemplatesTab />}
              {activeTab === 'export' && <DataExportTab />}
              {activeTab === 'team' && <TeamMentionsTab />}
              {activeTab === 'data' && <AdvancedDataTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

