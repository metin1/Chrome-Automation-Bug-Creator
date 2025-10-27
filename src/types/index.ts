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

