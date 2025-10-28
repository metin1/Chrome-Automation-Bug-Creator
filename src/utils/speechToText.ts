/**
 * Speech-to-Text utility for capturing audio and converting to text
 * Uses Web Speech API for browser-based speech recognition
 */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventType {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export class SpeechToTextManager {
  private recognition: any = null;
  private isListening: boolean = false;
  private transcript: string = '';
  private interimTranscript: string = '';

  constructor() {
    // Initialize Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event);
    };
  }

  /**
   * Start listening for speech
   */
  start(onResult?: (transcript: string, isFinal: boolean) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech Recognition API not supported'));
        return;
      }

      this.transcript = '';
      this.interimTranscript = '';

      this.recognition.onresult = (event: SpeechRecognitionEventType) => {
        this.interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            this.transcript += transcript + ' ';
          } else {
            this.interimTranscript += transcript;
          }
        }

        const fullTranscript = this.transcript + this.interimTranscript;
        if (onResult) {
          onResult(fullTranscript, this.transcript.length > 0);
        }
      };

      try {
        this.recognition.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop listening and return final transcript
   */
  stop(): string {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    return this.transcript.trim();
  }

  /**
   * Abort recording
   */
  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Get current listening state
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Get current transcript
   */
  getTranscript(): string {
    return this.transcript;
  }

  /**
   * Clear transcript
   */
  clearTranscript(): void {
    this.transcript = '';
    this.interimTranscript = '';
  }

  /**
   * Append to existing transcript
   */
  appendTranscript(text: string): void {
    this.transcript += text + ' ';
  }
}

// Create singleton instance
export const speechToText = new SpeechToTextManager();

