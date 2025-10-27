import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';

export const NetworkTab: React.FC = () => {
  const { capturedData, selectedNetworkRequests, toggleNetworkRequest } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'errors' | 'success'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = useMemo(() => {
    if (!capturedData?.networkRequests) return [];

    return capturedData.networkRequests.filter(req => {
      // Status filter
      if (statusFilter === 'errors' && req.status < 400) return false;
      if (statusFilter === 'success' && (req.status < 200 || req.status >= 300)) return false;

      // Type filter
      if (typeFilter !== 'all' && req.type !== typeFilter) return false;

      // Search filter
      if (searchTerm && !req.url.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [capturedData?.networkRequests, statusFilter, typeFilter, searchTerm]);

  const requestTypes = useMemo(() => {
    if (!capturedData?.networkRequests) return [];
    const types = new Set(capturedData.networkRequests.map(r => r.type));
    return Array.from(types);
  }, [capturedData?.networkRequests]);

  const selectAll = () => {
    filteredRequests.forEach(req => {
      if (!selectedNetworkRequests.includes(req.id)) {
        toggleNetworkRequest(req.id);
      }
    });
  };

  const clearAll = () => {
    filteredRequests.forEach(req => {
      if (selectedNetworkRequests.includes(req.id)) {
        toggleNetworkRequest(req.id);
      }
    });
  };

  const getStatusColor = (status: number) => {
    if (status === 0) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 300 && status < 400) return 'text-blue-600 dark:text-blue-400';
    if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400';
    if (status >= 500) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-3 space-y-2 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search URLs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="success">2xx Success</option>
            <option value="errors">4xx/5xx Errors</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Types</option>
            {requestTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="flex-1 px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Request List */}
      <div className="flex-1 overflow-auto">
        {filteredRequests.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
            No network requests found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRequests.map((req) => {
              const isSelected = selectedNetworkRequests.includes(req.id);
              const url = new URL(req.url);
              
              return (
                <div
                  key={req.id}
                  onClick={() => toggleNetworkRequest(req.id)}
                  className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleNetworkRequest(req.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">
                          {req.method}
                        </span>
                        <span className={`text-xs font-semibold ${getStatusColor(req.status)}`}>
                          {req.status || 'ERR'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {req.duration.toFixed(0)}ms
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">
                        {url.pathname}
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {url.hostname}
                      </div>
                      
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {req.type}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(req.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
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
          Showing {filteredRequests.length} of {capturedData?.networkRequests.length || 0} requests
          <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
            ({selectedNetworkRequests.length} selected)
          </span>
        </div>
      </div>
    </div>
  );
};

