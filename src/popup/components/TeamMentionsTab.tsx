import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { TeamAndProjectsManager } from '../../utils/teamAndProjects';
import { storage } from '../../utils/storage';
import type { TeamMember } from '../../types';

export const TeamMentionsTab: React.FC = () => {
  const {
    selectedAssignees,
    setSelectedAssignees,
    selectedRepo,
    issueBody,
  } = useStore();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [suggestedMembers, setSuggestedMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await storage.getGitHubToken();
      if (!token) {
        setError('GitHub token not configured');
        return;
      }

      const manager = new TeamAndProjectsManager(token);

      if (selectedRepo) {
        const [owner, repo] = selectedRepo.split('/');
        const members = await manager.getTeamMembers(owner, repo);
        setTeamMembers(members);

        const suggested = await manager.getSuggestedAssignees(owner, repo, 5);
        setSuggestedMembers(suggested);
      }
    } catch (err) {
      setError(`Failed to load team data: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRepo]);

  const handleToggleAssignee = (login: string) => {
    if (selectedAssignees.includes(login)) {
      setSelectedAssignees(selectedAssignees.filter(a => a !== login));
    } else {
      setSelectedAssignees([...selectedAssignees, login]);
    }
  };

  const handleAddAllSuggested = () => {
    const allLogins = suggestedMembers.map(m => m.login);
    const combined = [...new Set([...selectedAssignees, ...allLogins])];
    setSelectedAssignees(combined);
  };

  const handleClearAll = () => {
    setSelectedAssignees([]);
  };

  const getMentionMarkdown = (): string => {
    if (selectedAssignees.length === 0) return '';
    return selectedAssignees.map(a => `@${a}`).join(', ');
  };

  const hasRelevantKeywords = (): boolean => {
    const keywords = ['help', 'assign', 'review', '@'];
    return keywords.some(keyword => issueBody.toLowerCase().includes(keyword));
  };

  const filteredTeamMembers = teamMembers.filter(member =>
    member.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedMembers = teamMembers.filter(m => selectedAssignees.includes(m.login));

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">👥 Team Mentions</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {selectedAssignees.length} selected
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
              <p className="text-sm font-semibold text-green-900">Selected for Assignment:</p>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member.login}
                    className="flex items-center gap-2 bg-white border border-green-300 rounded-full px-3 py-1"
                  >
                    {member.avatar_url && (
                      <img
                        src={member.avatar_url}
                        alt={member.login}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-green-900">@{member.login}</span>
                    <button
                      onClick={() => handleToggleAssignee(member.login)}
                      className="text-green-600 hover:text-green-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded">
                {getMentionMarkdown()}
              </p>
            </div>
          )}

          {/* Suggested Members */}
          {suggestedMembers.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-yellow-900">⭐ Frequently Assigned:</p>
                <button
                  onClick={handleAddAllSuggested}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                >
                  Add All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedMembers.map((member) => (
                  <button
                    key={member.login}
                    onClick={() => handleToggleAssignee(member.login)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${
                      selectedAssignees.includes(member.login)
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white border border-yellow-300 text-yellow-900 hover:border-yellow-400'
                    }`}
                  >
                    {member.avatar_url && (
                      <img
                        src={member.avatar_url}
                        alt={member.login}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    {member.login}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Team Members List */}
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Loading team members...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No team members found for this repository.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">Team Members ({filteredTeamMembers.length}):</p>
              {filteredTeamMembers.map((member) => (
                <button
                  key={member.login}
                  onClick={() => handleToggleAssignee(member.login)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg border transition ${
                    selectedAssignees.includes(member.login)
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAssignees.includes(member.login)}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  {member.avatar_url && (
                    <img
                      src={member.avatar_url}
                      alt={member.login}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900">{member.name || member.login}</p>
                    <p className="text-xs text-gray-500">@{member.login}</p>
                  </div>
                  {member.email && (
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Clear Selection */}
          {selectedAssignees.length > 0 && (
            <button
              onClick={handleClearAll}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition text-sm"
            >
              Clear Selection
            </button>
          )}

          {/* AI Suggestions */}
          {hasRelevantKeywords() && selectedAssignees.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">💡 Suggestion:</p>
              <p>Your issue description mentions assignment keywords. Consider mentioning relevant team members.</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">💡 Team Mentions Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Select team members to assign to the issue</li>
              <li>⭐ shows frequently assigned members</li>
              <li>Mentions are added as @username in issue</li>
              <li>Multiple assignees are supported</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

