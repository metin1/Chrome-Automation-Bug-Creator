import type { AppSettings } from '../types';

export const storage = {
  async getSettings(): Promise<AppSettings> {
    const result = await chrome.storage.sync.get(['settings']);
    return result.settings || {
      theme: 'light',
      captureWarnings: false,
      autoGenerateTitle: true,
    };
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await chrome.storage.sync.set({ settings });
  },

  async getGitHubToken(): Promise<string | undefined> {
    const result = await chrome.storage.local.get(['githubToken']);
    return result.githubToken;
  },

  async saveGitHubToken(token: string): Promise<void> {
    await chrome.storage.local.set({ githubToken: token });
  },

  async getOpenAIKey(): Promise<string | undefined> {
    const result = await chrome.storage.local.get(['openaiKey']);
    return result.openaiKey;
  },

  async saveOpenAIKey(key: string): Promise<void> {
    await chrome.storage.local.set({ openaiKey: key });
  },

  async getSelectedRepo(): Promise<string | undefined> {
    const result = await chrome.storage.local.get(['selectedRepo']);
    return result.selectedRepo;
  },

  async saveSelectedRepo(repo: string): Promise<void> {
    await chrome.storage.local.set({ selectedRepo: repo });
  },
};

