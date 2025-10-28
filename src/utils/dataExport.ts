import type { CapturedData, NetworkRequest, ConsoleLog } from '../types';

interface HARFormat {
  log: {
    version: string;
    creator: {
      name: string;
      version: string;
    };
    pages: Array<{
      startedDateTime: string;
      id: string;
      title: string;
      pageTimings: {
        onContentLoad: number;
        onLoad: number;
      };
    }>;
    entries: Array<{
      pageref: string;
      startedDateTime: string;
      time: number;
      request: {
        method: string;
        url: string;
        httpVersion: string;
        headers: Array<{ name: string; value: string }>;
        queryString: Array<{ name: string; value: string }>;
        cookies: Array<{ name: string; value: string }>;
        headersSize: number;
        bodySize: number;
      };
      response: {
        status: number;
        statusText: string;
        httpVersion: string;
        headers: Array<{ name: string; value: string }>;
        cookies: Array<{ name: string; value: string }>;
        content: {
          size: number;
          mimeType: string;
          text?: string;
        };
        redirectURL: string;
        headersSize: number;
        bodySize: number;
      };
      cache: Record<string, unknown>;
      timings: {
        blocked: number;
        dns: number;
        connect: number;
        send: number;
        wait: number;
        receive: number;
        ssl: number;
      };
      name: string;
      comment: string;
    }>;
  };
}

