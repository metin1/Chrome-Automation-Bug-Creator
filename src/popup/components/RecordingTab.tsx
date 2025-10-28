import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { sessionRecorder } from '../../utils/sessionRecording';

export const RecordingTab: React.FC = () => {
  const {
    isRecording,
    setIsRecording,
    sessionRecording,
    setSessionRecording,
  } = useStore();

  const [duration, setDuration] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRecording) {
      interval = setInterval(() => {
        setDuration(sessionRecorder.getDuration());
        setFrameCount(sessionRecorder.getFrameCount());
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    try {
      setError(null);
      sessionRecorder.start();
      setIsRecording(true);
      setDuration(0);
      setFrameCount(0);
    } catch (err) {
      setError(`Failed to start recording: ${err}`);
    }
  };

  const handleStopRecording = () => {
    try {
      const recording = sessionRecorder.stop();
      setSessionRecording(recording);
      setIsRecording(false);
    } catch (err) {
      setError(`Failed to stop recording: ${err}`);
    }
  };

  const handlePauseRecording = () => {
    try {
      sessionRecorder.pause();
      setIsRecording(false);
    } catch (err) {
      setError(`Failed to pause recording: ${err}`);
    }
  };

  const handleResumeRecording = () => {
    try {
      sessionRecorder.resume();
      setIsRecording(true);
    } catch (err) {
      setError(`Failed to resume recording: ${err}`);
    }
  };

  const handleClearRecording = () => {
    sessionRecorder.clear();
    setSessionRecording(null);
    setDuration(0);
    setFrameCount(0);
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds.toString().padStart(2, '0')}:${(milliseconds / 10).toString().padStart(2, '0')}`;
  };

  const handleDownloadRecording = () => {
    if (!sessionRecording) return;

    const data = {
      recording: sessionRecording,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recording-${sessionRecording.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const maxDuration = 30000;
  const progress = Math.min((duration / maxDuration) * 100, 100);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🎬 Session Recording</h3>
            <span className={`text-xs px-2 py-1 rounded ${isRecording ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
              {isRecording ? '● Recording' : 'Idle'}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Status Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            {/* Duration */}
            <div>
              <p className="text-xs text-gray-600 mb-1">Duration</p>
              <p className="text-2xl font-mono font-bold text-gray-900">
                {formatDuration(duration)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Max: 30 seconds</p>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${isRecording ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Frame Count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Frames Captured:</span>
              <span className="text-sm font-semibold text-gray-900">{frameCount}</span>
            </div>

            {/* File Size Estimate */}
            {sessionRecording && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Est. File Size:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {(sessionRecording.frames.length * 20 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {!isRecording ? (
              <>
                <button
                  onClick={handleStartRecording}
                  disabled={sessionRecording !== null}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition text-sm"
                >
                  ▶️ Start
                </button>
                {sessionRecording && (
                  <button
                    onClick={handleResumeRecording}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition text-sm"
                  >
                    ▶️ Resume
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handlePauseRecording}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium transition text-sm"
                >
                  ⏸️ Pause
                </button>
                <button
                  onClick={handleStopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition text-sm"
                >
                  ⏹️ Stop
                </button>
              </>
            )}
          </div>

          {/* Recording Actions */}
          {sessionRecording && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-semibold text-gray-900">Recorded Session:</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadRecording}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition"
                >
                  ⬇️ Download
                </button>
                <button
                  onClick={handleClearRecording}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          )}

          {/* Frame Preview */}
          {sessionRecording && sessionRecording.frames.length > 0 && (
            <div className="pt-4 border-t space-y-3">
              <p className="text-sm font-semibold text-gray-900">Frame Preview (First, Middle, Last):</p>
              <div className="grid grid-cols-3 gap-2">
                {[0, Math.floor(sessionRecording.frames.length / 2), sessionRecording.frames.length - 1]
                  .filter((_, idx, arr) => idx === 0 || arr[idx] !== arr[idx - 1])
                  .map((frameIdx) => {
                    const frame = sessionRecording.frames[frameIdx];
                    return (
                      <div
                        key={frameIdx}
                        className="bg-gray-100 rounded overflow-hidden border border-gray-200"
                      >
                        <img
                          src={frame.data}
                          alt={`Frame ${frameIdx}`}
                          className="w-full h-24 object-cover"
                        />
                        <p className="text-xs text-gray-600 p-1 text-center">
                          Frame {frameIdx + 1}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">💡 About Session Recording:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Records up to 30 seconds of activity</li>
              <li>Captures frame every 500ms (~60 fps)</li>
              <li>Includes in issue for visual reference</li>
              <li>Can be paused and resumed</li>
              <li>Export for external playback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

