import React from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsTab } from '../popup/components/SettingsTab';
import '../popup/styles.css';

const Options: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              GitHub Issue Creator - Settings
            </h1>
          </div>
          <SettingsTab />
        </div>
      </div>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <Options />
    </React.StrictMode>
  );
}

