import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';

export const ConsoleTab: React.FC = () => {
  const { capturedData, selectedConsoleLogs, toggleConsoleLog, selectAllErrors } = useStore();
  const [typeFilter, setTypeFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'log'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    if (!capturedData?.consoleLogs) return [];

    return capturedData.consoleLogs.filter(log => {
      // Type filter
      if (typeFilter !== 'all' && log.type !== typeFilter) return false;

      // Search filter
      if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [capturedData?.consoleLogs, typeFilter, searchTerm]);

  const logCounts = useMemo(() => {
    if (!capturedData?.consoleLogs) return { error: 0, warn: 0, info: 0, log: 0 };
    
    return capturedData.consoleLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [capturedData?.consoleLogs]);

  const clearAll = () => {
    filteredLogs.forEach(log => {
      if (selectedConsoleLogs.includes(log.id)) {
        toggleConsoleLog(log.id);
      }
    });
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      case 'log': return '📝';
      default: return '•';
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warn': return 'text-orange-600 dark:text-orange-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      case 'log': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-3 space-y-2 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search console logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
              typeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            All ({capturedData?.consoleLogs.length || 0})
          </button>
          <button
            onClick={() => setTypeFilter('error')}
            className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
              typeFilter === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Errors ({logCounts.error || 0})
          </button>
          <button
            onClick={() => setTypeFilter('warn')}
            className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
              typeFilter === 'warn'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Warns ({logCounts.warn || 0})
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={selectAllErrors}
            className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Select All Errors
          </button>
          <button
            onClick={clearAll}
            className="flex-1 px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Console Log List */}
      <div className="flex-1 overflow-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
            {capturedData?.consoleLogs.length === 0
              ? 'No console logs captured yet'
              : 'No logs match your filters'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => {
              const isSelected = selectedConsoleLogs.includes(log.id);
              
              return (
                <div
                  key={log.id}
                  onClick={() => toggleConsoleLog(log.id)}
                  className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleConsoleLog(log.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{getLogIcon(log.type)}</span>
                        <span className={`text-xs font-semibold uppercase ${getLogColor(log.type)}`}>
                          {log.type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap break-words">
                        {log.message}
                      </div>
                      
                      {log.stackTrace && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                            View Stack Trace
                          </summary>
                          <pre className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap break-words max-h-32 overflow-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {log.stackTrace}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Showing {filteredLogs.length} of {capturedData?.consoleLogs.length || 0} logs
          <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
            ({selectedConsoleLogs.length} selected)
          </span>
        </div>
      </div>
    </div>
  );
};

