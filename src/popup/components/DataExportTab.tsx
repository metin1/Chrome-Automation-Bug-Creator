import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { DataExporter, DataImporter } from '../../utils/dataExport';

export const DataExportTab: React.FC = () => {
  const { capturedData, setError } = useStore();
  const [exportFormat, setExportFormat] = useState<'json' | 'har' | 'markdown' | 'csv' | 'html'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!capturedData) {
    return (
      <div className="w-full h-full flex flex-col bg-white p-4">
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No data captured yet. Navigate a website and wait for data collection.</p>
        </div>
      </div>
    );
  }

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);

      let content: string;
      let filename: string;
      let mimeType: string;

      const timestamp = new Date().toISOString().split('T')[0];

      switch (exportFormat) {
        case 'json':
          content = DataExporter.exportAsJSON(capturedData);
          filename = `bug-report-${timestamp}.json`;
          mimeType = 'application/json';
          break;
        case 'har':
          content = DataExporter.exportAsHAR(capturedData);
          filename = `bug-report-${timestamp}.har`;
          mimeType = 'application/json';
          break;
        case 'markdown':
          content = DataExporter.exportAsMarkdown(capturedData);
          filename = `bug-report-${timestamp}.md`;
          mimeType = 'text/markdown';
          break;
        case 'csv':
          content = DataExporter.exportAsCSV(capturedData);
          filename = `bug-report-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        case 'html':
          content = DataExporter.exportAsHTML(capturedData);
          filename = `bug-report-${timestamp}.html`;
          mimeType = 'text/html';
          break;
        default:
          return;
      }

      DataExporter.downloadFile(content, filename, mimeType);
    } catch (err) {
      setError(`Export failed: ${err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const content = await file.text();

      if (file.name.endsWith('.har')) {
        await DataImporter.importHAR(content);
      } else if (file.name.endsWith('.json')) {
        await DataImporter.importJSON(content);
      } else {
        setError('Unsupported file format. Use .har or .json');
      }

      setError('Import successful!');
    } catch (err) {
      setError(`Import failed: ${err}`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const estimateExportSize = (): string => {
    // Rough estimate based on content
    const dataSize =
      JSON.stringify(capturedData).length * 0.75; // Estimate with compression
    return formatSize(Math.round(dataSize));
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📊 Export Data</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {capturedData.consoleLogs.length} logs
            </span>
          </div>

          {/* Data Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">Data Summary:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-600">Console Logs:</p>
                <p className="font-semibold text-gray-900">{capturedData.consoleLogs.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Network Requests:</p>
                <p className="font-semibold text-gray-900">{capturedData.networkRequests.length}</p>
              </div>
              <div>
                <p className="text-gray-600">URL:</p>
                <p className="font-mono text-gray-900 truncate">{capturedData.url}</p>
              </div>
              <div>
                <p className="text-gray-600">Estimated Size:</p>
                <p className="font-semibold text-gray-900">{estimateExportSize()}</p>
              </div>
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">Select Export Format:</p>
            <div className="space-y-2">
              {[
                { value: 'json', label: '📄 JSON', desc: 'Raw data structure' },
                { value: 'har', label: '🔗 HAR', desc: 'HTTP Archive format' },
                { value: 'markdown', label: '📝 Markdown', desc: 'GitHub-compatible' },
                { value: 'csv', label: '📊 CSV', desc: 'Spreadsheet format' },
                { value: 'html', label: '🌐 HTML', desc: 'Interactive report' },
              ].map((format) => (
                <label
                  key={format.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                    exportFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportFormat === format.value}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{format.label}</p>
                    <p className="text-xs text-gray-600">{format.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Format Details */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Format Details:</p>
            {exportFormat === 'json' && (
              <p>Complete JSON structure with all captured data, suitable for programmatic processing.</p>
            )}
            {exportFormat === 'har' && (
              <p>HTTP Archive format, standard for web debugging tools, includes network requests and responses.</p>
            )}
            {exportFormat === 'markdown' && (
              <p>Markdown format optimized for GitHub, with formatted tables and code blocks.</p>
            )}
            {exportFormat === 'csv' && (
              <p>Comma-separated values, suitable for import into spreadsheet applications.</p>
            )}
            {exportFormat === 'html' && (
              <p>Self-contained HTML report with styling, interactive and human-readable.</p>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition"
          >
            {isExporting ? '⏳ Exporting...' : '📥 Export Data'}
          </button>

          {/* Import Section */}
          <div className="pt-4 border-t">
            <p className="text-sm font-semibold text-gray-900 mb-3">Import Data:</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.har"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition"
            >
              📤 Import JSON/HAR
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-700 space-y-1">
            <p className="font-semibold">📋 Export Recommendations:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>JSON:</strong> For data analysis and programmatic processing
              </li>
              <li>
                <strong>HAR:</strong> For sharing with developers or debugging tools
              </li>
              <li>
                <strong>Markdown:</strong> For pasting directly into GitHub issues
              </li>
              <li>
                <strong>CSV:</strong> For spreadsheet analysis
              </li>
              <li>
                <strong>HTML:</strong> For sharing as standalone report
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

