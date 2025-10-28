import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { DuplicateDetector } from '../../utils/duplicateDetection';
import { storage } from '../../utils/storage';
import type { GitHubRepo } from '../../types';

export const DuplicateDetectionTab: React.FC = () => {
  const {
    issueTitle,
    issueBody,
    duplicateMatches,
    setDuplicateMatches,
    isLoading,
    setLoading,
    setError,
  } = useStore();

  const [threshold, setThreshold] = useState(0.6);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedCheckRepo, setSelectedCheckRepo] = useState('');
  const [hasChecked, setHasChecked] = useState(false);

  const loadRepos = async () => {
    try {
      const token = await storage.getGitHubToken();
      if (!token) {
        setError('GitHub token not configured');
        return;
      }

      const detector = new DuplicateDetector(token);
      const api = detector['api'];
      const userRepos = await api.getRepositories();
      setRepos(userRepos);
      if (userRepos.length > 0) {
        setSelectedCheckRepo(userRepos[0].full_name);
      }
    } catch (err) {
      setError(`Failed to load repositories: ${err}`);
    }
  };

  React.useEffect(() => {
    loadRepos();
  }, []);

  const handleCheckDuplicates = async () => {
    if (!issueTitle || !issueBody) {
      setError('Please fill in both title and description first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasChecked(true);

      const token = await storage.getGitHubToken();
      if (!token) {
        setError('GitHub token not configured');
        return;
      }

      const detector = new DuplicateDetector(token);
      const repo = repos.find(r => r.full_name === selectedCheckRepo);

      if (!repo) {
        setError('Repository not found');
        return;
      }

      const matches = await detector.findDuplicates(repo, issueTitle, issueBody, threshold);
      setDuplicateMatches(matches);
    } catch (err) {
      setError(`Duplicate check failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenIssue = (url: string) => {
    chrome.tabs.create({ url });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🔍 Duplicate Detection</h3>
            {hasChecked && (
              <span className={`text-xs px-2 py-1 rounded ${duplicateMatches.length === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {duplicateMatches.length} found
              </span>
            )}
          </div>

          {/* Configuration */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            {/* Repository Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Repository
              </label>
              <select
                value={selectedCheckRepo}
                onChange={(e) => setSelectedCheckRepo(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {repos.map((repo) => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Similarity Threshold: {(threshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher threshold = stricter matching (0.6 = balanced, 0.8 = very strict)
              </p>
            </div>

            {/* Current Issue Info */}
            <div className="bg-white border border-gray-200 rounded p-3">
              <p className="text-xs text-gray-600 mb-1">Current Issue:</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{issueTitle || 'No title'}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{issueBody ? issueBody.substring(0, 100) + '...' : 'No description'}</p>
            </div>

            {/* Check Button */}
            <button
              onClick={handleCheckDuplicates}
              disabled={isLoading || !issueTitle || !issueBody}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition"
            >
              {isLoading ? '⏳ Checking...' : '🔎 Check for Duplicates'}
            </button>
          </div>

          {/* Results */}
          {hasChecked && (
            <div className="space-y-3 pt-4 border-t">
              {duplicateMatches.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
                  <p className="text-green-800 font-medium">✅ No duplicates found!</p>
                  <p className="text-green-700 text-sm mt-1">
                    Your issue appears to be unique with threshold {(threshold * 100).toFixed(0)}%
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Found {duplicateMatches.length} potential duplicate{duplicateMatches.length !== 1 ? 's' : ''}:
                  </p>
                  {duplicateMatches.map((match) => (
                    <div
                      key={match.id}
                      className="border border-yellow-200 bg-yellow-50 rounded-lg p-3 hover:border-yellow-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <a
                            href={match.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm truncate block"
                          >
                            #{match.id}: {match.title}
                          </a>
                        </div>
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded whitespace-nowrap font-semibold">
                          {(match.similarity * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Similarity Bar */}
                      <div className="w-full bg-yellow-200 rounded-full h-1.5 mb-2">
                        <div
                          className="h-full bg-yellow-600 rounded-full transition-all"
                          style={{ width: `${match.similarity * 100}%` }}
                        />
                      </div>

                      {/* Issue Details */}
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{match.body}</p>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>
                          {match.state === 'open' ? '🟢 Open' : '🔴 Closed'} •
                          Created {new Date(match.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenIssue(match.url)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition"
                        >
                          🔗 View Issue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">💡 How It Works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Compares title and description with existing issues</li>
              <li>Uses multiple similarity algorithms</li>
              <li>Shows similarity percentage (0-100%)</li>
              <li>Helps prevent duplicate issue creation</li>
              <li>Threshold controls strictness of matching</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

