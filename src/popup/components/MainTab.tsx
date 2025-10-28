import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { GitHubAPI } from '../../utils/github';
import { OpenAIAPI } from '../../utils/openai';
import { storage } from '../../utils/storage';
import { speechToText } from '../../utils/speechToText';
import type { GitHubRepo, GitHubLabel } from '../../types';

export const MainTab: React.FC = () => {
  const {
    capturedData,
    selectedNetworkRequests,
    selectedConsoleLogs,
    isLoading,
    setLoading,
    setError,
    issueTitle,
    setIssueTitle,
    issueBody,
    setIssueBody,
    issueLabels,
    setIssueLabels,
    selectedRepo,
    setSelectedRepo,
    additionalLogs,
    setAdditionalLogs,
    screenshots,
    sessionRecording,
    clearIssueData,
  } = useStore();
  
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [availableLabels, setAvailableLabels] = useState<GitHubLabel[]>([]);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    loadRepos();
    loadSelectedRepo();
    // Check if speech recognition is supported
    const isSupported = speechToText.isSupported();
    setSpeechSupported(isSupported);
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      loadLabels();
    }
  }, [selectedRepo]);

  const handleSpeechToText = async (target: 'title' | 'description') => {
    if (!speechToText.isSupported()) {
      setError('Speech Recognition API not supported in your browser');
      return;
    }

    if (isListening) {
      // Stop listening
      const transcript = speechToText.stop();
      setIsListening(false);

      if (transcript) {
        if (target === 'title') {
          setIssueTitle(transcript);
        } else {
          setIssueBody(issueBody + (issueBody ? '\n' : '') + transcript);
        }
      }
    } else {
      // Start listening
      try {
        setIsListening(true);
        setError(null);
        
        await speechToText.start((transcript) => {
          if (target === 'title') {
            setIssueTitle(transcript);
          } else {
            setIssueBody(transcript);
          }
        });
      } catch (err) {
        setError(`Speech to text failed: ${err}`);
        setIsListening(false);
      }
    }
  };

  const loadRepos = async () => {
    const token = await storage.getGitHubToken();
    if (!token) return;

    try {
      const api = new GitHubAPI(token);
      const userRepos = await api.getRepositories();
      setRepos(userRepos);
    } catch (err) {
      console.error('Failed to load repos:', err);
    }
  };

  const loadSelectedRepo = async () => {
    // selectedRepo is already loaded from persisted store
    // No need to fetch from storage anymore
  };

  const loadLabels = async () => {
    const token = await storage.getGitHubToken();
    if (!token || !selectedRepo) return;

    try {
      const [owner, repoName] = selectedRepo.split('/');
      const api = new GitHubAPI(token);
      const repoLabels = await api.getLabels(owner, repoName);
      setAvailableLabels(repoLabels);
    } catch (err) {
      console.error('Failed to load labels:', err);
    }
  };

  const generateCompleteBody = (): string => {
    let body = `## Page Information\n\n`;
    body += `- **URL**: ${capturedData?.url}\n`;
    body += `- **Timestamp**: ${new Date(capturedData?.timestamp || 0).toLocaleString()}\n\n`;

    // Add ALL console logs
    // Add SELECTED console logs only
    if (capturedData?.consoleLogs && capturedData.consoleLogs.length > 0) {
      // Filter to only SELECTED logs
      const selectedLogs = capturedData.consoleLogs.filter(log =>
        selectedConsoleLogs.includes(log.id)
      );
      
      const errors = selectedLogs.filter(log => log.type === 'error');
      const warnings = selectedLogs.filter(log => log.type === 'warn');
      const logs = selectedLogs.filter(log => log.type === 'log' || log.type === 'info');
      
      if (errors.length > 0) {
        body += `## Console Errors (${errors.length})\n\n`;
        errors.slice(0, 10).forEach((error, idx) => {
          body += `### Error ${idx + 1}\n`;
          body += `\`\`\`\n${error.message}\n\`\`\`\n`;
          if (error.stackTrace) {
            body += `\n**Stack Trace:**\n\`\`\`\n${error.stackTrace}\n\`\`\`\n`;
          }
          body += `\n`;
        });
        if (errors.length > 10) {
          body += `*... and ${errors.length - 10} more errors*\n\n`;
        }
      }

      if (warnings.length > 0) {
        body += `## Console Warnings (${warnings.length})\n\n`;
        warnings.slice(0, 5).forEach((warning, idx) => {
          body += `⚠️ **Warning ${idx + 1}:** ${warning.message}\n`;
        });
        if (warnings.length > 5) {
          body += `\n*... and ${warnings.length - 5} more warnings*\n\n`;
        }
      }

      if (logs.length > 0) {
        body += `## Console Logs (${logs.length})\n\n`;
        logs.slice(0, 5).forEach((log, idx) => {
          body += `📝 **Log ${idx + 1}:** ${log.message.slice(0, 100)}\n`;
        });
        if (logs.length > 5) {
          body += `\n*... and ${logs.length - 5} more logs*\n\n`;
        }
      }
    }

    // Add SELECTED network requests only
    if (capturedData?.networkRequests && capturedData.networkRequests.length > 0) {
      // Filter to only SELECTED requests
      const selectedRequests = capturedData.networkRequests.filter(req =>
        selectedNetworkRequests.includes(req.id)
      );
      
      const failedRequests = selectedRequests.filter(req => req.status >= 400);
      const successRequests = selectedRequests.filter(req => req.status >= 200 && req.status < 300);
      const pendingRequests = capturedData.networkRequests.filter(req => req.status === 0);
      
      if (failedRequests.length > 0) {
        body += `## Failed Network Requests (${failedRequests.length})\n\n`;
        failedRequests.slice(0, 10).forEach(req => {
          body += `❌ \`${req.method}\` [${req.status}] ${req.url}\n`;
          body += `   Duration: ${req.duration.toFixed(0)}ms\n`;
        });
        if (failedRequests.length > 10) {
          body += `\n*... and ${failedRequests.length - 10} more failed requests*\n\n`;
        }
      }

      if (successRequests.length > 0) {
        body += `## Successful Network Requests (${successRequests.length})\n\n`;
        successRequests.slice(0, 5).forEach(req => {
          body += `✅ \`${req.method}\` [${req.status}] ${req.url}\n`;
          body += `   Duration: ${req.duration.toFixed(0)}ms\n`;
        });
        if (successRequests.length > 5) {
          body += `\n*... and ${successRequests.length - 5} more successful requests*\n\n`;
        }
      }

      if (pendingRequests.length > 0) {
        body += `## Pending Network Requests (${pendingRequests.length})\n\n`;
        pendingRequests.slice(0, 5).forEach(req => {
          body += `⏳ \`${req.method}\` ${req.url}\n`;
        });
      }
    }

    // Add screenshots if captured
    if (screenshots && screenshots.length > 0) {
      body += `## Screenshots (${screenshots.length})\n\n`;
      screenshots.forEach((screenshot, idx) => {
        body += `### Screenshot ${idx + 1}\n`;
        body += `![Screenshot ${idx + 1}](data:image/png;base64,${screenshot.data.substring(0, 100)}...)\n\n`;
      });
    }

    // Add recording information if available
    if (sessionRecording && sessionRecording.frames && sessionRecording.frames.length > 0) {
      body += `## Session Recording\n\n`;
      body += `- **Duration**: ${(sessionRecording.duration / 1000).toFixed(2)}s\n`;
      body += `- **Frames Captured**: ${sessionRecording.frames.length}\n`;
      body += `- **Frame Interval**: 500ms\n`;
      body += `- **Quality**: Video data available\n\n`;
    }

    // Add additional logs if provided - ALWAYS include this
    if (additionalLogs.trim()) {
      body += `## Additional Logs\n\n`;
      body += `\`\`\`\n${additionalLogs}\n\`\`\`\n\n`;
    }

    // Add browser info
    if (capturedData?.browserInfo) {
      body += `## Environment\n\n`;
      body += `- **Browser**: ${capturedData.browserInfo.userAgent}\n`;
      body += `- **OS**: ${capturedData.browserInfo.os}\n`;
      body += `- **Viewport**: ${capturedData.browserInfo.viewport.width}x${capturedData.browserInfo.viewport.height}px\n`;
    }

    return body;
  };

  const generateTitle = async () => {
    const openaiKey = await storage.getOpenAIKey();
    if (!openaiKey) {
      setError('OpenAI API key not configured. Go to Settings.');
      return;
    }

    setIsGeneratingTitle(true);
    try {
      const api = new OpenAIAPI(openaiKey);
      
      const errorMessages = capturedData?.consoleLogs
        .filter(log => selectedConsoleLogs.includes(log.id) && log.type === 'error')
        .map(log => log.message.slice(0, 200));

      const failedRequests = capturedData?.networkRequests
        .filter(req => selectedNetworkRequests.includes(req.id) && req.status >= 400)
        .map(req => `${req.method} ${new URL(req.url).pathname}`);

      const generatedTitle = await api.generateIssueTitle({
        url: capturedData?.url || '',
        errorMessage: errorMessages?.[0],
        networkRequests: failedRequests?.slice(0, 3),
      });

      setIssueTitle(generatedTitle);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to generate title with AI: ${errorMessage}`);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const generateIssueBody = () => {
    setIssueBody(generateCompleteBody());
  };

  const handleCreateIssue = async () => {
    if (!issueTitle || !selectedRepo) {
      setError('Title and repository are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await storage.getGitHubToken();
      if (!token) {
        setError('GitHub token not configured. Go to Settings.');
        setLoading(false);
        return;
      }

      // Always generate complete body with all captured data and additional logs
      const finalBody = issueBody.trim() && !additionalLogs.trim()
        ? issueBody
        : generateCompleteBody();

      const api = new GitHubAPI(token);
      const [owner, repoName] = selectedRepo.split('/');

      const issue = await api.createIssue(owner, repoName, {
        title: issueTitle,
        body: finalBody,
        labels: issueLabels,
      });

      // Show success
      alert(`Issue created successfully!\n\n${issue.html_url}`);
      
      // Clear the form data after successful creation
      clearIssueData();
      window.close();
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  const toggleLabel = (labelName: string) => {
    const newLabels = issueLabels.includes(labelName)
      ? issueLabels.filter((l: string) => l !== labelName)
      : [...issueLabels, labelName];
    setIssueLabels(newLabels);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Repository Selection */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
          Repository *
        </label>
        <select
          value={selectedRepo}
          onChange={(e) => setSelectedRepo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a repository...</option>
          {repos.map(r => (
            <option key={r.id} value={r.full_name}>
              {r.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
          Title *
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
            placeholder="Enter issue title..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          {speechSupported && (
            <button
              onClick={() => handleSpeechToText('title')}
              className={`px-3 py-2 rounded-md font-medium transition ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              title={isListening ? 'Stop recording' : 'Start recording'}
            >
              {isListening ? '⏹️ Stop' : '🎤 Record'}
            </button>
          )}
        </div>
        <button
          onClick={generateTitle}
          disabled={isGeneratingTitle}
          className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
        >
          {isGeneratingTitle ? '⏳ Generating with AI...' : '✨ Generate with AI'}
        </button>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
          Description
        </label>
        <div className="mb-2">
          <textarea
            value={issueBody}
            onChange={(e) => setIssueBody(e.target.value)}
            rows={8}
            placeholder="Issue description (supports Markdown)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateIssueBody}
            className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            📋 Generate from Captured Data
          </button>
          {speechSupported && (
            <button
              onClick={() => handleSpeechToText('description')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              title={isListening ? 'Stop recording' : 'Start recording'}
            >
              {isListening ? '⏹️ Stop' : '🎤 Record'}
            </button>
          )}
        </div>
      </div>

      {/* Additional Logs */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
          Additional Logs (Optional)
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Paste Vercel logs, terminal output, or other debugging information
        </p>
        <textarea
          value={additionalLogs}
          onChange={(e) => setAdditionalLogs(e.target.value)}
          rows={5}
          placeholder="Paste terminal logs, Vercel deployment logs, error stack traces, etc..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          This will be included in the issue under "Additional Logs" section
        </p>
      </div>

      {/* Labels */}
      {availableLabels.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {availableLabels.map(label => (
              <button
                key={label.id}
                onClick={() => toggleLabel(label.name)}
                className={`px-2 py-1 text-xs rounded-full transition-all ${
                  issueLabels.includes(label.name)
                    ? 'ring-2 ring-blue-500 opacity-100'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: `#${label.color}`,
                  color: parseInt(label.color, 16) > 0xffffff / 2 ? '#000' : '#fff',
                }}
              >
                {label.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleCreateIssue}
        disabled={isLoading || !issueTitle || !selectedRepo}
        className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '⏳ Creating Issue...' : '🚀 Create GitHub Issue'}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Selected: {selectedConsoleLogs.length} console logs, {selectedNetworkRequests.length} network requests
      </p>
    </div>
  );
};

