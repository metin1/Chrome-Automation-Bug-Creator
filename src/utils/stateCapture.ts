import type { StateCapture, StorageCapture, WebSocketMessage } from '../types';

export class StateCaptureManager {
  /**
   * Capture Redux state
   */
  static captureReduxState(): StateCapture | null {
    try {
      const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
      if (!reduxDevTools) return null;

      const state = (window as any).__REDUX_DEVTOOLS_EXTENSION__.getState?.();
      
      if (!state) {
        // Try to access store directly
        const store = (window as any).__REDUX_STORE__;
        if (!store?.getState) return null;
        
        return {
          type: 'redux',
          state: store.getState(),
          timestamp: Date.now(),
        };
      }

      return {
        type: 'redux',
        state,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error capturing Redux state:', error);
      return null;
    }
  }

  /**
   * Capture Vuex state
   */
  static captureVuexState(): StateCapture | null {
    try {
      const vueApp = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;
      if (!vueApp) return null;

      const store = (window as any).__VUEX_STORE__;
      if (!store?.state) return null;

      return {
        type: 'vuex',
        state: store.state,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error capturing Vuex state:', error);
      return null;
    }
  }

  /**
   * Capture Pinia state (Vue 3)
   */
  static capturePiniaState(): StateCapture | null {
    try {
      const pinia = (window as any).__PINIA__;
      if (!pinia) return null;

      const state: Record<string, any> = {};
      
      // Collect all store states
      pinia.state.value.forEach((storeState: any, storeName: string) => {
        state[storeName] = storeState;
      });

      return {
        type: 'pinia',
        state,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error capturing Pinia state:', error);
      return null;
    }
  }

  /**
   * Capture Zustand state
   */
  static captureZustandState(): StateCapture | null {
    try {
      const zustandStores = (window as any).__ZUSTAND_STORE__;
      if (!zustandStores) return null;

      return {
        type: 'zustand',
        state: zustandStores,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error capturing Zustand state:', error);
      return null;
    }
  }

  /**
   * Capture Jotai state (atoms)
   */
  static captureJotaiState(): StateCapture | null {
    try {
      const jotai = (window as any).__JOTAI_DEVTOOLS__;
      if (!jotai) return null;

      const state: Record<string, any> = {};
      
      // Collect all atom states
      jotai.atoms?.forEach((atom: any) => {
        state[atom.key] = atom.value;
      });

      return {
        type: 'jotai',
        state,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error capturing Jotai state:', error);
      return null;
    }
  }

  /**
   * Capture all available state management states
   */
  static captureAllStates(): StateCapture[] {
    const states: StateCapture[] = [];

    const redux = this.captureReduxState();
    if (redux) states.push(redux);

    const vuex = this.captureVuexState();
    if (vuex) states.push(vuex);

    const pinia = this.capturePiniaState();
    if (pinia) states.push(pinia);

    const zustand = this.captureZustandState();
    if (zustand) states.push(zustand);

    const jotai = this.captureJotaiState();
    if (jotai) states.push(jotai);

    return states;
  }

  /**
   * Format state for issue body
   */
  static formatStateForIssue(states: StateCapture[]): string {
    if (states.length === 0) return '';

    let markdown = '## Application State\n\n';

    for (const state of states) {
      markdown += `### ${state.type.toUpperCase()} State\n\`\`\`json\n`;
      markdown += JSON.stringify(state.state, null, 2);
      markdown += '\n\`\`\`\n\n';
    }

    return markdown;
  }
}

export class StorageCaptureManager {
  /**
   * Capture localStorage
   */
  static captureLocalStorage(): Record<string, string> {
    const storage: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        storage[key] = localStorage.getItem(key) || '';
      }
    }
    return storage;
  }

  /**
   * Capture sessionStorage
   */
  static captureSessionStorage(): Record<string, string> {
    const storage: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        storage[key] = sessionStorage.getItem(key) || '';
      }
    }
    return storage;
  }

  /**
   * Capture both localStorage and sessionStorage
   */
  static captureAllStorage(): StorageCapture {
    return {
      localStorage: this.captureLocalStorage(),
      sessionStorage: this.captureSessionStorage(),
      timestamp: Date.now(),
    };
  }

  /**
   * Format storage for issue body
   */
  static formatStorageForIssue(storage: StorageCapture): string {
    let markdown = '## Storage Data\n\n';

    if (Object.keys(storage.localStorage).length > 0) {
      markdown += '### LocalStorage\n\`\`\`json\n';
      markdown += JSON.stringify(storage.localStorage, null, 2);
      markdown += '\n\`\`\`\n\n';
    }

    if (Object.keys(storage.sessionStorage).length > 0) {
      markdown += '### SessionStorage\n\`\`\`json\n';
      markdown += JSON.stringify(storage.sessionStorage, null, 2);
      markdown += '\n\`\`\`\n\n';
    }

    return markdown;
  }
}

export class WebSocketCaptureManager {
  private static messages: WebSocketMessage[] = [];
  private static wsProxyInstalled: boolean = false;

  /**
   * Install WebSocket proxy to capture messages
   */
  static installWebSocketProxy(): void {
    if (this.wsProxyInstalled) return;

    const originalWebSocket = window.WebSocket;

    (window as any).WebSocket = class extends originalWebSocket {
      constructor(url: string) {
        super(url);

        this.addEventListener('message', (event: any) => {
          WebSocketCaptureManager.addMessage({
            id: `ws-${Date.now()}-${Math.random()}`,
            url,
            type: 'received',
            data: typeof event.data === 'string' ? event.data : JSON.stringify(event.data),
            timestamp: Date.now(),
            size: new Blob([typeof event.data === 'string' ? event.data : JSON.stringify(event.data)]).size,
          });
        });

        // Wrap send method
        const originalSend = this.send;
        this.send = function(data: string | ArrayBufferLike | Blob) {
          const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
          WebSocketCaptureManager.addMessage({
            id: `ws-${Date.now()}-${Math.random()}`,
            url,
            type: 'sent',
            data: dataStr,
            timestamp: Date.now(),
            size: new Blob([dataStr]).size,
          });
          originalSend.call(this, data);
        };
      }
    };

    this.wsProxyInstalled = true;
  }

  private static addMessage(message: WebSocketMessage): void {
    this.messages.push(message);
    // Keep only last 100 messages
    if (this.messages.length > 100) {
      this.messages.shift();
    }
  }

  static getMessages(): WebSocketMessage[] {
    return [...this.messages];
  }

  static clearMessages(): void {
    this.messages = [];
  }

  static formatMessagesForIssue(messages: WebSocketMessage[]): string {
    if (messages.length === 0) return '';

    let markdown = '## WebSocket Messages\n\n';
    markdown += `Captured ${messages.length} messages\n\n`;

    const sent = messages.filter(m => m.type === 'sent');
    const received = messages.filter(m => m.type === 'received');

    if (sent.length > 0) {
      markdown += `### Sent Messages (${sent.length})\n\`\`\`\n`;
      sent.forEach(m => {
        markdown += `[${new Date(m.timestamp).toISOString()}] ${m.url}\n${m.data}\n\n`;
      });
      markdown += '```\n\n';
    }

    if (received.length > 0) {
      markdown += `### Received Messages (${received.length})\n\`\`\`\n`;
      received.forEach(m => {
        markdown += `[${new Date(m.timestamp).toISOString()}] ${m.url}\n${m.data}\n\n`;
      });
      markdown += '```\n\n';
    }

    return markdown;
  }
}

