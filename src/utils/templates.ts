import type { IssueTemplate } from '../types';

export class TemplateManager {
  private static readonly STORAGE_KEY = 'github_issue_templates';

  static async createTemplate(template: Omit<IssueTemplate, 'id'>): Promise<IssueTemplate> {
    const fullTemplate: IssueTemplate = {
      ...template,
      id: `template-${Date.now()}`,
    };

    const templates = await this.getAllTemplates();
    templates.push(fullTemplate);
    await this.saveTemplates(templates);

    return fullTemplate;
  }

  static async updateTemplate(id: string, updates: Partial<IssueTemplate>): Promise<IssueTemplate> {
    const templates = await this.getAllTemplates();
    const index = templates.findIndex(t => t.id === id);

    if (index === -1) {
      throw new Error(`Template with id ${id} not found`);
    }

    const updated = { ...templates[index], ...updates, id };
    templates[index] = updated;
    await this.saveTemplates(templates);

    return updated;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const templates = await this.getAllTemplates();
    const filtered = templates.filter(t => t.id !== id);
    await this.saveTemplates(filtered);
  }

  static async getTemplate(id: string): Promise<IssueTemplate | null> {
    const templates = await this.getAllTemplates();
    return templates.find(t => t.id === id) || null;
  }

  static async getAllTemplates(): Promise<IssueTemplate[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(this.STORAGE_KEY, (result) => {
        resolve(result[this.STORAGE_KEY] || []);
      });
    });
  }

  static async saveTemplates(templates: IssueTemplate[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.STORAGE_KEY]: templates }, resolve);
    });
  }

  static async importTemplates(templates: IssueTemplate[]): Promise<void> {
    const existing = await this.getAllTemplates();
    const combined = [...existing, ...templates.map(t => ({ ...t, id: `template-${Date.now()}-${Math.random()}` }))];
    await this.saveTemplates(combined);
  }

  static async exportTemplates(): Promise<IssueTemplate[]> {
    return this.getAllTemplates();
  }

  static getDefaultTemplates(): IssueTemplate[] {
    return [
      {
        id: 'template-bug',
        name: 'Bug Report',
        description: 'Standard bug report template',
        body: `## Description
Describe the bug clearly and concisely.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
Describe what should happen.

## Actual Behavior
Describe what actually happens.

## Environment
- Browser:
- OS:
- Version:

## Additional Context
Any additional information.`,
        labels: ['bug'],
      },
      {
        id: 'template-feature',
        name: 'Feature Request',
        description: 'Template for feature requests',
        body: `## Feature Description
Describe the desired feature.

## Use Case
Why do you need this feature?

## Proposed Solution
How should this feature work?

## Alternative Solutions
Any alternative approaches?

## Additional Context
Any additional information.`,
        labels: ['enhancement'],
      },
      {
        id: 'template-docs',
        name: 'Documentation',
        description: 'Template for documentation issues',
        body: `## Documentation Issue
What part of the documentation needs improvement?

## Current State
What is currently documented?

## Suggested Change
What should be added or modified?

## Impact
How does this affect users?

## Additional Context
Any additional information.`,
        labels: ['documentation'],
      },
      {
        id: 'template-performance',
        name: 'Performance Issue',
        description: 'Template for performance-related issues',
        body: `## Performance Problem
Describe the performance issue.

## Affected Area
Which part of the application is affected?

## Current Performance
What is the current performance?

## Expected Performance
What performance is expected?

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Environment Details
- Browser:
- Device:
- Network:

## Additional Information
Any profiling data or metrics.`,
        labels: ['performance'],
      },
    ];
  }

  static async resetToDefaults(): Promise<void> {
    const defaults = this.getDefaultTemplates();
    await this.saveTemplates(defaults);
  }
}

