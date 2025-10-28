import type { SessionRecording, Screenshot } from '../types';
import { ScreenshotCapture } from './screenshot';

export class SessionRecorder {
  private static readonly MAX_DURATION = 30000; // 30 seconds
  private static readonly FRAME_INTERVAL = 500; // 500ms between frames
  private static readonly AUTO_SAVE_INTERVAL = 5000; // Auto-save every 5 seconds
  private frames: Screenshot[] = [];
  private startTime: number = 0;
  private endTime: number = 0;
  private recordingInterval: ReturnType<typeof setInterval> | null = null;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private isRecording: boolean = false;

  start(): void {
    if (this.isRecording) return;
    
    this.frames = [];
    this.startTime = Date.now();
    this.isRecording = true;

    this.recordingInterval = setInterval(async () => {
      try {
        const screenshot = await ScreenshotCapture.captureVisibleTab();
        this.frames.push(screenshot);

        const elapsed = Date.now() - this.startTime;
        if (elapsed >= SessionRecorder.MAX_DURATION) {
          this.stop();
        }
      } catch (error) {
        console.error('Failed to capture frame:', error);
      }
    }, SessionRecorder.FRAME_INTERVAL);

    // Auto-save recording data to chrome.storage
    this.autoSaveInterval = setInterval(() => {
      this.autoSaveToStorage();
    }, SessionRecorder.AUTO_SAVE_INTERVAL);
  }

  private async autoSaveToStorage(): Promise<void> {
    if (!this.isRecording) return;

    try {
      const tempRecording = {
        frames: this.frames,
        startTime: this.startTime,
        duration: Date.now() - this.startTime,
      };
      await chrome.storage.session.set({
        'activeRecording': tempRecording,
      });
    } catch (error) {
      console.error('Failed to auto-save recording:', error);
    }
  }

  async restoreFromStorage(): Promise<void> {
    try {
      const data = await chrome.storage.session.get('activeRecording');
      if (data.activeRecording) {
        this.frames = data.activeRecording.frames || [];
        this.startTime = data.activeRecording.startTime || Date.now();
      }
    } catch (error) {
      console.error('Failed to restore recording:', error);
    }
  }

  stop(): SessionRecording {
    if (!this.isRecording) {
      throw new Error('Recording not in progress');
    }

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    this.endTime = Date.now();
    this.isRecording = false;

    // Clear storage after stopping
    chrome.storage.session.remove('activeRecording').catch(err =>
      console.error('Failed to clear recording from storage:', err)
    );

    const recording: SessionRecording = {
      id: `recording-${this.startTime}`,
      frames: this.frames,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.endTime - this.startTime,
    };

    return recording;
  }

  pause(): void {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
      this.isRecording = false;
    }
  }

  resume(): void {
    if (this.isRecording || this.frames.length === 0) return;
    this.isRecording = true;
    this.start();
  }

  getFrameCount(): number {
    return this.frames.length;
  }

  getDuration(): number {
    if (!this.isRecording) return this.endTime - this.startTime;
    return Date.now() - this.startTime;
  }

  isActive(): boolean {
    return this.isRecording;
  }

  export(): SessionRecording {
    return {
      id: `recording-${this.startTime}`,
      frames: [...this.frames],
      startTime: this.startTime,
      endTime: this.isRecording ? Date.now() : this.endTime,
      duration: (this.isRecording ? Date.now() : this.endTime) - this.startTime,
    };
  }

  clear(): void {
    this.frames = [];
    this.startTime = 0;
    this.endTime = 0;
    this.isRecording = false;
  }

  // Convert recording to video (requires ffmpeg or similar on backend)
  async exportAsGIF(): Promise<Blob> {
    // This would require a GIF encoding library
    throw new Error('GIF export requires additional dependencies');
  }

  // Export recording frames as a zip file
  async exportAsZip(): Promise<Blob> {
    // This would require a zip library
    throw new Error('ZIP export requires additional dependencies');
  }
}

export const sessionRecorder = new SessionRecorder();

