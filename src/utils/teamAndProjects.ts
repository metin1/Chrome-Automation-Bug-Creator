import { GitHubAPI } from './github';
import type { TeamMember, ProjectColumn } from '../types';

export class TeamAndProjectsManager {
  private api: GitHubAPI;

  constructor(token: string) {
    this.api = new GitHubAPI(token);
  }

  /**
   * Get team members for a repository
   */
  async getTeamMembers(owner: string, repo: string): Promise<TeamMember[]> {
    try {
      const response = await this.api.request(
        `/repos/${owner}/${repo}/collaborators`
      );
      return response as TeamMember[];
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  /**
   * Get organization teams
   */
  async getOrganizationTeams(org: string): Promise<Array<{ id: number; name: string; slug: string }>> {
    try {
      const response = await this.api.request(`/orgs/${org}/teams`);
      return response as Array<{ id: number; name: string; slug: string }>;
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  /**
   * Get organization projects
   */
  async getOrganizationProjects(org: string): Promise<Array<{ id: number; name: string; state: string }>> {
    try {
      const response = await this.api.request(
        `/orgs/${org}/projects`,
        { headers: { 'X-GitHub-Api-Version': '2022-11-28' } }
      );
      return response as Array<{ id: number; name: string; state: string }>;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  /**
   * Get project columns
   */
  async getProjectColumns(projectId: number): Promise<ProjectColumn[]> {
    try {
      const response = await this.api.request(
        `/projects/${projectId}/columns`,
        { headers: { 'X-GitHub-Api-Version': '2022-11-28' } }
      );
      return response as ProjectColumn[];
    } catch (error) {
      console.error('Error fetching project columns:', error);
      return [];
    }
  }

  /**
   * Add issue to project
   */
  async addIssueToProject(
    issueUrl: string,
    columnId: number
  ): Promise<{ id: number; url: string }> {
    try {
      const response = await this.api.request(
        `/projects/columns/${columnId}/cards`,
        {
          data: { content_url: issueUrl },
          headers: { 'X-GitHub-Api-Version': '2022-11-28' }
        }
      );
      return response as { id: number; url: string };
    } catch (error) {
      console.error('Error adding issue to project:', error);
      throw error;
    }
  }

  /**
   * Assign issue to team members
   */
  async assignIssueToMembers(
    owner: string,
    repo: string,
    issueNumber: number,
    assignees: string[]
  ): Promise<void> {
    try {
      await this.api.request(
        `/repos/${owner}/${repo}/issues/${issueNumber}`,
        {
          data: { assignees }
        }
      );
    } catch (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
  }

  /**
   * Parse mention format (@username) from text
   */
  extractMentions(text: string): string[] {
    const mentionRegex = /@[\w-]+/g;
    const mentions = text.match(mentionRegex) || [];
    return mentions.map(m => m.substring(1)); // Remove @ symbol
  }

  /**
   * Format team mentions for issue body
   */
  formatTeamMentions(assignees: string[]): string {
    return assignees.map(a => `@${a}`).join(', ');
  }

  /**
   * Get suggested assignees based on history
   */
  async getSuggestedAssignees(
    owner: string,
    repo: string,
    limit: number = 5
  ): Promise<TeamMember[]> {
    try {
      // Get recent issues and count assignments
      const response = await this.api.request(
        `/repos/${owner}/${repo}/issues?state=all&per_page=20`
      );
      
      const issues = response as Array<{ assignees?: TeamMember[] }>;
      const assigneeCount: Record<string, number> = {};

      for (const issue of issues) {
        if (issue.assignees) {
          for (const assignee of issue.assignees) {
            assigneeCount[assignee.login] = (assigneeCount[assignee.login] || 0) + 1;
          }
        }
      }

      // Sort by frequency and return top assignees
      const sorted = Object.entries(assigneeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      const members = await this.getTeamMembers(owner, repo);
      return members.filter(m => sorted.some(([login]) => login === m.login));
    } catch (error) {
      console.error('Error getting suggested assignees:', error);
      return [];
    }
  }
}

