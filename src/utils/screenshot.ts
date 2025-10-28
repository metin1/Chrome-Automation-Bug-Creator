import type { Screenshot } from '../types';

export class ScreenshotCapture {
  static async captureVisibleTab(): Promise<Screenshot> {
    return new Promise((resolve, reject) => {
      chrome.tabs.captureVisibleTab(
        chrome.windows.WINDOW_ID_CURRENT,
        { format: 'png' },
        (screenshotUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve({
            id: `screenshot-${Date.now()}`,
            data: screenshotUrl,
            timestamp: Date.now(),
            width: window.innerWidth || screen.width,
            height: window.innerHeight || screen.height,
          });
        }
      );
    });
  }

  static async captureElement(element: HTMLElement): Promise<Screenshot> {
    try {
      // Use html2canvas or canvas API to capture element
      const canvas = await this.elementToCanvas(element);
      const data = canvas.toDataURL('image/png');
      
      return {
        id: `screenshot-${Date.now()}`,
        data,
        timestamp: Date.now(),
        width: canvas.width,
        height: canvas.height,
      };
    } catch (error) {
      throw new Error(`Failed to capture element: ${error}`);
    }
  }

  private static async elementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Failed to get canvas context');

    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw element background
    ctx.fillStyle = window.getComputedStyle(element).backgroundColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Create image from element
    const clonedElement = element.cloneNode(true) as HTMLElement;
    const svg = new XMLSerializer().serializeToString(clonedElement);
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });
  }

  static async compressScreenshot(data: string, quality: number = 0.8): Promise<string> {
    const canvas = document.createElement('canvas');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = data;
    });
  }

  static calculateSize(dataUrl: string): number {
    // Remove data URI prefix to get actual base64 size
    const base64 = dataUrl.split(',')[1];
    return Math.round((base64.length * 3) / 4 / 1024); // Size in KB
  }
}