export class DataExporter {
  /**
   * Export captured data as JSON
   */
  static exportAsJSON(data: CapturedData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Export captured data as HAR format
   */
  static exportAsHAR(data: CapturedData): string {
    const har: HARFormat = {
      log: {
        version: '1.2',
        creator: {
          name: 'GitHub Issue Creator',
          version: '1.0.0',
        },
        pages: [
          {
            startedDateTime: new Date(data.timestamp).toISOString(),
            id: `page-${data.timestamp}`,
            title: data.url,
            pageTimings: {
              onContentLoad: -1,
              onLoad: -1,
            },
          },
        ],
        entries: data.networkRequests.map((req: NetworkRequest) => ({
          pageref: `page-${data.timestamp}`,
          startedDateTime: new Date(req.timestamp).toISOString(),
          time: req.duration,
          request: {
            method: req.method,
            url: req.url,
            httpVersion: 'HTTP/1.1',
            headers: Object.entries(req.headers).map(([name, value]) => ({
              name,
              value,
            })),
            queryString: this.parseQueryString(req.url),
            cookies: [],
            headersSize: -1,
            bodySize: -1,
          },
          response: {
            status: req.status,
            statusText: req.statusText,
            httpVersion: 'HTTP/1.1',
            headers: Object.entries(req.responseHeaders).map(([name, value]) => ({
              name,
              value,
            })),
            cookies: [],
            content: {
              size: 0,
              mimeType: 'application/octet-stream',
            },
            redirectURL: '',
            headersSize: -1,
            bodySize: -1,
          },
          cache: {},
          timings: {
            blocked: 0,
            dns: 0,
            connect: 0,
            send: 0,
            wait: req.duration * 0.5,
            receive: req.duration * 0.5,
            ssl: 0,
          },
          name: this.extractFileName(req.url),
          comment: `${req.type} request`,
        })),
      },
    };

    return JSON.stringify(har, null, 2);
  }

  /**
   * Export as Markdown
   */
  static exportAsMarkdown(data: CapturedData): string {
    let markdown = '# Bug Report\n\n';
    markdown += `**URL**: [${data.url}](${data.url})\n`;
    markdown += `**Timestamp**: ${new Date(data.timestamp).toISOString()}\n`;
    markdown += `**Browser**: ${data.browserInfo.userAgent}\n`;
    markdown += `**Viewport**: ${data.browserInfo.viewport.width}x${data.browserInfo.viewport.height}\n\n`;

    if (data.consoleLogs.length > 0) {
      markdown += '## Console Logs\n\n';
      markdown += '```\n';
      data.consoleLogs.forEach((log: ConsoleLog) => {
        markdown += `[${log.type.toUpperCase()}] ${log.message}\n`;
        if (log.stackTrace) {
          markdown += `${log.stackTrace}\n`;
        }
      });
      markdown += '```\n\n';
    }

    if (data.networkRequests.length > 0) {
      markdown += '## Network Requests\n\n';
      markdown += '| URL | Method | Status | Type | Duration |\n';
      markdown += '|-----|--------|--------|------|----------|\n';
      data.networkRequests.forEach((req: NetworkRequest) => {
        const truncatedUrl = req.url.length > 50 ? req.url.substring(0, 47) + '...' : req.url;
        markdown += `| ${truncatedUrl} | ${req.method} | ${req.status} | ${req.type} | ${req.duration}ms |\n`;
      });
    }

    return markdown;
  }

  /**
   * Export as CSV
   */
  static exportAsCSV(data: CapturedData): string {
    let csv = 'Type,Message,Status,Timestamp\n';

    data.consoleLogs.forEach((log: ConsoleLog) => {
      const message = `"${log.message.replace(/"/g, '""')}"`;
      csv += `Console,${message},,${new Date(log.timestamp).toISOString()}\n`;
    });

    data.networkRequests.forEach((req: NetworkRequest) => {
      const url = `"${req.url.replace(/"/g, '""')}"`;
      csv += `Network,${url},${req.status},${new Date(req.timestamp).toISOString()}\n`;
    });

    return csv;
  }

  /**
   * Export as HTML report
   */
  static exportAsHTML(data: CapturedData): string {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bug Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
      line-height: 1.5;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #24292e;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 15px;
    }
    .info-item {
      padding: 8px;
      background: #f6f8fa;
      border-radius: 4px;
      font-size: 12px;
    }
    .info-item strong {
      display: block;
      color: #586069;
      font-size: 10px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section h2 {
      margin: 0 0 15px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #24292e;
      color: #24292e;
    }
    .log-entry {
      padding: 10px;
      margin-bottom: 5px;
      border-left: 4px solid #ddd;
      background: #f6f8fa;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      overflow-x: auto;
    }
    .log-entry.error {
      border-left-color: #d73a49;
      background: #fdeaea;
    }
    .log-entry.warn {
      border-left-color: #f9826c;
      background: #fff8e5;
    }
    .log-entry.info {
      border-left-color: #0366d6;
      background: #e8f0ff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f6f8fa;
      font-weight: 600;
      color: #24292e;
    }
    tr:hover {
      background: #f6f8fa;
    }
    .status-ok { color: #28a745; }
    .status-error { color: #d73a49; }
    .status-warn { color: #f9826c; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🐛 Bug Report</h1>
    <div class="info-grid">
      <div class="info-item">
        <strong>URL</strong>
        <a href="${data.url}" target="_blank">${data.url}</a>
      </div>
      <div class="info-item">
        <strong>Timestamp</strong>
        ${new Date(data.timestamp).toLocaleString()}
      </div>
      <div class="info-item">
        <strong>Browser</strong>
        ${data.browserInfo.os}
      </div>
      <div class="info-item">
        <strong>Viewport</strong>
        ${data.browserInfo.viewport.width}x${data.browserInfo.viewport.height}
      </div>
    </div>
  </div>

  ${
    data.consoleLogs.length > 0
      ? `
  <div class="section">
    <h2>Console Logs</h2>
    ${data.consoleLogs
      .map(
        (log: ConsoleLog) => `
      <div class="log-entry ${log.type}">
        <strong>[${log.type.toUpperCase()}]</strong> ${log.message}
        ${log.stackTrace ? `<pre>${log.stackTrace}</pre>` : ''}
      </div>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }

  ${
    data.networkRequests.length > 0
      ? `
  <div class="section">
    <h2>Network Requests</h2>
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Method</th>
          <th>Status</th>
          <th>Type</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${data.networkRequests
          .map(
            (req: NetworkRequest) => `
          <tr>
            <td><code>${req.url}</code></td>
            <td>${req.method}</td>
            <td class="status-${req.status < 400 ? 'ok' : 'error'}">${req.status}</td>
            <td>${req.type}</td>
            <td>${req.duration}ms</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>
  `
      : ''
  }

  <script>
    console.log('Report generated at', new Date().toISOString());
  </script>
</body>
</html>`;

    return html;
  }

  /**
   * Download file with given content
   */
  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Parse query string from URL
   */
  private static parseQueryString(url: string): Array<{ name: string; value: string }> {
    const params: Array<{ name: string; value: string }> = [];
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, name) => {
      params.push({ name, value });
    });
    return params;
  }

  /**
   * Extract filename from URL
   */
  private static extractFileName(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'request';
    } catch {
      return 'request';
    }
  }
}

export class DataImporter {
  /**
   * Import HAR file
   */
  static async importHAR(fileContent: string): Promise<CapturedData> {
    try {
      const har: HARFormat = JSON.parse(fileContent);
      const page = har.log.pages[0];

      const networkRequests = har.log.entries.map((entry) => ({
        id: `imported-${Date.now()}-${Math.random()}`,
        url: entry.request.url,
        method: entry.request.method,
        status: entry.response.status,
        statusText: entry.response.statusText,
        type: this.getMimeType(entry.response.content.mimeType),
        timestamp: new Date(entry.startedDateTime).getTime(),
        duration: entry.time,
        headers: this.arrayToObject(entry.request.headers),
        responseHeaders: this.arrayToObject(entry.response.headers),
      }));

      return {
        url: page.title,
        timestamp: new Date(page.startedDateTime).getTime(),
        networkRequests,
        consoleLogs: [],
        browserInfo: {
          userAgent: 'Imported from HAR',
          viewport: { width: 1280, height: 720 },
          os: 'Unknown',
          browserVersion: 'Unknown',
        },
      };
    } catch (error) {
      throw new Error(`Failed to import HAR: ${error}`);
    }
  }

  /**
   * Import JSON file
   */
  static async importJSON(fileContent: string): Promise<CapturedData> {
    try {
      return JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to import JSON: ${error}`);
    }
  }

  private static arrayToObject(arr: Array<{ name: string; value: string }>): Record<string, string> {
    const obj: Record<string, string> = {};
    arr.forEach(item => {
      obj[item.name] = item.value;
    });
    return obj;
  }

  private static getMimeType(mimeType: string): string {
    if (mimeType.includes('json')) return 'xhr';
    if (mimeType.includes('html')) return 'document';
    if (mimeType.includes('css')) return 'stylesheet';
    if (mimeType.includes('javascript')) return 'script';
    if (mimeType.includes('image')) return 'image';
    return 'other';
  }
}

