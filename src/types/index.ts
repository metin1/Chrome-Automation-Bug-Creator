// Core data types
export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  statusText: string;
  type: string;
  timestamp: number;
  duration: number;
  headers: Record<string, string>;
  responseHeaders: Record<string, string>;
}

export interface ConsoleLog {
  id: string;
  type: 'error' | 'warn' | 'info' | 'log';
  message: string;
  stackTrace?: string;
  timestamp: number;
}

export interface BrowserInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  os: string;
  browserVersion: string;
}

export interface CapturedData {
  url: string;
  timestamp: number;
  networkRequests: NetworkRequest[];
  consoleLogs: ConsoleLog[];
  browserInfo: BrowserInfo;
}

// GitHub types
export interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  assignees?: string[];
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  private: boolean;
  html_url: string;
  description: string;
  updated_at: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string;
}

// App settings
export interface AppSettings {
  githubToken?: string;
  openaiKey?: string;
  selectedRepo?: string;
  theme: 'light' | 'dark';
  captureWarnings: boolean;
  autoGenerateTitle: boolean;
}

// Chrome message types
export interface ChromeMessage {
  action: string;
  [key: string]: any;
}

// Phase 2 Features
export interface Screenshot {
  id: string;
  data: string; // base64
  timestamp: number;
  width: number;
  height: number;
}

export interface SessionRecording {
  id: string;
  frames: Screenshot[];
  startTime: number;
  endTime: number;
  duration: number;
}

export interface StorageCapture {
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  timestamp: number;
}

export interface WebSocketMessage {
  id: string;
  url: string;
  type: 'sent' | 'received';
  data: string;
  timestamp: number;
  size: number;
}

export interface StateCapture {
  type: 'redux' | 'vuex' | 'pinia' | 'zustand' | 'jotai';
  state: Record<string, any>;
  timestamp: number;
}

export interface IssueTemplate {
  id: string;
  name: string;
  description: string;
  body: string;
  labels: string[];
  assignees?: string[];
}

export interface DuplicateIssueMatch {
  id: number;
  title: string;
  body: string;
  similarity: number; // 0-1
  url: string;
  state: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: number;
  login: string;
  avatar_url: string;
  name?: string;
  email?: string;
}

export interface ProjectColumn {
  id: number;
  name: string;
  project_id: number;
}

export interface ExportData {
  format: 'json' | 'har';
  timestamp: number;
  data: string;
}

export interface Phase2CapturedData extends CapturedData {
  screenshots?: Screenshot[];
  sessionRecording?: SessionRecording;
  storage?: StorageCapture;
  webSocketMessages?: WebSocketMessage[];
  stateCapture?: StateCapture;
}

