import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { storage } from '../../utils/storage';
import { GitHubAPI } from '../../utils/github';

export const SettingsTab: React.FC = () => {
  const { settings, setSettings, setError } = useStore();
  const [githubToken, setGithubToken] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [isValidatingGithub, setIsValidatingGithub] = useState(false);
  const [githubValidated, setGithubValidated] = useState<boolean | null>(null);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const token = await storage.getGitHubToken();
    const key = await storage.getOpenAIKey();
    
    if (token) {
      setGithubToken(token);
      setGithubValidated(true);
    }
    if (key) {
      setOpenaiKey(key);
    }
  };

  const validateGitHubToken = async () => {
    if (!githubToken.trim()) {
      setError('Please enter a GitHub token');
      return;
    }

    setIsValidatingGithub(true);
    setGithubValidated(null);

    try {
      const api = new GitHubAPI(githubToken);
      const isValid = await api.validateToken();
      
      if (isValid) {
        setGithubValidated(true);
        setError(null);
      } else {
        setGithubValidated(false);
        setError('Invalid GitHub token');
      }
    } catch (err) {
      setGithubValidated(false);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to validate GitHub token: ${errorMessage}`);
    } finally {
      setIsValidatingGithub(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      await storage.saveSettings(settings);
      
      if (githubToken.trim()) {
        await storage.saveGitHubToken(githubToken.trim());
      }
      
      if (openaiKey.trim()) {
        await storage.saveOpenAIKey(openaiKey.trim());
      }

      alert('Settings saved successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to save settings: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* GitHub Token */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          GitHub Personal Access Token *
        </label>
        <div className="relative">
          <input
            type={showGithubToken ? 'text' : 'password'}
            value={githubToken}
            onChange={(e) => {
              setGithubToken(e.target.value);
              setGithubValidated(null);
            }}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowGithubToken(!showGithubToken)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showGithubToken ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={validateGitHubToken}
            disabled={isValidatingGithub || !githubToken.trim()}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidatingGithub ? 'Validating...' : 'Validate Token'}
          </button>
          
          {githubValidated === true && (
            <span className="text-xs text-green-600 dark:text-green-400">✓ Valid token</span>
          )}
          {githubValidated === false && (
            <span className="text-xs text-red-600 dark:text-red-400">✗ Invalid token</span>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Create a token at{' '}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            GitHub Settings
          </a>
          {' '}with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">repo</code> scope
        </p>
      </div>

      {/* OpenAI API Key */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          OpenAI API Key (Optional)
        </label>
        <div className="relative">
          <input
            type={showOpenaiKey ? 'text' : 'password'}
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowOpenaiKey(!showOpenaiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showOpenaiKey ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Required for AI-powered title generation. Get your key at{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            OpenAI Platform
          </a>
        </p>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          Theme
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setSettings({ ...settings, theme: 'light' })}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              settings.theme === 'light'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            ☀️ Light
          </button>
          <button
            onClick={() => setSettings({ ...settings, theme: 'dark' })}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              settings.theme === 'dark'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            🌙 Dark
          </button>
        </div>
      </div>

      {/* Capture Settings */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          Capture Options
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.captureWarnings}
              onChange={(e) =>
                setSettings({ ...settings, captureWarnings: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Capture console warnings
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoGenerateTitle}
              onChange={(e) =>
                setSettings({ ...settings, autoGenerateTitle: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Enable AI title generation
            </span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={isSaving || !githubToken.trim()}
        className="w-full py-2.5 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? '💾 Saving...' : '💾 Save Settings'}
      </button>

      {/* Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          GitHub Issue Creator v1.0.0
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
          All settings are stored locally
        </p>
      </div>
    </div>
  );
};

