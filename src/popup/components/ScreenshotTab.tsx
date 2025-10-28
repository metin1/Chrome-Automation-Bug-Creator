import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ScreenshotCapture } from '../../utils/screenshot';
import type { Screenshot } from '../../types';

export const ScreenshotTab: React.FC = () => {
  const { screenshots, addScreenshot, removeScreenshot, clearScreenshots } = useStore();
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCaptureScreenshot = async () => {
    try {
      setIsCapturing(true);
      setError(null);
      const screenshot = await ScreenshotCapture.captureVisibleTab();
      addScreenshot(screenshot);
    } catch (err) {
      setError(`Failed to capture screenshot: ${err}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadScreenshot = (screenshot: Screenshot) => {
    const link = document.createElement('a');
    link.href = screenshot.data;
    link.download = `screenshot-${screenshot.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCompressScreenshot = async (screenshot: Screenshot) => {
    try {
      setIsCapturing(true);
      const compressed = await ScreenshotCapture.compressScreenshot(screenshot.data, 0.7);
      const newScreenshot = { ...screenshot, data: compressed };
      // Remove old and add compressed
      removeScreenshot(screenshot.id);
      addScreenshot(newScreenshot);
    } catch (err) {
      setError(`Failed to compress screenshot: ${err}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const getScreenshotSize = (screenshot: Screenshot): string => {
    const sizeKb = ScreenshotCapture.calculateSize(screenshot.data);
    return `${sizeKb} KB`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📸 Screenshots</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {screenshots.length}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCaptureScreenshot}
              disabled={isCapturing}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm font-medium transition"
            >
              {isCapturing ? 'Capturing...' : '📷 Capture Now'}
            </button>
            <button
              onClick={clearScreenshots}
              disabled={screenshots.length === 0}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm font-medium transition"
            >
              Clear All
            </button>
          </div>

          {/* Screenshots List */}
          {screenshots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                No screenshots captured yet. Click "Capture Now" to take a screenshot.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {screenshots.map((screenshot, index) => (
                <div
                  key={screenshot.id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs font-mono text-gray-600">
                        #{index + 1}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(screenshot.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {getScreenshotSize(screenshot)}
                    </span>
                  </div>

                  {/* Preview */}
                  <div className="mb-3 relative bg-gray-100 rounded overflow-hidden max-h-40">
                    <img
                      src={screenshot.data}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-auto max-h-40 object-cover"
                    />
                  </div>

                  {/* Metadata */}
                  <p className="text-xs text-gray-500 mb-2">
                    {screenshot.width}x{screenshot.height}px
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadScreenshot(screenshot)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition"
                    >
                      ⬇️ Download
                    </button>
                    <button
                      onClick={() => handleCompressScreenshot(screenshot)}
                      disabled={isCapturing}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-2 py-1 rounded text-xs font-medium transition"
                    >
                      📦 Compress
                    </button>
                    <button
                      onClick={() => removeScreenshot(screenshot.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Screenshots are captured as visible in the current tab</li>
              <li>Use "Compress" to reduce file size (70% quality)</li>
              <li>Screenshots are included in issue reports</li>
              <li>Max size shown to prevent memory issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

