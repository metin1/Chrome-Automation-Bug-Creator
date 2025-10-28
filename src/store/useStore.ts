import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, CapturedData, Screenshot, SessionRecording, StateCapture, StorageCapture, WebSocketMessage, IssueTemplate, DuplicateIssueMatch } from '../types';

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

  // Phase 2 & 3 Features
  screenshots: Screenshot[];
  sessionRecording: SessionRecording | null;
  isRecording: boolean;
  capturedStates: StateCapture[];
  capturedStorage: StorageCapture | null;
  webSocketMessages: WebSocketMessage[];
  issueTemplates: IssueTemplate[];
  duplicateMatches: DuplicateIssueMatch[];
  selectedAssignees: string[];
  selectedTeamMembers: string[];
  
  // Speech-to-Text (New Feature)
  speechTranscript: string;
  isSpeechListening: boolean;
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

  // Phase 2 & 3 Actions
  addScreenshot: (screenshot: Screenshot) => void;
  removeScreenshot: (id: string) => void;
  clearScreenshots: () => void;
  setSessionRecording: (recording: SessionRecording | null) => void;
  setIsRecording: (recording: boolean) => void;
  setCapturedStates: (states: StateCapture[]) => void;
  setCapturedStorage: (storage: StorageCapture | null) => void;
  addWebSocketMessage: (message: WebSocketMessage) => void;
  clearWebSocketMessages: () => void;
  setIssueTemplates: (templates: IssueTemplate[]) => void;
  setDuplicateMatches: (matches: DuplicateIssueMatch[]) => void;
  setSelectedAssignees: (assignees: string[]) => void;
  setSelectedTeamMembers: (members: string[]) => void;

  // Speech-to-Text Actions (New Feature)
  setSpeechTranscript: (transcript: string) => void;
  setIsSpeechListening: (listening: boolean) => void;
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

      // Phase 2 & 3 state
      screenshots: [],
      sessionRecording: null,
      isRecording: false,
      capturedStates: [],
      capturedStorage: null,
      webSocketMessages: [],
      issueTemplates: [],
      duplicateMatches: [],
      selectedAssignees: [],
      selectedTeamMembers: [],

      // Speech-to-Text state
      speechTranscript: '',
      isSpeechListening: false,

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

      // Phase 2 & 3 Actions
      addScreenshot: (screenshot) =>
        set((state) => ({
          screenshots: [...state.screenshots, screenshot],
        })),

      removeScreenshot: (id) =>
        set((state) => ({
          screenshots: state.screenshots.filter(s => s.id !== id),
        })),

      clearScreenshots: () =>
        set({ screenshots: [] }),

      setSessionRecording: (recording) =>
        set({ sessionRecording: recording }),

      setIsRecording: (recording) =>
        set({ isRecording: recording }),

      setCapturedStates: (states) =>
        set({ capturedStates: states }),

      setCapturedStorage: (storage) =>
        set({ capturedStorage: storage }),

      addWebSocketMessage: (message) =>
        set((state) => {
          const messages = [...state.webSocketMessages, message];
          // Keep only last 100 messages
          return { webSocketMessages: messages.slice(-100) };
        }),

      clearWebSocketMessages: () =>
        set({ webSocketMessages: [] }),

      setIssueTemplates: (templates) =>
        set({ issueTemplates: templates }),

      setDuplicateMatches: (matches) =>
        set({ duplicateMatches: matches }),

      setSelectedAssignees: (assignees) =>
        set({ selectedAssignees: assignees }),

      setSelectedTeamMembers: (members) =>
        set({ selectedTeamMembers: members }),

      // Speech-to-Text Actions (New Feature)
      setSpeechTranscript: (transcript: string) =>
        set({ speechTranscript: transcript }),

      setIsSpeechListening: (listening: boolean) =>
        set({ isSpeechListening: listening }),
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
        issueTemplates: state.issueTemplates,
        selectedAssignees: state.selectedAssignees,
        selectedConsoleLogs: state.selectedConsoleLogs,
        selectedNetworkRequests: state.selectedNetworkRequests,
      }),
    }
  )
);

