import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, CapturedData } from '../types';

interface AppState {
  settings: AppSettings;
  capturedData: CapturedData | null;
  selectedNetworkRequests: string[];
  selectedConsoleLogs: string[];
  isLoading: boolean;
  error: string | null;
  
  // Form data that persists
  issueTitle: string;
  issueBody: string;
  issueLabels: string[];
  selectedRepo: string;
  additionalLogs: string;
  
  // Actions
  setSettings: (settings: Partial<AppSettings>) => void;
  setCapturedData: (data: CapturedData) => void;
  toggleNetworkRequest: (id: string) => void;
  toggleConsoleLog: (id: string) => void;
  selectAllErrors: () => void;
  clearSelections: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIssueTitle: (title: string) => void;
  setIssueBody: (body: string) => void;
  setIssueLabels: (labels: string[] | ((prev: string[]) => string[])) => void;
  setSelectedRepo: (repo: string) => void;
  setAdditionalLogs: (logs: string) => void;
  clearIssueData: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        theme: 'light',
        captureWarnings: false,
        autoGenerateTitle: true,
      },
      capturedData: null,
      selectedNetworkRequests: [],
      selectedConsoleLogs: [],
      isLoading: false,
      error: null,
      issueTitle: '',
      issueBody: '',
      issueLabels: [],
      selectedRepo: '',
      additionalLogs: '',

      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setCapturedData: (data) => set({ capturedData: data }),

      toggleNetworkRequest: (id) =>
        set((state) => ({
          selectedNetworkRequests: state.selectedNetworkRequests.includes(id)
            ? state.selectedNetworkRequests.filter((rid) => rid !== id)
            : [...state.selectedNetworkRequests, id],
        })),

      toggleConsoleLog: (id) =>
        set((state) => ({
          selectedConsoleLogs: state.selectedConsoleLogs.includes(id)
            ? state.selectedConsoleLogs.filter((lid) => lid !== id)
            : [...state.selectedConsoleLogs, id],
        })),

      selectAllErrors: () =>
        set((state) => ({
          selectedConsoleLogs: state.capturedData?.consoleLogs
            .filter((log) => log.type === 'error')
            .map((log) => log.id) || [],
        })),

      clearSelections: () =>
        set({
          selectedNetworkRequests: [],
          selectedConsoleLogs: [],
        }),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setIssueTitle: (title) => set({ issueTitle: title }),
      setIssueBody: (body) => set({ issueBody: body }),
      setIssueLabels: (labels) =>
        set((state) => ({
          issueLabels: typeof labels === 'function' ? labels(state.issueLabels) : labels
        })),
      setSelectedRepo: (repo) => set({ selectedRepo: repo }),
      setAdditionalLogs: (logs) => set({ additionalLogs: logs }),
      clearIssueData: () =>
        set({
          issueTitle: '',
          issueBody: '',
          issueLabels: [],
          additionalLogs: '',
        }),
    }),
    {
      name: 'github-issue-creator-store',
      partialize: (state) => ({
        issueTitle: state.issueTitle,
        issueBody: state.issueBody,
        issueLabels: state.issueLabels,
        selectedRepo: state.selectedRepo,
        additionalLogs: state.additionalLogs,
        settings: state.settings,
      }),
    }
  )
);

