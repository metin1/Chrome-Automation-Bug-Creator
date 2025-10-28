import { useStore } from '../../store/useStore';

export const AdvancedDataTab = () => {
  const {
    capturedData,
    capturedStates,
    capturedStorage,
    webSocketMessages,
  } = useStore();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        Advanced Data View
      </h2>

      {/* Captured States */}
      {capturedStates && capturedStates.length > 0 && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Captured States ({capturedStates.length})
          </h3>
          <div className="space-y-2">
            {capturedStates.map((state, idx) => (
              <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="font-mono">
                  <strong>{state.type}</strong> - {new Date(state.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Captured Storage */}
      {capturedStorage && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Captured Storage
          </h3>
          <div className="text-xs space-y-2">
            <div>
              <strong>LocalStorage:</strong> {Object.keys(capturedStorage.localStorage || {}).length} items
            </div>
            <div>
              <strong>SessionStorage:</strong> {Object.keys(capturedStorage.sessionStorage || {}).length} items
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Captured at: {new Date(capturedStorage.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* WebSocket Messages */}
      {webSocketMessages && webSocketMessages.length > 0 && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            WebSocket Messages ({webSocketMessages.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {webSocketMessages.slice(-5).map((msg, idx) => (
              <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="flex justify-between">
                  <span className={msg.type === 'sent' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
                    {msg.type === 'sent' ? '↑ SENT' : '↓ RECEIVED'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{msg.size} bytes</span>
                </div>
                <div className="font-mono text-gray-700 dark:text-gray-300 truncate">
                  {msg.data.substring(0, 100)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page Data */}
      {capturedData && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Page Data
          </h3>
          <div className="text-xs space-y-1">
            <div>
              <strong>URL:</strong> <span className="text-blue-600 dark:text-blue-400">{capturedData.url}</span>
            </div>
            <div>
              <strong>Console Logs:</strong> {capturedData.consoleLogs?.length || 0}
            </div>
            <div>
              <strong>Network Requests:</strong> {capturedData.networkRequests?.length || 0}
            </div>
            <div>
              <strong>Captured:</strong> {new Date(capturedData.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {!capturedData && !capturedStates.length && !capturedStorage && !webSocketMessages.length && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p>No advanced data captured yet.</p>
          <p className="text-xs mt-2">Visit a website and interact with it to capture data.</p>
        </div>
      )}
    </div>
  );
};

