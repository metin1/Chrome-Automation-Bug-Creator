import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { TemplateManager } from '../../utils/templates';
import type { IssueTemplate } from '../../types';

export const TemplatesTab: React.FC = () => {
  const {
    issueTemplates,
    setIssueTemplates,
    setIssueTitle,
    setIssueBody,
    setIssueLabels,
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    body: '',
    labels: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templates = await TemplateManager.getAllTemplates();
      if (templates.length === 0) {
        // Load defaults if no templates exist
        await TemplateManager.resetToDefaults();
        const defaults = await TemplateManager.getAllTemplates();
        setIssueTemplates(defaults);
      } else {
        setIssueTemplates(templates);
      }
    } catch (err) {
      setError(`Failed to load templates: ${err}`);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.body) {
      setError('Template name and body are required');
      return;
    }

    try {
      const template = await TemplateManager.createTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        body: newTemplate.body,
        labels: newTemplate.labels.split(',').map(l => l.trim()).filter(Boolean),
      });

      setIssueTemplates([...issueTemplates, template]);
      setNewTemplate({ name: '', description: '', body: '', labels: '' });
      setIsCreating(false);
      setError(null);
    } catch (err) {
      setError(`Failed to create template: ${err}`);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await TemplateManager.deleteTemplate(id);
      setIssueTemplates(issueTemplates.filter(t => t.id !== id));
    } catch (err) {
      setError(`Failed to delete template: ${err}`);
    }
  };

  const handleApplyTemplate = (template: IssueTemplate) => {
    setIssueTitle(template.name);
    setIssueBody(template.body);
    setIssueLabels(template.labels);
  };

  const handleUseAsForm = (template: IssueTemplate) => {
    setNewTemplate({
      name: template.name,
      description: template.description,
      body: template.body,
      labels: template.labels.join(', '),
    });
    setEditingId(template.id);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📋 Issue Templates</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {issueTemplates.length}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Create/Edit Form */}
          {isCreating || editingId ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">
                {editingId ? '✏️ Edit Template' : '➕ Create New Template'}
              </p>

              <input
                type="text"
                placeholder="Template name (e.g., 'Bug Report')"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Description (optional)"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />

              <textarea
                placeholder="Template body (use variables like {title}, {url})"
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-32 resize-none"
              />

              <input
                type="text"
                placeholder="Labels (comma-separated)"
                value={newTemplate.labels}
                onChange={(e) => setNewTemplate({ ...newTemplate, labels: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleCreateTemplate}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-medium transition text-sm"
                >
                  💾 Save Template
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    setNewTemplate({ name: '', description: '', body: '', labels: '' });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded font-medium transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition text-sm"
            >
              ➕ Create New Template
            </button>
          )}

          {/* Templates List */}
          {issueTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No templates yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issueTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{template.name}</h4>
                      {template.description && (
                        <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded p-2 mb-2 max-h-20 overflow-hidden">
                    <p className="text-xs text-gray-600 line-clamp-3">{template.body}</p>
                  </div>

                  {/* Labels */}
                  {template.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {template.labels.map((label) => (
                        <span
                          key={label}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApplyTemplate(template)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition"
                    >
                      ✅ Use This
                    </button>
                    <button
                      onClick={() => handleUseAsForm(template)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">💡 Templates Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>"Use This" applies template to form</li>
              <li>"Edit" lets you modify a template</li>
              <li>Templates are saved locally</li>
              <li>Default templates provided</li>
              <li>Reuse common issue patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

