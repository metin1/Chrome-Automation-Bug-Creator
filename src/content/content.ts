import type { ConsoleLog, CapturedData } from '../types';

// Store captured data
const consoleLogs: ConsoleLog[] = [];
let consoleLogIdCounter = 0;

// Intercept console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;

function captureConsoleMessage(type: ConsoleLog['type'], args: any[]): void {
  const message = args.map(arg => {
    if (arg instanceof Error) {
      return `${arg.name}: ${arg.message}`;
    }
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');

  const logEntry: ConsoleLog = {
    id: `${type}-${Date.now()}-${consoleLogIdCounter++}`,
    type,
    message,
    stackTrace: type === 'error' ? new Error().stack : undefined,
    timestamp: Date.now(),
  };

  consoleLogs.push(logEntry);

  // Keep only last 100 entries
  if (consoleLogs.length > 100) {
    consoleLogs.shift();
  }
}

console.error = function(...args: any[]) {
  captureConsoleMessage('error', args);
  originalConsoleError.apply(console, args);
};

console.warn = function(...args: any[]) {
  captureConsoleMessage('warn', args);
  originalConsoleWarn.apply(console, args);
};

console.log = function(...args: any[]) {
  captureConsoleMessage('log', args);
  originalConsoleLog.apply(console, args);
};

console.info = function(...args: any[]) {
  captureConsoleMessage('info', args);
  originalConsoleInfo.apply(console, args);
};

// Capture unhandled errors
window.addEventListener('error', (event) => {
  consoleLogs.push({
    id: `error-${Date.now()}-${consoleLogIdCounter++}`,
    type: 'error',
    message: `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
    stackTrace: event.error?.stack,
    timestamp: Date.now(),
  });
});

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  consoleLogs.push({
    id: `error-${Date.now()}-${consoleLogIdCounter++}`,
    type: 'error',
    message: `Unhandled Promise Rejection: ${event.reason}`,
    stackTrace: event.reason?.stack,
    timestamp: Date.now(),
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getCapturedData') {
    const data: CapturedData = {
      url: window.location.href,
      timestamp: Date.now(),
      networkRequests: [], // Will be populated by background script
      consoleLogs: [...consoleLogs],
      browserInfo: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        os: navigator.platform,
        browserVersion: navigator.appVersion,
      },
    };
    
    console.log('[GitHub Issue Creator] Sending captured data with', data.consoleLogs.length, 'console logs');
    sendResponse(data);
  }
  return true;
});

// Notify that content script is ready
console.log('[GitHub Issue Creator] Content script loaded');

