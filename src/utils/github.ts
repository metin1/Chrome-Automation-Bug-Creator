import axios from 'axios';
import type { GitHubRepo, GitHubLabel, GitHubIssue } from '../types';

const GITHUB_API = 'https://api.github.com';

export class GitHubAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await axios.get(`${GITHUB_API}/user`, {
        headers: this.headers,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getRepositories(): Promise<GitHubRepo[]> {
    const response = await axios.get(`${GITHUB_API}/user/repos`, {
      headers: this.headers,
      params: {
        sort: 'updated',
        per_page: 100,
        affiliation: 'owner,collaborator,organization_member',
      },
    });
    return response.data;
  }

  async getLabels(owner: string, repo: string): Promise<GitHubLabel[]> {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/labels`,
      { headers: this.headers }
    );
    return response.data;
  }

  async createLabel(owner: string, repo: string, label: {
    name: string;
    color: string;
    description?: string;
  }): Promise<GitHubLabel> {
    const response = await axios.post(
      `${GITHUB_API}/repos/${owner}/${repo}/labels`,
      label,
      { headers: this.headers }
    );
    return response.data;
  }

  async createIssue(owner: string, repo: string, issue: GitHubIssue) {
    const response = await axios.post(
      `${GITHUB_API}/repos/${owner}/${repo}/issues`,
      issue,
      { headers: this.headers }
    );
    return response.data;
  }

  async searchIssues(owner: string, repo: string, query: string) {
    const response = await axios.get(`${GITHUB_API}/search/issues`, {
      headers: this.headers,
      params: {
        q: `repo:${owner}/${repo} ${query} is:issue`,
        per_page: 5,
        sort: 'created',
        order: 'desc',
      },
    });
    return response.data.items;
  }

  async getIssue(owner: string, repo: string, issueNumber: number) {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async getRepositoryIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open') {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/issues`,
      {
        headers: this.headers,
        params: { state, per_page: 100 }
      }
    );
    return response.data;
  }

  async request(endpoint: string, options: any = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const response = await axios.get(url, {
      headers: { ...this.headers, ...options.headers },
      ...options,
    });
    return response.data;
  }
}

