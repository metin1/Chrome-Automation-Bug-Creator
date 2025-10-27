import type { NetworkRequest } from '../types';

// Store network requests per tab
const networkRequests = new Map<number, NetworkRequest[]>();
const requestTimings = new Map<string, number>();

// Monitor network requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0) return; // Skip requests not associated with a tab

    if (!networkRequests.has(tabId)) {
      networkRequests.set(tabId, []);
    }

    const requests = networkRequests.get(tabId)!;
    const requestId = `${details.requestId}`;
    
    // Store timing
    requestTimings.set(requestId, details.timeStamp);

    requests.push({
      id: requestId,
      url: details.url,
      method: details.method,
      status: 0,
      statusText: 'pending',
      type: details.type,
      timestamp: details.timeStamp,
      duration: 0,
      headers: {},
      responseHeaders: {},
    });

    // Keep only last 200 requests per tab
    if (requests.length > 200) {
      requests.shift();
    }
  },
  { urls: ['<all_urls>'] }
);

chrome.webRequest.onSendHeaders.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0) return;

    const requests = networkRequests.get(tabId);
    if (requests) {
      const request = requests.find(r => r.id === `${details.requestId}`);
      if (request && details.requestHeaders) {
        request.headers = details.requestHeaders.reduce((acc, h) => {
          acc[h.name] = h.value || '';
          return acc;
        }, {} as Record<string, string>);
      }
    }
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders']
);

chrome.webRequest.onCompleted.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0) return;

    const requests = networkRequests.get(tabId);
    if (requests) {
      const request = requests.find(r => r.id === `${details.requestId}`);
      if (request) {
        const startTime = requestTimings.get(request.id) || details.timeStamp;
        request.status = details.statusCode;
        request.statusText = details.statusLine || `${details.statusCode}`;
        request.duration = details.timeStamp - startTime;
        
        if (details.responseHeaders) {
          request.responseHeaders = details.responseHeaders.reduce((acc, h) => {
            acc[h.name] = h.value || '';
            return acc;
          }, {} as Record<string, string>);
        }

        // Clean up timing
        requestTimings.delete(request.id);
      }
    }
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

chrome.webRequest.onErrorOccurred.addListener(
  (details) => {
    const tabId = details.tabId;
    if (tabId < 0) return;

    const requests = networkRequests.get(tabId);
    if (requests) {
      const request = requests.find(r => r.id === `${details.requestId}`);
      if (request) {
        const startTime = requestTimings.get(request.id) || details.timeStamp;
        request.status = 0;
        request.statusText = details.error;
        request.duration = details.timeStamp - startTime;
        requestTimings.delete(request.id);
      }
    }
  },
  { urls: ['<all_urls>'] }
);

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getNetworkRequests') {
    const requests = networkRequests.get(request.tabId) || [];
    sendResponse({ requests });
  }
  return true;
});

// Clean up on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  networkRequests.delete(tabId);
});

// Clean up on tab navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    // Clear requests when page starts loading
    networkRequests.delete(tabId);
  }
});

console.log('[GitHub Issue Creator] Background script loaded');

